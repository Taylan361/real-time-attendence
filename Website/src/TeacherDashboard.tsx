import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { TeacherCalendar } from './TeacherCalendar';
// Bu dosyalar sende varsa kalsın, yoksa hata verebilir, yorum satırına alabilirsin.
import { TeacherCourses } from './TeacherCourses';
import { 
  addAnnouncementToFirebase, 
  registerStudentToCourse, 
  addAssignmentToFirebase, 
  getStudentsByCourse,
  gradeAssignment,
  toggleAttendanceSession,
  listenToRealTimeAttendance,
  listenToRealTimeAssignments,
  createNewAssignment,
  getStudentAttendanceHistory,
  markStudentPresent
} from './DataManager';

// Firebase importları
import { db } from './firebase';
import { doc, getDoc } from "firebase/firestore";

interface TeacherDashboardProps {
  onLogout: () => void;
  currentUserEmail: string;
}

interface Student {
  id: number | string;
  name: string;
  status: 'present' | 'absent' | 'late';
}

const COURSES_DB: Record<string, { code: string; time: string }> = {
  'Software Validation': { code: 'MATH 401', time: 'Tue/Thu 14:00' },
  'Database Management': { code: 'CS 101', time: 'Mon/Wed 10:00' },
  'Operating Systems': { code: 'CS 302', time: 'Fri 09:00' },
  'Calculus I': { code: 'MAT 101', time: 'Mon 09:00' },
  'Physics': { code: 'PHY 101', time: 'Wed 13:00' },
  'Artificial Intelligence': { code: 'AI 404', time: 'Fri 14:00' },
  'Web Development': { code: 'CS 202', time: 'Tue 10:00' },
};

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout, currentUserEmail }) => {
  
  // --- STATE YÖNETİMİ ---
  const [activeView, setActiveView] = useState<'dashboard' | 'calendar' | 'courses'| 'assignments'| 'profile'| 'settings'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<any>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  // Müdürün atadığı derslerin listesi
  const [assignedCourseNames, setAssignedCourseNames] = useState<string[]>([]);
  // Modal Görünürlükleri
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  // Form Verileri
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDate, setAssignDate] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  // --- YENİ EKLENEN STATELER ---
  const [courseAssignments, setCourseAssignments] = useState<any[]>([]);
  // Ödev listesi
  const [showGradingModal, setShowGradingModal] = useState(false);       // Notlandırma penceresi
  // Seçili Ders Verileri (Başlangıçta boş)
  const [selectedCourseKey, setSelectedCourseKey] = useState('');
  const [students, setStudents] = useState<Student[]>([]);

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
   title: '',
   dueDate: '',
   description: ''
  }
);
// selectedCourseCodeForDB'den SONRA gelmeli
const selectedCourseCodeForDB = () => {
  return COURSES_DB[selectedCourseKey]?.code || '';
};

const handleStudentClick = async (student: any) => {
  console.log("Öğrenciye tıklandı:", student.name);
  setSelectedStudentForHistory(student);
  setShowHistoryModal(true);
  setIsHistoryLoading(true);

  // Artık selectedCourseCodeForDB yukarıda tanımlı olduğu için hata vermez
  const courseCode = selectedCourseCodeForDB();

  const history = await getStudentAttendanceHistory(student.id.toString(), courseCode);
  setAttendanceHistory(history);
  setIsHistoryLoading(false);
};
  // --- FIREBASE VERİ ÇEKME ---
  useEffect(() => {
    const fetchAssignedCourses = async () => {
      setLoading(true);
      try {
        if (!currentUserEmail) return;

        const docRef = doc(db, "teachers", currentUserEmail);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          
          const myCourses = data.assignedCourses || []; // Örn: ['Software Validation', 'Physics']
          
          setAssignedCourseNames(myCourses);

          // Eğer öğretmene atanmış ders varsa, ilkini otomatik seç
          if (myCourses.length > 0) {
            // Atanan ders bizim COURSES_DB'de tanımlı mı diye kontrol et (Hata almamak için)
            const firstValidCourse = myCourses.find((c: string) => COURSES_DB[c]);
            
            if (firstValidCourse) {
              setSelectedCourseKey(firstValidCourse);
            } else if (myCourses.length > 0) {
              // Veritabanında var ama COURSES_DB'de tanımı yoksa (Fallback)
              console.warn("Ders atandı ama içerik mock datasında yok:", myCourses[0]);
              // Yine de state'e atayalım, boş liste gösteririz
              setSelectedCourseKey(myCourses[0]);
            }
          }
        }
      } catch (error) {
        console.error("Ders verisi çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedCourses();
  }, [currentUserEmail]);

  // --- 2. GERÇEK ÖĞRENCİLERİ VE CANLI ÖDEVLERİ ÇEKME ---
  useEffect(() => {
    const code = selectedCourseCodeForDB(); // Örn: "MATH 401"
    if (!code) return;

    // A) ÖĞRENCİLERİ GETİR (Burası aynı kalıyor)
    const fetchStudents = async () => {
      try {
        const realStudents = await getStudentsByCourse(code);
        if (realStudents.length > 0) {
          const formattedStudents = realStudents.map((s: any) => ({
            id: s.studentId || s.id || "Bilinmiyor",
            name: (s.name || "") + ' ' + (s.surname || ""),
            status: 'absent' 
          }));
          // @ts-ignore
          setStudents(formattedStudents);
        } 
        }
       catch (err) {
        console.error("Öğrenci yükleme hatası:", err);
      }
    };
    fetchStudents();

    // B) CANLI ÖDEV DİNLEME (BURASI DEĞİŞTİ 🔴)
    // Artık 'fetch' değil 'listen' kullanıyoruz.
    const unsubscribeAssignments = listenToRealTimeAssignments((allAssignments) => {
        // Gelen tüm ödevleri, şu anki derse göre filtrele
        // @ts-ignore
        const filtered = allAssignments.filter((a: any) => 
            a.courseCode && a.courseCode.trim().toUpperCase() === code.trim().toUpperCase()
        );
        setCourseAssignments(filtered);
    });
    // Cleanup: Sayfa değişirse dinlemeyi durdur
    return () => {
        unsubscribeAssignments();
    };

  }, [selectedCourseKey, assignedCourseNames]); // assignedCourseNames eklendi ki ilk açılışta tetiklensin
  
  // --- 3. CANLI YOKLAMA DİNLEME (REAL-TIME LISTENER) ---
  useEffect(() => {
    const code = selectedCourseCodeForDB();
    if (!code) return;

    // DataManager'daki dinleyiciyi başlat
    // Veritabanına yeni bir 'present' kaydı düştüğünde burası çalışır
    const unsubscribe = listenToRealTimeAttendance(code, (presentStudentIds) => {
        
        setStudents(prevStudents => prevStudents.map(student => {
            
            // Eğer öğrencinin ID'si gelen listede varsa durumunu 'present' yap
            if (presentStudentIds.includes(student.id.toString())) {
                return { ...student, status: 'present' };
            }
            return student;
        }));
    });

    // Sayfa değişirse dinlemeyi durdur (Performans için)
    return () => unsubscribe();
  
  }, [selectedCourseKey]);
  // İstatistikler
  const totalStudents = students.length;
  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const lateCount = students.filter(s => s.status === 'late').length;
  const attendanceRate = totalStudents > 0 ? Math.round(((presentCount + (lateCount * 0.5)) / totalStudents) * 100) : 0;
  // --- FONKSİYONLAR ---
const handleStatusChange = (id: number | string, newStatus: 'present' | 'absent' | 'late') => {
    setStudents(prev => prev.map(student => student.id === id ? { ...student, status: newStatus } : student));
  };
  const markAllPresent = () => { setStudents(prev => prev.map(s => ({ ...s, status: 'present' }))); };
  const handleSaveAnnouncement = async () => {
    if (!announceTitle || !selectedCourseCodeForDB()) {
      alert("Lütfen başlık giriniz.");
      return;
    }
    await addAnnouncementToFirebase({
      courseCode: selectedCourseCodeForDB(),
      title: announceTitle,
      content: announceContent,
      date: new Date().toLocaleDateString(),
      priority: 'normal'
    });
    setShowAnnounceModal(false);
    setAnnounceTitle('');
    setAnnounceContent('');
    alert("Duyuru yayınlandı!");
  };

const handleToggleSession = async () => {
    const newState = !isSessionActive;
    
    if (!newState) { 
        const confirmSave = window.confirm("Yoklamayı bitirip verileri kaydetmek istiyor musunuz?");
        
        if (confirmSave) {
            const courseCode = selectedCourseCodeForDB();
            
            // VAR veya GEÇ olan herkesi filtrele
            const attendingStudents = students.filter(s => s.status === 'present' || s.status === 'late');
            
            for (const student of attendingStudents) {
                // Burada student.status bilgisini de gönderebilirsin (DataManager'da destekliyorsa)
                await markStudentPresent(student.id.toString(), courseCode);
            }
            alert(`✅ ${attendingStudents.length} öğrencinin katılım verisi işlendi.`);
        }
    }

    await toggleAttendanceSession(selectedCourseCodeForDB(), newState);
    setIsSessionActive(newState);
};
const TeacherProfilePage = () => {
    return (
        <div className="profile-container animate-page-enter" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            {/* Üst Kimlik Kartı */}
            <div className="profile-header-card" style={{ 
                background: '#4b2e83', borderRadius: '16px', padding: '40px 20px', 
                textAlign: 'center', color: 'white', boxShadow: '0 10px 30px rgba(75, 46, 131, 0.2)',
                marginBottom: '30px', position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
                
                <div className="profile-avatar-large" style={{ 
                    width: '100px', height: '100px', background: 'white', color: '#4b2e83', 
                    fontSize: '2.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', borderRadius: '50%', margin: '0 auto 15px', border: '4px solid rgba(255,255,255,0.3)'
                }}>
                    {currentUserEmail.charAt(0).toUpperCase()}
                </div>
                
                <h2 style={{ margin: '0 0 5px', fontSize: '1.8rem', fontWeight: '600' }}>{currentUserEmail.split('@')[0]}</h2>
                <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.85rem' }}>
                    👨‍🏫 Akademisyen / Öğretim Görevlisi
                </div>
            </div>

            {/* Bilgi Kutuları */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="modern-card" style={{ padding: '20px', textAlign: 'left' }}>
                    <label style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '5px' }}>E-Posta Adresi</label>
                    <div style={{ fontWeight: '600', color: '#333', fontSize: '1rem' }}>{currentUserEmail}</div>
                </div>

                <div className="modern-card" style={{ padding: '20px', textAlign: 'left' }}>
                    <label style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '5px' }}>Ünvan</label>
                    <div style={{ fontWeight: '600', color: '#333', fontSize: '1.1rem' }}>Doktor Öğretim Üyesi</div>
                </div>

                <div className="modern-card" style={{ padding: '20px', textAlign: 'left', gridColumn: 'span 2' }}>
                    <label style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '5px' }}>Atanmış Dersler ({assignedCourseNames.length})</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                        {assignedCourseNames.map(course => (
                            <span key={course} style={{ background: '#f0edff', color: '#4b2e83', padding: '5px 12px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                {course}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="modern-card" style={{ padding: '20px', textAlign: 'left' }}>
                    <label style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '5px' }}>Fakülte</label>
                    <div style={{ fontWeight: '600', color: '#333', fontSize: '1.1rem' }}>Mühendislik Fakültesi</div>
                </div>

                <div className="modern-card" style={{ padding: '20px', textAlign: 'left' }}>
                    <label style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '5px' }}>Ofis No</label>
                    <div style={{ fontWeight: '600', color: '#333', fontSize: '1.1rem' }}>B-204 / Teknik Bina</div>
                </div>
            </div>

            <button className="primary-black-btn" style={{ marginTop: '30px', width: '100%', padding: '15px' }} onClick={() => setActiveView('dashboard')}>
                Panele Geri Dön
            </button>
        </div>
    );
};
const SettingsPage = () => {
    // Ayarlar için yerel state (tıklanabilir olması için)
    const [settings, setSettings] = useState({
        emailNotif: true,
        announceNotif: true,
        darkMode: false
    });

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="settings-container animate-page-enter">
            <h2 style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>⚙️</span> Sistem Ayarları
            </h2>

            <div className="setting-group modern-card" style={{ padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px', marginBottom: '15px' }}>Bildirim Tercihleri</h3>
                
                {/* E-POSTA SWITCH */}
                <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div className="setting-info">
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>E-Posta Bildirimleri</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Yeni ödev eklendiğinde mail al.</p>
                    </div>
                    <div 
                        onClick={() => toggleSetting('emailNotif')}
                        style={{
                            width: '45px', height: '24px', borderRadius: '12px',
                            backgroundColor: settings.emailNotif ? '#4b2e83' : '#ccc',
                            position: 'relative', cursor: 'pointer', transition: '0.3s'
                        }}
                    >
                        <div style={{
                            width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%',
                            position: 'absolute', top: '3px', left: settings.emailNotif ? '24px' : '3px', transition: '0.3s'
                        }}></div>
                    </div>
                </div>

                {/* DUYURU SWITCH */}
                <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="setting-info">
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Duyuru Bildirimleri</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Hoca duyuru yapınca anlık bildirim al.</p>
                    </div>
                    <div 
                        onClick={() => toggleSetting('announceNotif')}
                        style={{
                            width: '45px', height: '24px', borderRadius: '12px',
                            backgroundColor: settings.announceNotif ? '#4b2e83' : '#ccc',
                            position: 'relative', cursor: 'pointer', transition: '0.3s'
                        }}
                    >
                        <div style={{
                            width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%',
                            position: 'absolute', top: '3px', left: settings.announceNotif ? '24px' : '3px', transition: '0.3s'
                        }}></div>
                    </div>
                </div>
            </div>

            <div className="setting-group modern-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px', marginBottom: '15px' }}>Görünüm</h3>
                <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="setting-info">
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Karanlık Mod (Dark Mode)</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Göz yormayan karanlık tema.</p>
                    </div>
                    <div 
                        onClick={() => toggleSetting('darkMode')}
                        style={{
                            width: '45px', height: '24px', borderRadius: '12px',
                            backgroundColor: settings.darkMode ? '#222' : '#ccc',
                            position: 'relative', cursor: 'pointer', transition: '0.3s'
                        }}
                    >
                        <div style={{
                            width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%',
                            position: 'absolute', top: '3px', left: settings.darkMode ? '24px' : '3px', transition: '0.3s'
                        }}></div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="secondary-btn" onClick={() => setActiveView('dashboard')}>İptal</button>
                <button className="primary-black-btn" onClick={() => { alert('Ayarlar Başarıyla Güncellendi!'); setActiveView('dashboard'); }}>Değişiklikleri Kaydet</button>
            </div>
        </div>
    );
};
  const handleAddStudent = async () => {
    if (!newStudentId) {
      alert("Lütfen öğrenci numarası giriniz.");
      return;
    }
    await registerStudentToCourse(newStudentId, selectedCourseCodeForDB());
    setShowAddStudentModal(false);
    setNewStudentId('');
    alert("Öğrenci derse eklendi (Simülasyon)");
  };
  // --- ÖDEV KAYDETME İŞLEMİ (GÜNCELLENDİ) ---
  const handleSaveAssignment = async () => {
    // 1. Kontrol: Başlık veya tarih boş mu?
    if (!assignTitle || !assignDate) {
      alert("Lütfen ödev başlığı ve teslim tarihini giriniz.");
      return;
    }

    // 2. Kontrol: Bir ders seçili mi?
    const currentCourseCode = selectedCourseCodeForDB();
    if (!currentCourseCode) {
        alert("Lütfen önce bir ders seçiniz.");
        return;
    }

    // 3. Firebase'e Kaydet
    const result = await addAssignmentToFirebase({
      courseCode: currentCourseCode,
      title: assignTitle,
      dueDate: assignDate
    });
    if (result.success) {
      alert("✅ Ödev başarıyla oluşturuldu ve sisteme kaydedildi!");
      setShowAssignModal(false);
      // Modalı kapat
      setAssignTitle('');        // Formu temizle
      setAssignDate('');
    } else {
      alert("❌ Hata oluştu. Lütfen tekrar deneyin.");
    }
  };
  const handleCourseSelection = (courseName: string) => {
    setSelectedCourseKey(courseName);
    setActiveView('dashboard');
  };

  // --- DASHBOARD İÇERİĞİ ---
  const renderDashboardContent = () => (
    <div className="fade-in">
      {/* HEADER & COURSE SELECTOR */}
      <div className="teacher-blue-header" style={{ marginBottom: '25px' }}>
        <div className="blue-header-content">
          <h3>{selectedCourseKey}</h3>
          <div className="blue-tags">
            {COURSES_DB[selectedCourseKey] ? (
              <>
                <span className="blue-tag">{COURSES_DB[selectedCourseKey].code}</span>
                <span className="blue-tag">{COURSES_DB[selectedCourseKey].time}</span>
                <span className="blue-tag">{totalStudents} Students</span>
              </>
            ) : (
              <span className="blue-tag">Detay Yok</span>
            )}
          </div>
        </div>
        
        {/* SADECE ATANMIŞ DERSLERİ GÖSTEREN SEÇİM KUTUSU */}
        <div className="course-selector-wrapper">
            <label style={{color:'white', fontSize:'0.8rem', display:'block', marginBottom:'5px', opacity:0.8}}>Aktif Ders:</label>
            <select className="header-course-select" value={selectedCourseKey} onChange={(e) => setSelectedCourseKey(e.target.value)}>
               {assignedCourseNames.map(courseName => (
                <option key={courseName} value={courseName}>{courseName}</option>
              ))}
            </select>
        </div>
      </div>

      {/* ATTENDANCE SECTION */}
      <div className="section-card">
        <div className="card-header">
          <h3>Yoklama Kontrolü</h3>
          <div className="header-actions">
            <button className="secondary-btn" onClick={() => setShowAddStudentModal(true)} style={{marginRight:'10px'}}>+ Öğrenci Ekle</button>
            <button className="secondary-btn" onClick={markAllPresent}>Tümünü 'Var' Say</button>
            <button className="primary-black-btn">▶ Dersi Başlat</button>
            <button 
    className={isSessionActive ? "primary-black-btn" : "secondary-btn"} 
    onClick={handleToggleSession}
    style={{backgroundColor: isSessionActive ? '#d32f2f' : '', color: isSessionActive ? 'white' : ''}}
>
    {isSessionActive ? "⏹ Yoklamayı Bitir" : "📡 Yoklamayı Başlat"}
</button>
          </div>
        </div>
        <div className="attendance-stats">
          <div className="att-box total"><span>👥 Toplam</span><strong>{totalStudents}</strong></div>
          <div className="att-box present"><span>✅ Var</span><strong>{presentCount}</strong></div>
          <div className="att-box absent"><span>❌ Yok</span><strong>{absentCount}</strong></div>
          <div className="att-box late"><span>⏰ Geç</span><strong>{lateCount}</strong></div>
          <div className="att-box rate"><span>📊 Oran</span><strong>%{attendanceRate}</strong></div>
        </div>
        <div className="student-list">
          {students.length === 0 ? (
             <p style={{padding:'20px', color:'#999', textAlign:'center'}}>Bu derse kayıtlı öğrenci yok veya ders seçilmedi.</p>
          ) : (
            students.map((student: any) => (
  <div 
    key={student.id} 
    className="student-row" 
    style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '12px 20px', 
      borderBottom: '1px solid #eee',
      transition: '0.2s'
    }}
  >
    {/* Sol Taraf: Öğrenci İsmi ve id*/}
<span 
  onClick={() => handleStudentClick(student)} 
  style={{ 
    cursor: 'pointer', 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column', // İsim ve ID'yi alt alta dizer
    gap: '2px' 
  }}
>
  <span style={{ fontWeight: '500', color: '#333' }}>
    {student.name}
  </span>
  <span style={{ 
    fontSize: '0.75rem', 
    color: '#888', 
    fontWeight: '400',
  
  }}>
    {student.id}
  </span>
</span>

    {/* Sağ Taraf: Yan Yana Renkli Butonlar */}
<div style={{ display: 'flex', gap: '5px' }}>
  {/* VAR Butonu */}
  <button
    disabled={!isSessionActive} // Yoklama aktif değilse tıklanamaz
    onClick={() => handleStatusChange(student.id, 'present')}
    style={{
      padding: '6px 12px',
      borderRadius: '6px',
      border: 'none',
      cursor: isSessionActive ? 'pointer' : 'not-allowed', // İmleç değişimi
      fontSize: '0.75rem',
      fontWeight: 'bold',
      // Yoklama kapalıyken gri, açıkken kendi rengi
      backgroundColor: !isSessionActive ? '#e0e0e0' : (student.status === 'present' ? '#2ecc71' : '#f0f0f0'),
      color: !isSessionActive ? '#a0a0a0' : (student.status === 'present' ? 'white' : '#888'),
      transition: '0.3s',
      opacity: !isSessionActive ? 0.7 : 1
    }}
  >
    VAR
  </button>

  {/* GEÇ Butonu */}
  <button
    disabled={!isSessionActive}
    onClick={() => handleStatusChange(student.id, 'late')}
    style={{
      padding: '6px 12px',
      borderRadius: '6px',
      border: 'none',
      cursor: isSessionActive ? 'pointer' : 'not-allowed',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      backgroundColor: !isSessionActive ? '#e0e0e0' : (student.status === 'late' ? '#f1c40f' : '#f0f0f0'),
      color: !isSessionActive ? '#a0a0a0' : (student.status === 'late' ? 'white' : '#888'),
      transition: '0.3s',
      opacity: !isSessionActive ? 0.7 : 1
    }}
  >
    GEÇ
  </button>

  {/* YOK Butonu */}
  <button
    disabled={!isSessionActive}
    onClick={() => handleStatusChange(student.id, 'absent')}
    style={{
      padding: '6px 12px',
      borderRadius: '6px',
      border: 'none',
      cursor: isSessionActive ? 'pointer' : 'not-allowed',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      backgroundColor: !isSessionActive ? '#e0e0e0' : (student.status === 'absent' ? '#e74c3c' : '#f0f0f0'),
      color: !isSessionActive ? '#a0a0a0' : (student.status === 'absent' ? 'white' : '#888'),
      transition: '0.3s',
      opacity: !isSessionActive ? 0.7 : 1
    }}
  >
    YOK
  </button>
    </div>
  </div>
))
          )}
        </div>
      </div>

      {/* ANNOUNCEMENTS & ASSIGNMENTS */}
      <div className="content-grid" style={{marginTop: '25px'}}>
        <div className="section-card">
          <div className="card-header"><h3>Duyurular</h3><span className="icon-btn">📢</span></div>
          <button className="full-width-black-btn" onClick={() => setShowAnnounceModal(true)}>+ Yeni Duyuru</button>
          <div className="announcement-item"><div className="ann-badge high">Önemli</div><h4>Vize Sınav Takvimi</h4><p>Vize sınavı 25 Kasım saat 09:00'da yapılacaktır.</p></div>
        </div>
        <div className="section-card">
          <div className="card-header"><h3>Ödevler</h3><span className="icon-btn">📝</span></div>
          <div style={{display:'flex', gap:'5px', marginBottom:'10px'}}>
            <button className="secondary-btn" onClick={() => setShowGradingModal(true)}>🔍 Notlandır</button>
          </div>
          <div className="teacher-assignment-item"><h4>Birim Testi Lab Çalışması</h4><div className="progress-bar-bg"><div className="progress-fill" style={{width: '100%', backgroundColor: 'black'}}></div></div><div style={{display:'flex', justifyContent:'space-between', fontSize:'0.8rem', marginTop:'5px'}}><span>Teslim: 10/42</span><span style={{color:'green', fontWeight:'bold'}}>Aktif</span></div></div>
        </div>
      </div>
      <div className="teacher-assignment-item"><h4>Aktif Ödev Sayısı: {courseAssignments.length}</h4></div>
    </div>
  );

const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return renderDashboardContent();
      case 'calendar': return <TeacherCalendar />;
      case 'profile': return <TeacherProfilePage />;
      case 'settings': return <SettingsPage />;
      case 'courses': return <TeacherCourses onSelectCourse={handleCourseSelection} 
    assignedCourseNames={assignedCourseNames} // Bu satırı ekle!
  />;
      case 'assignments': return renderAssignmentsContent(); // <-- Burayı ekledik
      default: return renderDashboardContent();
    }
  };


  const renderAssignmentsContent = () => {
    return (
      <div className="section-card animate-page-enter">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{margin:0}}>Ödev Yönetimi</h2>
            <p style={{margin:0, color:'#666', fontSize:'0.9rem'}}>{selectedCourseCodeForDB()} dersi ödevleri</p>
          </div>
          <button 
            className="primary-black-btn" 
            onClick={() => setShowCreateModal(true)}
            style={{ padding: '10px 20px', fontSize: '0.9rem' }}
          >
            ➕ Yeni Ödev Yayınla
          </button>
        </div>

        {/* ÖDEV LİSTESİ */}
        <div className="assignment-list-container">
          {courseAssignments.length === 0 ? (
            <div style={{textAlign:'center', padding:'40px', color:'#999'}}>Henüz ödev oluşturulmamış.</div>
          ) : (
            courseAssignments.map((assign: any) => (
              <div key={assign.id} className="assignment-item-row" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '15px', borderBottom: '1px solid #eee'
              }}>
                <div>
                  <h4 style={{margin:0}}>{assign.title}</h4>
                  <small>{assign.dueDate} • {assign.status === 'graded' ? '✅ Notlandı' : '⏳ Bekliyor'}</small>
                </div>
                <button className="view-btn" onClick={() => { /* Notlandırma Modalını açan fonksiyon */ setShowGradingModal(true); }}>
                   {assign.status === 'graded' ? 'Notu Gör' : 'Notlandır'}
                </button>
              </div>
            ))
          )}
        </div>

        {/* C ŞIKKI: YENİ ÖDEV OLUŞTURMA MODALI (TAM VERSİYON) */}
{showCreateModal && (
  <div className="modal-overlay">
    <div className="modal-content" style={{ maxWidth: '550px' }}>
      <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>📝 Yeni Ödev Yayınla</h3>
      
      <div style={{ marginTop: '20px' }}>
        {/* BAŞLIK */}
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ödev Başlığı</label>
        <input 
          type="text" 
          placeholder="Örn: Proje Taslak Raporu"
          className="form-input"
          onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '15px' }}
        />

        {/* TARİH */}
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Son Teslim Tarihi</label>
        <input 
          type="date" 
          className="form-input"
          onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '15px' }}
        />

        {/* AÇIKLAMA (EKSİK OLAN KISIM BURASIYDI) */}
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ödev Talimatları / Açıklama</label>
        <textarea 
          placeholder="Öğrencilerin ne yapması gerektiğini detaylıca yazın..."
          rows={5}
          className="form-input"
          onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
          style={{ 
            width: '100%', 
            padding: '10px', 
            borderRadius: '6px', 
            border: '1px solid #ddd', 
            marginBottom: '15px',
            fontFamily: 'inherit',
            resize: 'vertical' 
          }}
        ></textarea>
      </div>

      <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #eee', paddingTop: '15px' }}>
        <button className="secondary-btn" onClick={() => setShowCreateModal(false)}>İptal</button>
        <button 
          className="primary-black-btn" 
          onClick={async () => {
            if(!newAssignment.title || !newAssignment.dueDate) {
                return alert("Lütfen en azından bir başlık ve tarih belirleyin!");
            }

            const payload = {
                ...newAssignment,
                courseCode: selectedCourseCodeForDB(),
                type: 'Assignment',
                status: 'todo' // Başlangıç durumu
            };

            const res = await createNewAssignment(payload);
            if(res.success) {
                setShowCreateModal(false);
                setNewAssignment({ title: '', dueDate: '', description: '' }); // Formu temizle
                alert("🚀 Ödev ve yönergeler başarıyla yayınlandı!");
            } else {
                alert("Bir hata oluştu, lütfen tekrar deneyin.");
            }
          }}
        >
          Ödevi Yayınla
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    );
  };
  if (loading) {
    return <div className="dashboard-layout" style={{display:'flex', justifyContent:'center', alignItems:'center'}}><h3>Dersleriniz Yükleniyor...</h3></div>;
  }
  if (assignedCourseNames.length === 0) {
    return (
      <div className="dashboard-layout">
        <aside className="sidebar">
            <div className="sidebar-logo"><div className="logo-icon">🎓</div><h2>UniPortal</h2></div>
            <div className="sidebar-footer"><button onClick={onLogout} className="logout-btn">Çıkış Yap</button></div>
        </aside>
        <main className="main-content" style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
            <div style={{textAlign:'center', padding:'50px', backgroundColor:'white', borderRadius:'15px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)'}}>
                <span style={{fontSize:'3rem'}}>📭</span>
                <h2 style={{margin:'20px 0'}}>Henüz Atanmış Bir Dersiniz Yok</h2>
                <p style={{color:'#666'}}>Sistemde derslerinizi göremiyorsanız lütfen okul müdürü veya idare ile iletişime geçin.</p>
                <div style={{marginTop:'20px', padding:'10px', backgroundColor:'#f9f9f9', borderRadius:'5px', fontSize:'0.9rem'}}>
                    <strong>Giriş yapan hesap:</strong> {currentUserEmail}
                </div>
            </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo"><div className="logo-icon">🎓</div><h2>UniPortal</h2></div>
        
        <nav className="sidebar-menu">
          <div className={`menu-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>
            <span className="icon">🏠</span> Panel
          </div>
          <div className={`menu-item ${activeView === 'courses' ? 'active' : ''}`} onClick={() => setActiveView('courses')}>
            <span className="icon">📘</span> Derslerim
          </div>
          <div className={`menu-item ${activeView === 'assignments' ? 'active' : ''}`} onClick={() => setActiveView('assignments')}>
            <span className="icon">📝</span> Ödev Yönetimi
          </div>
          <div className={`menu-item ${activeView === 'calendar' ? 'active' : ''}`} onClick={() => setActiveView('calendar')}>
            <span className="icon">📅</span> Takvim
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={onLogout} className="logout-btn">🚪 Çıkış</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="page-title-group"><h2>Akademisyen Portalı</h2><p>Derslerinizi ve yoklamaları buradan yönetin</p></div>
          <div className="user-profile">
            {/* Profil Resmi ve Menü */}
<div className="user-info" style={{position: 'relative', cursor: 'pointer'}} onClick={() => setShowUserMenu(!showUserMenu)}>
    <div className="details">
        <span className="u-name">{currentUserEmail.split('@')[0]}</span>
        <span className="u-role">Öğretmen</span>
    </div>
    <div className="avatar" style={{ border: showUserMenu ? '2px solid #4b2e83' : '2px solid transparent', transition: '0.3s' }}>
        {currentUserEmail.charAt(0).toUpperCase()}
    </div>

    {showUserMenu && (
        <div className="dropdown-panel profile-dropdown modern-menu" onClick={(e) => e.stopPropagation()} style={{
            position: 'absolute', top: '60px', right: '0', width: '260px', 
            backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            padding: '15px', border: '1px solid #eee', zIndex: 1000
        }}>
            {/* Üst Kısım: Küçük Kullanıcı Kartı */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '15px', borderBottom: '1px solid #f5f5f5', marginBottom: '10px' }}>
                <div className="avatar" style={{ width: '45px', height: '45px', fontSize: '1.2rem', backgroundColor: '#4b2e83', color: 'white' }}>
                    {currentUserEmail.charAt(0).toUpperCase()}
                </div>
                <div style={{ textAlign: 'left' }}>
                    <h5 style={{ margin: 0, fontSize: '0.95rem', color: '#333' }}>{currentUserEmail.split('@')[0]}</h5>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Akademisyen</p>
                </div>
            </div>

            {/* Menü Linkleri */}
            <div className="profile-menu-item" onClick={() => { setActiveView('profile' as any); setShowUserMenu(false); }} 
                 style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', transition: '0.2s', cursor: 'pointer' }}>
                <span style={{ fontSize: '1.1rem' }}>👤</span> 
                <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>Profilim</div>
                    <div style={{ fontSize: '0.7rem', color: '#999' }}>Akademik bilgilerini gör</div>
                </div>
            </div>
            <div className="profile-menu-item" onClick={() => { setActiveView('settings'); setShowUserMenu(false); }}
                 style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', transition: '0.2s' }}>
                <span style={{ fontSize: '1.1rem' }}>⚙️</span> 
                <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>Ayarlar</div>
                    <div style={{ fontSize: '0.7rem', color: '#999' }}>Uygulama tercihleri</div>
                </div>
            </div>

            <div style={{ height: '1px', background: '#f5f5f5', margin: '10px 0' }}></div>

            <div className="profile-menu-item logout" onClick={(e) => { e.stopPropagation(); onLogout(); }}
                 style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', color: '#d32f2f', cursor: 'pointer' }}>
                <span style={{ fontSize: '1.1rem' }}>🚪</span> 
                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Güvenli Çıkış</span>
            </div>
        </div>
    )}
</div>
          </div>
        </header>

        {renderContent()}

        {/* --- MODALS --- */}

        {/* 1. DUYURU MODALI */}
        {showAnnounceModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>📢 Duyuru Yayınla</h3>
              <div className="form-group">
                <label>Başlık</label>
                <input type="text" className="modal-input" placeholder="Örn: Sınav Tarihleri" value={announceTitle} onChange={(e) => setAnnounceTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label>İçerik</label>
                <textarea className="modal-input" rows={4} placeholder="Detayları buraya yazın..." value={announceContent} onChange={(e) => setAnnounceContent(e.target.value)}></textarea>
              </div>
              <div className="modal-actions">
                <button className="secondary-btn" onClick={() => setShowAnnounceModal(false)}>İptal</button>
                <button className="primary-black-btn" onClick={handleSaveAnnouncement}>Yayınla</button>
              </div>
            </div>
          </div>
        )}

        {/* 2. ÖDEV MODALI */}
        {showAssignModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>📝 Ödev Oluştur</h3>
              <div className="form-group">
                <label>Başlık</label>
                <input type="text" className="modal-input" placeholder="Örn: Final Projesi" value={assignTitle} onChange={(e) => setAssignTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Son Teslim</label>
                <input type="date" className="modal-input" value={assignDate} onChange={(e) => setAssignDate(e.target.value)} />
              </div>
              <div className="modal-actions">
                <button className="secondary-btn" onClick={() => setShowAssignModal(false)}>İptal</button>
                <button className="primary-black-btn" onClick={handleSaveAssignment}>Oluştur</button>
              </div>
            </div>
          </div>
        )}

        {/* 3. ÖĞRENCİ EKLEME MODALI */}
        {showAddStudentModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>👤 Derse Öğrenci Ekle</h3>
              <p style={{marginBottom: '15px', color:'#666', fontSize:'0.9rem'}}>
                Eklenen Ders: <strong>{selectedCourseKey}</strong>
              </p>
              <div className="form-group">
                <label>Öğrenci Numarası</label>
                <input type="text" className="modal-input" placeholder="Örn: 220706010" value={newStudentId} onChange={(e) => setNewStudentId(e.target.value)} />
              </div>
              <div className="modal-actions">
                <button className="secondary-btn" onClick={() => setShowAddStudentModal(false)}>İptal</button>
                <button className="primary-black-btn" onClick={handleAddStudent}>Ekle</button>
              </div>
            </div>
          </div>
        )}
{/* 4. NOTLANDIRMA MODALI (GÜVENLİK KONTROLLÜ) */}
        {showGradingModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{maxWidth:'650px'}}>
              <div style={{borderBottom:'1px solid #eee', paddingBottom:'15px', marginBottom:'15px'}}>
                  <h3 style={{margin:0}}>⚖️ Adil Notlandırma Sistemi</h3>
                  <p style={{margin:'5px 0 0 0', color:'#666', fontSize:'0.9rem'}}>
                      Ders: <strong>{selectedCourseCodeForDB()}</strong> |
                      <span style={{color:'#d32f2f', marginLeft:'5px'}}>
                         ⚠️ İsimler gizlenmiştir (Blind Grading)
                      </span>
                  </p>
              </div>
              
              <div style={{maxHeight:'400px', overflowY:'auto', paddingRight:'5px'}}>
                {courseAssignments.length === 0 ? (
                    <div style={{textAlign:'center', padding:'30px', color:'#999'}}>
                        <span style={{fontSize:'2rem'}}>📭</span>
                        <p>Bu derste henüz değerlendirilecek ödev yok.</p>
                    </div>
                ) : (
                    courseAssignments.map((assign: any) => {
                        const isGraded = assign.status === 'graded';
                        const isSubmitted = assign.status === 'submitted';
                        const displayPoints = isGraded ? assign.points.toString().replace(/\D/g, '') : '';

                        return (
                            <div key={assign.id} style={{
                                backgroundColor: isGraded ? '#f9f9f9' : 'white',
                                border: isGraded ? '1px solid #eee' : '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '15px',
                                marginBottom: '10px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                opacity: isGraded ? 0.7 : 1,
                                transition: 'all 0.3s'
                            }}>
                                {/* SOL TARAFF: Ödev Bilgisi */}
                                <div>
                                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                        <strong style={{fontSize:'1rem', color:'#333'}}>
                                            📄 {assign.title}
                                        </strong>
                                        
                                        {/* --- DURUM ROZETİ (3 Farklı Renk) --- */}
                                        {isGraded ? (
                                            <span style={{fontSize:'0.7rem', padding:'3px 8px', borderRadius:'12px', background:'#e8f5e9', color:'#2e7d32', border:'1px solid #c8e6c9', fontWeight:'bold'}}>
                                                NOTLANDI
                                            </span>
                                        ) : isSubmitted ? (
                                            <span style={{fontSize:'0.7rem', padding:'3px 8px', borderRadius:'12px', background:'#e3f2fd', color:'#1565c0', border:'1px solid #bbdefb', fontWeight:'bold'}}>
                                                TESLİM EDİLDİ
                                            </span>
                                        ) : (
                                            <span style={{fontSize:'0.7rem', padding:'3px 8px', borderRadius:'12px', background:'#fff3e0', color:'#ef6c00', border:'1px solid #ffe0b2', fontWeight:'bold'}}>
                                                BEKLENİYOR
                                            </span>
                                        )}
                                    </div>

                                    <div style={{fontSize:'0.85rem', color:'#666', marginTop:'5px'}}>
                                        Son Teslim: {assign.dueDate} • ID: #{assign.id.substring(0, 6)}...
                                    </div>
                                    
                                    {isGraded && <div style={{fontSize:'0.8rem', color:'#2e7d32', marginTop:'4px'}}>🔒 Not sisteme işlendi.</div>}
                                </div>
                                
                                {/* SAĞ TARAF: Puanlama Alanı */}
                                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                    
                                    {/* SADECE TESLİM EDİLMİŞ VEYA NOTLANMIŞSA GİRİŞ ALANINI GÖSTER */}
                                    {isSubmitted || isGraded ? (
                                        <>
                                            <div style={{position:'relative'}}>
                                                <input 
                                                    id={`grade-${assign.id}`} 
                                                    type="text" 
                                                    placeholder="--" 
                                                    disabled={isGraded} // Notlandıysa kilitli
                                                    defaultValue={displayPoints} 
                                                    style={{
                                                        padding:'8px', 
                                                        width:'60px', 
                                                        textAlign:'center',
                                                        border: isGraded ? '1px solid #ddd' : '2px solid #333',
                                                        borderRadius:'6px',
                                                        fontWeight:'bold',
                                                        fontSize:'1.1rem',
                                                        backgroundColor: isGraded ? '#eee' : 'white',
                                                        color: isGraded ? '#888' : 'black'
                                                    }}
                                                />
                                                <span style={{position:'absolute', right:'-15px', top:'10px', fontSize:'0.8rem', color:'#999'}}>/100</span>
                                            </div>

                                            {!isGraded ? (
                                                <button 
                                                    className="primary-black-btn" 
                                                    style={{fontSize:'0.85rem', padding:'8px 15px', height:'38px'}}
                                                    onClick={async () => {
                                                        const input = document.getElementById(`grade-${assign.id}`) as HTMLInputElement;
                                                        const val = input.value.trim();
                                                        
                                                        if(val && !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100) {
                                                            const result = await gradeAssignment(assign.id, val);
                                                            if (result.success) {
                                                                // State Güncelleme (UI Anında değişsin)
                                                                setCourseAssignments(prev => prev.map(item => 
                                                                    item.id === assign.id ? { ...item, points: val, status: 'graded' } : item
                                                                ));
                                                                alert(`✅ Not Kaydedildi: ${val}`);
                                                            } else {
                                                                alert("❌ Hata oluştu.");
                                                            }
                                                        } else {
                                                            alert("Geçerli bir not girin (0-100).");
                                                        }
                                                    }}
                                                >
                                                    Kaydet
                                                </button>
                                            ) : (
                                                <div style={{width:'80px', textAlign:'center', fontSize:'1.5rem'}}>✅</div>
                                            )}
                                        </>
                                    ) : (
                                        // EĞER ÖĞRENCİ HENÜZ TESLİM ETMEDİYSE
                                        <div style={{
                                            fontSize:'0.85rem', 
                                            color:'#999', 
                                            fontStyle:'italic', 
                                            padding:'10px', 
                                            background:'#f5f5f5', 
                                            borderRadius:'5px'
                                        }}>
                                            ⏳ Öğrenci henüz teslim etmedi
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
              </div>

              <div className="modal-actions" style={{marginTop:'20px', borderTop:'1px solid #eee', paddingTop:'15px'}}>
                <button className="secondary-btn" onClick={() => setShowGradingModal(false)}>Kapat</button>
              </div>
            </div>
          </div>
        )}
{showHistoryModal && selectedStudentForHistory && (
  <div className="modal-overlay">
    <div className="modal-content" style={{ maxWidth: '500px' }}>
      <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>📊 Katılım Geçmişi: {selectedStudentForHistory.name}</h3>
      </div>

      {isHistoryLoading ? (
        <p style={{ textAlign: 'center', padding: '20px' }}>Veriler yükleniyor...</p>
      ) : (
        <div style={{ marginTop: '10px' }}>
          <h4 style={{ marginBottom: '15px', color: '#666' }}>{selectedCourseCodeForDB()} Kayıtları</h4>
          
          {attendanceHistory.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px' }}>
              <p>Bu öğrenci için henüz geçmiş kayıt bulunamadı.</p>
            </div>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {attendanceHistory.map((record, i) => (
                <div key={i} style={{ 
                  display: 'flex', justifyContent: 'space-between', padding: '12px', 
                  borderBottom: '1px solid #eee', alignItems: 'center' 
                }}>
                  <span style={{ fontSize: '0.9rem' }}>📅 {record.date}</span>
                  <span style={{ 
                    fontSize: '0.75rem', padding: '4px 10px', borderRadius: '4px',
                    backgroundColor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold'
                  }}>
                    KATILDI
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <button className="primary-black-btn" onClick={() => setShowHistoryModal(false)}>Kapat</button>
      </div>
    </div>
  </div>
)}
      </main>
    </div>
  );
};
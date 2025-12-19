import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { TeacherCalendar } from './TeacherCalendar'; // Bu dosyalar sende varsa kalsın, yoksa hata verebilir, yorum satırına alabilirsin.
import { TeacherCourses } from './TeacherCourses';
import { 
  addAnnouncementToFirebase, 
  registerStudentToCourse, 
  addAssignmentToFirebase, 
  getStudentsByCourse,          // <-- YENİ
  gradeAssignment,              // <-- YENİ
  toggleAttendanceSession, // <-- YENİ
  listenToRealTimeAttendance,
  listenToRealTimeAssignments
} from './DataManager';
import { injectSampleData } from './DataManager'; // <-- Bunu ekle


// Firebase importları
import { db } from './firebase';
import { doc, getDoc } from "firebase/firestore";

interface TeacherDashboardProps {
  onLogout: () => void;
  currentUserEmail: string; // Hangi öğretmenin giriş yaptığını bilmemiz lazım
}

interface Student {
  id: number | string; // <-- "number" yerine "number | string" yaptık
  name: string;
  status: 'present' | 'absent' | 'late';
}

// MOCK DATABASE (Ders içerikleri burada duruyor, ama erişim yetkiye göre olacak)
const COURSES_DB: Record<string, { code: string; time: string; students: Student[] }> = {
  'Software Validation': {
    code: 'MATH 401',
    time: 'Tue/Thu 14:00',
    students: [
      { id: 2024006, name: 'Öykü Şahin', status: 'absent' },
      { id: 2024007, name: 'Kaan Gündüz', status: 'present' },
      { id: 2024008, name: 'Doğukan Gökdemir', status: 'present' },
      { id: 2024009, name: 'Ceren Tuncer', status: 'late' },
    ]
  },
  'Database Management': {
    code: 'CS 101',
    time: 'Mon/Wed 10:00',
    students: [
      { id: 2024010, name: 'Hasan Yanık', status: 'present' },
      { id: 2024011, name: 'Ali Yılmaz', status: 'present' },
      { id: 2024012, name: 'Ayşe Demir', status: 'present' },
      { id: 2024013, name: 'Mehmet Öz', status: 'absent' },
      { id: 2024014, name: 'Zeynep Kaya', status: 'present' },
    ]
  },
  'Operating Systems': {
    code: 'CS 302',
    time: 'Fri 09:00',
    students: [
      { id: 2024020, name: 'Ahmet Yılmaz', status: 'present' },
      { id: 2024021, name: 'Burak Can', status: 'late' },
    ]
  },
  // Müdür panelindeki isimlerle buradakilerin EŞLEŞMESİ lazım.
  'Calculus I': { code: 'MAT 101', time: 'Mon 09:00', students: [] },
  'Physics': { code: 'PHY 101', time: 'Wed 13:00', students: [] },
  'Artificial Intelligence': { code: 'AI 404', time: 'Fri 14:00', students: [] },
  'Web Development': { code: 'CS 202', time: 'Tue 10:00', students: [] },
};

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout, currentUserEmail }) => {
  
  // --- STATE YÖNETİMİ ---
  const [activeView, setActiveView] = useState<'dashboard' | 'calendar' | 'courses'>('dashboard');
  const [loading, setLoading] = useState(true);
  
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
  const [courseAssignments, setCourseAssignments] = useState<any[]>([]); // Ödev listesi
  const [showGradingModal, setShowGradingModal] = useState(false);       // Notlandırma penceresi
  // Seçili Ders Verileri (Başlangıçta boş)
  const [selectedCourseKey, setSelectedCourseKey] = useState('');
  const [students, setStudents] = useState<Student[]>([]);

  const [isSessionActive, setIsSessionActive] = useState(false);
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
        } else {
          // Yedek (Mock) Veri
          if (COURSES_DB[selectedCourseKey]) {
             const mockStudents = COURSES_DB[selectedCourseKey].students.map(s => ({...s, status: 'absent'}));
             // @ts-ignore
             setStudents(mockStudents);
          } else {
             setStudents([]);
          }
        }
      } catch (err) {
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
    // DataManager'daki fonksiyonu çağır
    await toggleAttendanceSession(selectedCourseCodeForDB(), newState);
    setIsSessionActive(newState);
    
    if(newState) {
        alert("📡 Yoklama sistemi açıldı! Öğrenciler artık bildirim alıyor.");
    } else {
        alert("🔒 Yoklama sistemi kapatıldı.");
    }
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
      setShowAssignModal(false); // Modalı kapat
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

  const selectedCourseCodeForDB = () => {
    return COURSES_DB[selectedCourseKey]?.code || '';
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
            {/* --- YENİ EKLENECEK VERİ BUTONU (BURAYA KOYUYORUZ) --- */}
            <button 
                className="secondary-btn" 
                onClick={injectSampleData}
                style={{
                    marginRight:'5px', 
                    border: '1px dashed #d32f2f', 
                    color: '#d32f2f', 
                    fontWeight: 'bold'
                }}
            >
                🛠️ Veri Yükle
            </button>
            {/* ---------------------------------------------------- */}
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
            students.map((student) => (
              <div key={student.id} className="student-row">
                <div className="student-info">
                  <div className={`student-avatar ${['Ö', 'C', 'A'].includes(student.name.charAt(0)) ? 'pink' : 'green'}`}>
                    {student.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div><strong>{student.name}</strong><span style={{display:'block', fontSize:'0.8rem', color:'#888'}}>{student.id}</span></div>
                </div>
                <div className="attendance-actions-group">
                  <button className={`status-btn present ${student.status === 'present' ? 'active' : ''}`} onClick={() => handleStatusChange(student.id, 'present')}>Var</button>
                  <button className={`status-btn absent ${student.status === 'absent' ? 'active' : ''}`} onClick={() => handleStatusChange(student.id, 'absent')}>Yok</button>
                  <button className={`status-btn late ${student.status === 'late' ? 'active' : ''}`} onClick={() => handleStatusChange(student.id, 'late')}>Geç</button>
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
      case 'courses': return <TeacherCourses onSelectCourse={handleCourseSelection} />;
      default: return renderDashboardContent();
    }
  };

  // --- ANA RENDER ---
  
  // Yükleniyor durumu
  if (loading) {
    return <div className="dashboard-layout" style={{display:'flex', justifyContent:'center', alignItems:'center'}}><h3>Dersleriniz Yükleniyor...</h3></div>;
  }

  // Ders atanmamışsa gösterilecek ekran
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
            <div className="notification-icon">🔔</div>
            <div className="user-info">
                <div className="details">
                    <span className="u-name">{currentUserEmail}</span>
                    <span className="u-role">Öğretmen</span>
                </div>
                <div className="avatar">{currentUserEmail.charAt(0).toUpperCase()}</div>
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
                        // --- DURUM KONTROLLERİ ---
                        const isGraded = assign.status === 'graded';
                        const isSubmitted = assign.status === 'submitted';
                        // Eğer notlanmamışsa VE teslim edilmemişse -> Bekleniyor durumudur
                        const isPending = !isGraded && !isSubmitted;

                        // Ekranda gösterilecek puan (Sadece notlanmışsa göster)
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

      </main>
    </div>
  );
};
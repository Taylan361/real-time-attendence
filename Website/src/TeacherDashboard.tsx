import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { TeacherCalendar } from './TeacherCalendar'; // Bu dosyalar sende varsa kalsın, yoksa hata verebilir, yorum satırına alabilirsin.
import { TeacherCourses } from './TeacherCourses';
import { addAnnouncementToFirebase, registerStudentToCourse } from './DataManager';

// Firebase importları
import { db } from './firebase';
import { doc, getDoc } from "firebase/firestore";

interface TeacherDashboardProps {
  onLogout: () => void;
  currentUserEmail: string; // Hangi öğretmenin giriş yaptığını bilmemiz lazım
}

interface Student {
  id: number;
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

  // Seçili Ders Verileri (Başlangıçta boş)
  const [selectedCourseKey, setSelectedCourseKey] = useState('');
  const [students, setStudents] = useState<Student[]>([]);

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

  // Seçili ders değişince öğrencileri güncelle
  useEffect(() => {
    if (selectedCourseKey && COURSES_DB[selectedCourseKey]) {
      setStudents(COURSES_DB[selectedCourseKey].students);
    } else {
      setStudents([]); // Tanımsız ders ise boş liste
    }
  }, [selectedCourseKey]);

  // İstatistikler
  const totalStudents = students.length;
  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const lateCount = students.filter(s => s.status === 'late').length;
  const attendanceRate = totalStudents > 0 ? Math.round(((presentCount + (lateCount * 0.5)) / totalStudents) * 100) : 0;

  // --- FONKSİYONLAR ---

  const handleStatusChange = (id: number, newStatus: 'present' | 'absent' | 'late') => {
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

  const handleSaveAssignment = () => { 
    setShowAssignModal(false); 
    alert("Ödev oluşturuldu (Demo)"); 
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
            <button className="primary-black-btn">▶ Dersi Başlat</button>
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
          <button className="full-width-black-btn" onClick={() => setShowAssignModal(true)}>+ Ödev Oluştur</button>
          <div className="teacher-assignment-item"><h4>Birim Testi Lab Çalışması</h4><div className="progress-bar-bg"><div className="progress-fill" style={{width: '100%', backgroundColor: 'black'}}></div></div><div style={{display:'flex', justifyContent:'space-between', fontSize:'0.8rem', marginTop:'5px'}}><span>Teslim: 10/42</span><span style={{color:'green', fontWeight:'bold'}}>Aktif</span></div></div>
        </div>
      </div>
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

      </main>
    </div>
  );
};
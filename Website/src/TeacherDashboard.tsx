import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { TeacherCalendar } from './TeacherCalendar';
import { TeacherCourses } from './TeacherCourses'; // YENİ: Import ettik

interface TeacherDashboardProps {
  onLogout: () => void;
}

interface Student {
  id: number;
  name: string;
  status: 'present' | 'absent' | 'late';
}

const COURSES_DB: Record<string, { code: string; time: string; students: Student[] }> = {
  'Software Validation': {
    code: 'MATH 401',
    time: 'Sal/Per 14:00',
    students: [
      { id: 2024006, name: 'Öykü Şahin', status: 'absent' },
      { id: 2024007, name: 'Kaan Gündüz', status: 'present' },
      { id: 2024008, name: 'Doğukan Gökdemir', status: 'present' },
      { id: 2024009, name: 'Ceren Tuncer', status: 'late' },
    ]
  },
  'Database Management': {
    code: 'CS 101',
    time: 'Pzt/Çar 10:00',
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
    time: 'Cuma 09:00',
    students: [
      { id: 2024020, name: 'Ahmet Yılmaz', status: 'present' },
      { id: 2024021, name: 'Burak Can', status: 'late' },
    ]
  }
};

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout }) => {
  
  // GÜNCELLEME: activeView tipi genişletildi
  const [activeView, setActiveView] = useState<'dashboard' | 'calendar' | 'courses'>('dashboard');
  
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  const [selectedCourseKey, setSelectedCourseKey] = useState('Software Validation');
  const [students, setStudents] = useState<Student[]>(COURSES_DB['Software Validation'].students);

  useEffect(() => {
    setStudents(COURSES_DB[selectedCourseKey].students);
  }, [selectedCourseKey]);

  const totalStudents = students.length;
  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const lateCount = students.filter(s => s.status === 'late').length;
  const attendanceRate = totalStudents > 0 ? Math.round(((presentCount + (lateCount * 0.5)) / totalStudents) * 100) : 0;

  const handleStatusChange = (id: number, newStatus: 'present' | 'absent' | 'late') => {
    setStudents(prev => prev.map(student => student.id === id ? { ...student, status: newStatus } : student));
  };

  const markAllPresent = () => { setStudents(prev => prev.map(s => ({ ...s, status: 'present' }))); };
  const handleSaveAnnouncement = () => { setShowAnnounceModal(false); alert("Duyuru başarıyla yayınlandı! (Demo)"); };
  const handleSaveAssignment = () => { setShowAssignModal(false); alert("Ödev öğrencilere gönderildi! (Demo)"); };

  // --- İÇERİK RENDER (Dashboard Ana Sayfası) ---
  const renderDashboardContent = () => (
    <div className="fade-in">
      <div className="teacher-blue-header" style={{ marginBottom: '25px' }}>
        <div className="blue-header-content">
          <h3>{selectedCourseKey}</h3>
          <div className="blue-tags">
            <span className="blue-tag">{COURSES_DB[selectedCourseKey].code}</span>
            <span className="blue-tag">{COURSES_DB[selectedCourseKey].time}</span>
            <span className="blue-tag">{totalStudents} Öğrenci Kayıtlı</span>
          </div>
        </div>
        <div className="course-selector-wrapper">
            <label style={{color:'white', fontSize:'0.8rem', display:'block', marginBottom:'5px', opacity:0.8}}>Aktif Ders:</label>
            <select className="header-course-select" value={selectedCourseKey} onChange={(e) => setSelectedCourseKey(e.target.value)}>
              {Object.keys(COURSES_DB).map(courseName => (<option key={courseName} value={courseName}>{courseName}</option>))}
            </select>
        </div>
      </div>

      <div className="section-card">
        <div className="card-header">
          <h3>Yoklama Kontrolü</h3>
          <div className="header-actions">
            <button className="secondary-btn" onClick={markAllPresent}>Tümünü Var Yaz</button>
            <button className="primary-black-btn">▶ Oturumu Başlat</button>
          </div>
        </div>
        <div className="attendance-stats">
          <div className="att-box total"><span>👥 Toplam</span><strong>{totalStudents}</strong></div>
          <div className="att-box present"><span>✅ Mevcut</span><strong>{presentCount}</strong></div>
          <div className="att-box absent"><span>❌ Yok</span><strong>{absentCount}</strong></div>
          <div className="att-box late"><span>⏰ Geç</span><strong>{lateCount}</strong></div>
          <div className="att-box rate"><span>📊 Oran</span><strong>%{attendanceRate}</strong></div>
        </div>
        <div className="student-list">
          {students.map((student) => (
            <div key={student.id} className="student-row">
              <div className="student-info">
                <div className={`student-avatar ${['Ö', 'C', 'A'].includes(student.name.charAt(0)) ? 'pink' : 'green'}`}>
                  {student.name.substring(0, 2).toUpperCase()}
                </div>
                <div><strong>{student.name}</strong><span style={{display:'block', fontSize:'0.8rem', color:'#888'}}>{student.id}</span></div>
              </div>
              <div className="attendance-actions-group">
                <button className={`status-btn present ${student.status === 'present' ? 'active' : ''}`} onClick={() => handleStatusChange(student.id, 'present')}>Mevcut</button>
                <button className={`status-btn absent ${student.status === 'absent' ? 'active' : ''}`} onClick={() => handleStatusChange(student.id, 'absent')}>Yok</button>
                <button className={`status-btn late ${student.status === 'late' ? 'active' : ''}`} onClick={() => handleStatusChange(student.id, 'late')}>Geç</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="content-grid" style={{marginTop: '25px'}}>
        <div className="section-card">
          <div className="card-header"><h3>Duyurular</h3><span className="icon-btn">📢</span></div>
          <button className="full-width-black-btn" onClick={() => setShowAnnounceModal(true)}>+ Duyuru Oluştur</button>
          <div className="announcement-item"><div className="ann-badge high">Yüksek</div><h4>Vize Sınav Takvimi</h4><p>Vize sınavı 25 Kasım saat 09:00'da yapılacaktır.</p></div>
        </div>
        <div className="section-card">
          <div className="card-header"><h3>Ödev Yönetimi</h3><span className="icon-btn">📝</span></div>
          <button className="full-width-black-btn" onClick={() => setShowAssignModal(true)}>+ Yeni Ödev Ekle</button>
          <div className="teacher-assignment-item"><h4>Unit Testing Lab Exercise</h4><div className="progress-bar-bg"><div className="progress-fill" style={{width: '100%', backgroundColor: 'black'}}></div></div><div style={{display:'flex', justifyContent:'space-between', fontSize:'0.8rem', marginTop:'5px'}}><span>Teslim: 10/42</span><span style={{color:'green', fontWeight:'bold'}}>Aktif</span></div></div>
        </div>
      </div>
    </div>
  );

  // YENİ FONKSİYON: Dersi seçip Dashboard'a atar
  const handleCourseSelection = (courseName: string) => {
    setSelectedCourseKey(courseName); // 1. O dersi seçili yap
    setActiveView('dashboard');       // 2. Ana ekrana (Dashboard) dön
  };

  // --- ANA RENDER ---
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return renderDashboardContent();
      case 'calendar': return <TeacherCalendar />;
      
      // GÜNCELLEME: Prop'u buraya ekledik
      case 'courses': return <TeacherCourses onSelectCourse={handleCourseSelection} />;
      
      default: return renderDashboardContent();
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo"><div className="logo-icon">🎓</div><h2>UniPortal</h2></div>
        
        <nav className="sidebar-menu">
          <div className={`menu-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>
            <span className="icon">🏠</span> Dashboard
          </div>
          {/* ARTIK ÇALIŞIYOR */}
          <div className={`menu-item ${activeView === 'courses' ? 'active' : ''}`} onClick={() => setActiveView('courses')}>
            <span className="icon">📘</span> Derslerim
          </div>
          <div className={`menu-item ${activeView === 'calendar' ? 'active' : ''}`} onClick={() => setActiveView('calendar')}>
            <span className="icon">📅</span> Takvim
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={onLogout} className="logout-btn">🚪 Çıkış Yap</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="page-title-group"><h2>Akademisyen Paneli</h2><p>Derslerinizi ve yoklamayı buradan yönetin</p></div>
          <div className="user-profile"><div className="notification-icon">🔔</div><div className="user-info"><div className="details"><span className="u-name">Dr. Burçak Çelt</span><span className="u-role">Akademisyen</span></div><div className="avatar">B</div></div></div>
        </header>

        {renderContent()}

        {/* MODALLAR */}
        {showAnnounceModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>📢 Yeni Duyuru Yayınla</h3>
              <div className="form-group"><label>Başlık</label><input type="text" className="modal-input" placeholder="Örn: Sınav Tarihleri" /></div>
              <div className="form-group"><label>İçerik</label><textarea className="modal-input" rows={4} placeholder="Duyuru detaylarını buraya yazın..."></textarea></div>
              <div className="modal-actions"><button className="secondary-btn" onClick={() => setShowAnnounceModal(false)}>İptal</button><button className="primary-black-btn" onClick={handleSaveAnnouncement}>Yayınla</button></div>
            </div>
          </div>
        )}

        {showAssignModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>📝 Yeni Ödev Ekle</h3>
              <div className="form-group"><label>Ödev Başlığı</label><input type="text" className="modal-input" placeholder="Örn: Final Projesi Raporu" /></div>
              <div className="form-group"><label>Son Teslim Tarihi</label><input type="date" className="modal-input" /></div>
              <div className="modal-actions"><button className="secondary-btn" onClick={() => setShowAssignModal(false)}>İptal</button><button className="primary-black-btn" onClick={handleSaveAssignment}>Ödevi Oluştur</button></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { MyCourses } from './MyCourses';
import { MyAssignments } from './MyAssignments';
import { MyGrades } from './MyGrades';
import { Calendar } from './Calendar';
import { CourseDetails } from './CourseDetails'; // Yeni
import { AssignmentDetails } from './AssignmentDetails'; // Yeni

interface DashboardProps {
  onLogout: () => void;
}

// Görünüm tiplerine detay sayfalarını da ekledik
type ViewType = 'dashboard' | 'courses' | 'assignments' | 'grades' | 'calendar' | 'course-detail' | 'assignment-detail';

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [userName, setUserName] = useState('Öğrenci');
  const [activeView, setActiveView] = useState<ViewType>('dashboard'); 
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    const savedLogin = localStorage.getItem('savedLogin');
    if (savedLogin) {
      const userRecord = localStorage.getItem(savedLogin);
      if (userRecord) {
        const user = JSON.parse(userRecord);
        setUserName(`${user.name} ${user.surname}`);
      }
    }
  }, []);

  // --- NAVİGASYON FONKSİYONLARI ---
  const handleViewCourse = (courseName: string) => {
    setSelectedCourseId(courseName);
    setActiveView('course-detail');
  };

  const handleViewAssignment = () => {
    setActiveView('assignment-detail');
  };

  const goBackToCourses = () => setActiveView('courses');
  const goBackToAssignments = () => setActiveView('assignments');

  // --- DASHBOARD ANASAYFA İÇERİĞİ ---
  const DashboardOverview = () => (
    <div className="fade-in">
      <div className="welcome-section">
        <h1>Hoşgeldin, {userName.split(' ')[0]}! 👋</h1>
        <p>Bu hafta teslim etmen gereken 3 ödevin var. Harika gidiyorsun!</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-info"><span className="stat-title">Kayıtlı Dersler</span><span className="stat-value">6</span></div><div className="stat-icon bg-blue">📖</div></div>
        <div className="stat-card"><div className="stat-info"><span className="stat-title">Tamamlanan</span><span className="stat-value">12</span></div><div className="stat-icon bg-green">✅</div></div>
        <div className="stat-card"><div className="stat-info"><span className="stat-title">Bekleyen Görev</span><span className="stat-value">5</span></div><div className="stat-icon bg-orange">⏰</div></div>
        <div className="stat-card"><div className="stat-info"><span className="stat-title">Genel Ort (GPA)</span><span className="stat-value">2.8</span></div><div className="stat-icon bg-purple">🎖️</div></div>
      </div>

      <div className="content-grid">
        {/* SOL: DERSLER ÖZET */}
        <div className="section-card">
            <h3>Derslerim</h3>
            <p className="subtitle">Bu dönem kayıtlı olduğun dersler</p>
            <div className="course-list">
              <div className="course-item"><div className="course-border" style={{backgroundColor: '#4b2e83'}}></div><div className="course-details"><h4>Software Validation</h4><span className="instructor">Dr. Burçak Çelt</span><div className="progress-bar-bg"><div className="progress-fill" style={{width: '68%', backgroundColor: '#4b2e83'}}></div></div></div></div>
              <div className="course-item"><div className="course-border" style={{backgroundColor: '#00C853'}}></div><div className="course-details"><h4>Database Management</h4><span className="instructor">Prof. Taylan Çakı</span><div className="progress-bar-bg"><div className="progress-fill" style={{width: '75%', backgroundColor: '#00C853'}}></div></div></div></div>
            </div>
            {/* Bu butonu da çalışır hale getirdik */}
            <button className="view-all" style={{marginTop:'15px', width:'100%'}} onClick={() => setActiveView('courses')}>Tüm Dersleri Gör</button>
        </div>

        {/* SAĞ: ÖDEVLER ÖZET */}
        <div className="section-card">
           <div className="card-header">
              <h3>Yaklaşan Ödevler</h3>
              <button className="view-all" onClick={() => setActiveView('assignments')}>Tümü</button>
            </div>
            <p className="subtitle">Teslim tarihi yaklaşanlar</p>
            <div className="assignment-list">
               {/* "Görüntüle" butonlarına onClick ekledik */}
               <div className="assignment-item"><div className="task-icon">📋</div><div className="task-info"><h4>Testing Problem Set 5</h4><span>Software Validation</span></div><button className="task-btn" onClick={handleViewAssignment}>Görüntüle</button></div>
               <div className="assignment-item"><div className="task-icon">📋</div><div className="task-info"><h4>Team Project</h4><span>CS 101</span></div><button className="task-btn" onClick={handleViewAssignment}>Görüntüle</button></div>
            </div>
        </div>
      </div>
    </div>
  );

  // --- İÇERİK YÖNETİCİSİ ---
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardOverview />;
      
      // Listeler ve Detaylar Arası Geçiş
      case 'courses': return <MyCourses onCourseSelect={handleViewCourse} />;
      case 'course-detail': return <CourseDetails courseId={selectedCourseId} onBack={goBackToCourses} />;
      
      case 'assignments': return <MyAssignments onAssignmentSelect={handleViewAssignment} />;
      case 'assignment-detail': return <AssignmentDetails onBack={goBackToAssignments} />;
      
      case 'grades': return <MyGrades />;
      case 'calendar': return <Calendar />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🎓</div>
          <h2>UniPortal</h2>
        </div>
        
        <nav className="sidebar-menu">
          {/* Sidebar butonları sadece ana görünümlere gider */}
          <div className={`menu-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}><span className="icon">🏠</span> Dashboard</div>
          <div className={`menu-item ${activeView === 'courses' || activeView === 'course-detail' ? 'active' : ''}`} onClick={() => setActiveView('courses')}><span className="icon">📚</span> Derslerim</div>
          <div className={`menu-item ${activeView === 'assignments' || activeView === 'assignment-detail' ? 'active' : ''}`} onClick={() => setActiveView('assignments')}><span className="icon">📝</span> Ödevler</div>
          <div className={`menu-item ${activeView === 'grades' ? 'active' : ''}`} onClick={() => setActiveView('grades')}><span className="icon">📊</span> Notlar</div>
          <div className={`menu-item ${activeView === 'calendar' ? 'active' : ''}`} onClick={() => setActiveView('calendar')}><span className="icon">📅</span> Takvim</div>
        </nav>

        <div className="sidebar-footer">
          <button onClick={onLogout} className="logout-btn">🚪 Çıkış Yap</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="search-bar"><span>🔍</span><input type="text" placeholder="Ders, ödev veya notlarda ara..." /></div>
          <div className="user-profile">
            <div className="notification-icon">🔔 <span className="badge">3</span></div>
            <div className="user-info">
              <div className="details"><span className="u-name">{userName}</span><span className="u-role">Bilgisayar Müh.</span></div>
              <div className="avatar">{userName.charAt(0)}</div>
            </div>
          </div>
        </header>

        {renderContent()}

      </main>
    </div>
  );
  
};
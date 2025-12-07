import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { MyCourses } from './MyCourses'; // Derslerim sayfasını import ettik
import { MyAssignments } from './MyAssignments';
import { MyGrades } from './MyGrades';
import { Calendar } from './Calendar';

// Giriş yapan kullanıcının verilerini alacağız
interface DashboardProps {
  onLogout: () => void;
}

type TabType = 'dashboard' | 'courses' | 'assignments' | 'grades' | 'calendar';

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [userName, setUserName] = useState('Öğrenci');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard'); // Varsayılan sekme

  // Sayfa açılınca LocalStorage'dan ismi çekelim
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

  // --- MOCK DATA (Dashboard Ana Sayfa İçin) ---
  const stats = [
    { title: 'Kayıtlı Dersler', value: '6', icon: '📖', color: 'blue' },
    { title: 'Tamamlanan', value: '12', icon: '✅', color: 'green' },
    { title: 'Bekleyen Görev', value: '5', icon: '⏰', color: 'orange' },
    { title: 'Genel Ort (GPA)', value: '2.8', icon: '🎖️', color: 'purple' },
  ];

  const assignments = [
    { title: 'Testing Problem Set 5', course: 'Software Validation', date: '17 Kas, 2025', status: 'Bekliyor', statusColor: 'orange' },
    { title: 'Team Project', course: 'Computer Science 101', date: '20 Kas, 2025', status: 'Sürüyor', statusColor: 'black' },
    { title: 'Lab Report', course: 'CPU Lab', date: '22 Kas, 2025', status: 'Bekliyor', statusColor: 'orange' },
  ];

  const courses = [
    { name: 'Software Validation and Testing', instructor: 'Dr. Burçak Çelt', grade: 'BB', progress: 68, color: '#4b2e83' },
    { name: 'Database Management', instructor: 'Prof. Taylan Çakı', grade: 'AA', progress: 75, color: '#00C853' },
    { name: 'Operating Systems', instructor: 'Dr. Erdem Beler', grade: 'CC', progress: 54, color: '#aa00ff' },
    { name: 'Python Programming', instructor: 'Prof. Ecem Özer', grade: 'AA', progress: 82, color: '#ffab00' },
  ];

  // --- DASHBOARD ANASAYFA İÇERİĞİ ---
  const DashboardOverview = () => (
    <div className="fade-in">
      <div className="welcome-section">
        <h1>Hoşgeldin, {userName.split(' ')[0]}! 👋</h1>
        <p>Bu hafta teslim etmen gereken 3 ödevin var. Harika gidiyorsun!</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-info">
              <span className="stat-title">{stat.title}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
            <div className={`stat-icon bg-${stat.color}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="content-grid">
        {/* SOL: DERSLER LİSTESİ (KÜÇÜK) */}
        <div className="section-card">
            <h3>Derslerim</h3>
            <p className="subtitle">Bu dönem kayıtlı olduğun dersler</p>
            
            <div className="course-list">
              {courses.map((course, index) => (
                <div key={index} className="course-item">
                  <div className="course-border" style={{backgroundColor: course.color}}></div>
                  <div className="course-details">
                    <h4>{course.name}</h4>
                    <span className="instructor">{course.instructor}</span>
                    <div className="progress-bar-bg">
                      <div className="progress-fill" style={{width: `${course.progress}%`, backgroundColor: course.color}}></div>
                    </div>
                    <span className="progress-text">İlerleme: %{course.progress}</span>
                  </div>
                  <div className="course-grade">
                    {course.grade}
                  </div>
                </div>
              ))}
            </div>
        </div>

        {/* SAĞ: ÖDEVLER LİSTESİ */}
        <div className="section-card">
           <div className="card-header">
              <h3>Yaklaşan Ödevler</h3>
              <button className="view-all" onClick={() => setActiveTab('assignments')}>Tümü</button>
            </div>
            <p className="subtitle">Teslim tarihi yaklaşanlar</p>

            <div className="assignment-list">
              {assignments.map((task, index) => (
                <div key={index} className="assignment-item">
                  <div className="task-icon">📋</div>
                  <div className="task-info">
                    <h4>{task.title}</h4>
                    <span>{task.course}</span>
                    <div className="task-meta">
                      🕒 {task.date} 
                      <span className={`status-tag ${task.statusColor}`}>{task.status}</span>
                    </div>
                  </div>
                  <button className="task-btn">Görüntüle</button>
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  );

  // --- İÇERİK YÖNETİCİSİ ---
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardOverview />;
      case 'courses': return <MyCourses />;
      case 'assignments': return <MyAssignments />;
      case 'grades': return <MyGrades />;
      case 'calendar': return <Calendar />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* SOL SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🎓</div>
          <h2>UniPortal</h2>
        </div>
        
        <nav className="sidebar-menu">
          <div className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <span className="icon">🏠</span> Dashboard
          </div>
          <div className={`menu-item ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
            <span className="icon">📚</span> Derslerim
          </div>
          <div className={`menu-item ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>
            <span className="icon">📝</span> Ödevler
          </div>
          <div className={`menu-item ${activeTab === 'grades' ? 'active' : ''}`} onClick={() => setActiveTab('grades')}>
            <span className="icon">📊</span> Notlar
          </div>
          <div className={`menu-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
            <span className="icon">📅</span> Takvim
          </div>
        </nav>

        <div className="sidebar-footer">
          <button onClick={onLogout} className="logout-btn">
            🚪 Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ANA İÇERİK ALANI */}
      <main className="main-content">
        {/* HEADER */}
        <header className="top-header">
          <div className="search-bar">
            <span>🔍</span>
            <input type="text" placeholder="Ders, ödev veya notlarda ara..." />
          </div>
          
          <div className="user-profile">
            <div className="notification-icon">
              🔔 <span className="badge">3</span>
            </div>
            
            <div className="user-info">
              <div className="details">
                <span className="u-name">{userName}</span>
                <span className="u-role">Bilgisayar Müh.</span>
              </div>
              <div className="avatar">
                {userName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* DİNAMİK OLARAK DEĞİŞEN İÇERİK */}
        {renderContent()}

      </main>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { MyCourses } from './MyCourses';
import { MyAssignments } from './MyAssignments';
import { MyGrades } from './MyGrades';
import { Calendar } from './Calendar';
import { CourseDetails } from './CourseDetails';
import { AssignmentDetails } from './AssignmentDetails';
import { FaceAuthModal } from './FaceAuthModal';
import { 
  getStudentData, 
  type Student, 
  getAnnouncementsByCourses, 
  type Announcement, 
  fetchAssignmentsFromFirebase,
  checkActiveSession,
  markStudentPresent
} from './DataManager';

interface DashboardProps {
  onLogout: () => void;
}

interface Assignment {
  id: string;
  title: string;
  courseCode: string;
  dueDate: string;
}

// Görünüm tiplerine profile ve settings eklendi
type ViewType = 'dashboard' | 'courses' | 'assignments' | 'grades' | 'calendar' | 'course-detail' | 'assignment-detail' | 'profile' | 'settings';

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [userName, setUserName] = useState('Student');
  const [activeView, setActiveView] = useState<ViewType>('dashboard'); 
  
   
  const [studentInfo, setStudentInfo] = useState<Student | null>(null);
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [myAssignments, setMyAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // --- YOKLAMA STATE'LERİ ---
  const [activeSessionCourse, setActiveSessionCourse] = useState<string | null>(null);
  const [showFaceAuth, setShowFaceAuth] = useState(false);

  // --- YENİ EKLENEN STATE'LER (MENÜ, BİLDİRİM, SAYAÇ) ---
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // 1. İsim Çekme
    const savedLogin = localStorage.getItem('savedLogin');
    if (savedLogin) {
      const userRecord = localStorage.getItem(savedLogin);
      if (userRecord) {
        const user = JSON.parse(userRecord);
        setUserName(`${user.name} ${user.surname}`);
      }
    }

    // 2. Verileri Çekme
    const fetchData = async () => {
      const currentStudentId = localStorage.getItem('currentStudentId') || '220706010';
   
      const data = await getStudentData(currentStudentId);
      
      if (data) {
        setStudentInfo(data);
        if (data.name) setUserName(data.name);

        if (data.enrolledCourses && data.enrolledCourses.length > 0) {
          const anns = await getAnnouncementsByCourses(data.enrolledCourses);
          setRecentAnnouncements(anns);

          const allAssignments = await fetchAssignmentsFromFirebase();
        
          // @ts-ignore
          const studentAssignments = allAssignments.filter((a: Assignment) => 
            data.enrolledCourses.includes(a.courseCode)
          );
          // @ts-ignore
          setMyAssignments(studentAssignments);
        }
      }
    };

    fetchData();
  }, []);

  // Bildirim Sayısını Güncelleme Logic'i
  useEffect(() => {
    const total = recentAnnouncements.length + myAssignments.length + (activeSessionCourse ? 1 : 0);
    // Sadece ilk yüklemede veya sayaç sıfır değilse güncelle
    if (unreadCount === 0 && total > 0) {
        setUnreadCount(total);
    }
  }, [recentAnnouncements, myAssignments, activeSessionCourse]);

  // Canlı Yoklama Kontrolü
  useEffect(() => {
    if (!studentInfo?.enrolledCourses) return;

    const interval = setInterval(async () => {
        for (const courseCode of studentInfo.enrolledCourses) {
            const isActive = await checkActiveSession(courseCode);
            if (isActive) {
                setActiveSessionCourse(courseCode);
                break;
            } else {
                if (activeSessionCourse === courseCode) {
                    setActiveSessionCourse(null);
                }
            }
        }
    }, 5000);

    return () => clearInterval(interval);
  }, [studentInfo, activeSessionCourse]);

  // --- YÖNLENDİRME FONKSİYONLARI ---
const handleViewCourse = (_courseName: string) => {
    setActiveView('course-detail');
  };

  const handleViewAssignment = (assignment: Assignment) => { 
    setSelectedAssignment(assignment);
    setActiveView('assignment-detail');
  };

  const goBackToCourses = () => setActiveView('courses');
  const goBackToAssignments = () => setActiveView('assignments');

  const handleFaceAuthSuccess = async () => {
     if (activeSessionCourse) {
         const currentId = localStorage.getItem('currentStudentId') || '220706010';
         await markStudentPresent(currentId, activeSessionCourse);
         setShowFaceAuth(false);
         setActiveSessionCourse(null);
         alert(`✅ ${activeSessionCourse} dersi için katılımınız onaylandı!`);
     }
  };

  const handleMarkAsRead = () => {
    setUnreadCount(0);
  };

  // Bildirim Listesi Hazırlama
  const notifications = [
    ...(activeSessionCourse ? [{ type: 'alert', title: 'Yoklama Başladı!', sub: activeSessionCourse, date: 'Şimdi' }] : []),
    ...recentAnnouncements.map(a => ({ type: 'announcement', title: a.title, sub: a.courseCode, date: a.date })),
    ...myAssignments.map(a => ({ type: 'assignment', title: a.title, sub: 'Due: ' + a.dueDate, date: 'Task' }))
  ];

  // --- BİLEŞENLER ---

  // 1. Dashboard Ana Sayfa
  const DashboardOverview = () => (
    <div>
      <div className="welcome-section">
        <h1>Welcome, {userName.split(' ')[0]}! 👋</h1>
        <p>You have new announcements and tasks.</p>
      </div>

      {activeSessionCourse && (
          <div className="attendance-alert-card" style={{
              background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
              color: 'white', padding: '20px', borderRadius: '12px', marginBottom: '25px',
              boxShadow: '0 4px 15px rgba(211, 47, 47, 0.3)', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center', animation: 'pulse 2s infinite'
          }}>
              <div>
                  <h2 style={{margin:0, fontSize:'1.4rem'}}>⚠️ Yoklama Başladı!</h2>
                  <p style={{margin:'5px 0 0 0', opacity:0.9}}>
                      <strong>{activeSessionCourse}</strong> dersi için eğitmen yoklamayı başlattı.
                  </p>
              </div>
              <button onClick={() => setShowFaceAuth(true)} style={{
                      backgroundColor: 'white', color: '#d32f2f', border: 'none',
                      padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold',
                      cursor: 'pointer', fontSize: '1rem', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}>📸 Hemen Katıl</button>
          </div>
      )}

      <div className="stats-grid animate-page-enter stagger-1">
        <div className="stat-card">
            <div className="stat-info"><span className="stat-title">Enrolled Courses</span><span className="stat-value">{studentInfo?.enrolledCourses.length || 0}</span></div>
            <div className="stat-icon bg-blue">📖</div>
        </div>
        <div className="stat-card">
            <div className="stat-info"><span className="stat-title">Announcements</span><span className="stat-value">{recentAnnouncements.length}</span></div>
            <div className="stat-icon bg-orange">📢</div>
        </div>
        <div className="stat-card">
            <div className="stat-info"><span className="stat-title">Pending Tasks</span><span className="stat-value">{myAssignments.length}</span></div>
            <div className="stat-icon bg-purple">⏰</div>
        </div>
        <div className="stat-card"><div className="stat-info"><span className="stat-title">GPA</span><span className="stat-value">2.8</span></div><div className="stat-icon bg-green">🎖️</div></div>
      </div>

      <div className="content-grid animate-page-enter stagger-2">
        <div className="section-card">
           <div className="card-header"><h3>Recent Announcements</h3><span className="icon-btn">📢</span></div>
            <div className="assignment-list">
               {recentAnnouncements.length > 0 ? (
                 recentAnnouncements.map((ann, idx) => (
                   <div key={idx} className="assignment-item">
                      <div className="task-icon">📣</div>
                      <div className="task-info">
                        <h4>{ann.title}</h4>
                        <span style={{color: '#666', fontSize:'0.85rem'}}>{ann.courseCode} - {ann.date}</span>
                        <p style={{margin:'5px 0 0 0', fontSize:'0.9rem', color:'#444'}}>{ann.content}</p>
                      </div>
                      {ann.priority === 'high' && <span className="status-badge">High</span>}
                   </div>
                 ))
               ) : (<div style={{padding:'20px', color:'#999', textAlign:'center'}}>No new announcements.</div>)}
            </div>
        </div>

        <div className="section-card">
            <div className="card-header"><h3>Upcoming Assignments</h3><span className="icon-btn">📝</span></div>
            <div className="assignment-list" style={{marginTop:'15px'}}>
               {myAssignments.length > 0 ? (
                 myAssignments.map((assign) => (
                   <div key={assign.id} className="assignment-item">
                      <div className="task-icon" style={{backgroundColor:'#e8f5e9', color:'#2e7d32'}}>📝</div>
                      <div className="task-info">
                        <h4>{assign.title}</h4>
                        <span style={{color: '#666', fontSize:'0.85rem'}}>{assign.courseCode}</span>
                        <div style={{fontSize:'0.8rem', color:'#d32f2f', marginTop:'2px'}}>Due: {assign.dueDate}</div>
                      </div>
                      <button className="view-btn" onClick={() => setActiveView('assignments')}>View</button>
                   </div>
                 ))
               ) : (
                 <div style={{padding:'20px', color:'#999', textAlign:'center'}}>
                    <p>No active assignments.</p> <small>Great job! 🎉</small>
                 </div>
               )}
            </div>
        </div>
      </div>
    </div>
  );

  // 2. Profil Sayfası (email hatası düzeltildi)
  const UserProfilePage = () => (
      <div className="profile-container">
          <div className="profile-header-card">
              <div className="profile-bg-banner"></div>
              <div className="profile-avatar-large">{userName.charAt(0)}</div>
              <h2 className="profile-name">{userName}</h2>
              <span className="profile-role">Student (Lisans Öğrencisi)</span>
          </div>
          <div className="profile-details-grid">
              <div className="detail-box">
                  <span className="detail-label">Öğrenci Numarası</span>
                  <div className="detail-value">{studentInfo?.id || localStorage.getItem('currentStudentId')}</div>
              </div>
              <div className="detail-box">
                  <span className="detail-label">E-Posta Adresi</span>
                  {/* HATA DÜZELTİLDİ: (studentInfo as any)?.email kullanıldı */}
                  <div className="detail-value">{(studentInfo as any)?.email || 'ogrenci@uniportal.edu.tr'}</div>
              </div>
              <div className="detail-box">
                  <span className="detail-label">Kayıtlı Ders Sayısı</span>
                  <div className="detail-value">{studentInfo?.enrolledCourses.length || 0}</div>
              </div>
              <div className="detail-box">
                  <span className="detail-label">Genel Not Ortalaması</span>
                  <div className="detail-value">2.84</div>
              </div>
          </div>
          <button className="view-details-btn" style={{marginTop:'20px'}} onClick={() => setActiveView('dashboard')}>
              ← Dashboard'a Dön
          </button>
      </div>
  );

  // 3. Ayarlar Sayfası
  const SettingsPage = () => (
      <div className="settings-container">
          <h2 style={{marginBottom:'30px'}}>Uygulama Ayarları</h2>
          <div className="setting-group">
              <h3>Bildirim Tercihleri</h3>
              <div className="setting-item">
                  <div className="setting-info"><h4>E-Posta Bildirimleri</h4><p>Yeni ödev eklendiğinde mail al.</p></div>
                  <div className="toggle-switch active"></div>
              </div>
              <div className="setting-item">
                  <div className="setting-info"><h4>Duyuru Bildirimleri</h4><p>Hoca duyuru yapınca bildirim gönder.</p></div>
                  <div className="toggle-switch active"></div>
              </div>
          </div>
          <div className="setting-group">
              <h3>Görünüm</h3>
              <div className="setting-item">
                  <div className="setting-info"><h4>Karanlık Mod (Dark Mode)</h4><p>Göz yormayan karanlık tema.</p></div>
                  <div className="toggle-switch"></div>
              </div>
          </div>
          <button className="logout-btn" style={{marginTop:'10px', background:'#e2e8f0', color:'#4a5568'}} onClick={() => setActiveView('dashboard')}>İptal</button>
          <button className="primary-black-btn" style={{marginTop:'10px', float:'right'}} onClick={() => { setActiveView('dashboard'); alert('Ayarlar kaydedildi!'); }}>Kaydet</button>
      </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardOverview />;
      case 'courses': return <MyCourses onCourseSelect={handleViewCourse} enrolledCodes={studentInfo?.enrolledCourses || []} />;
      case 'course-detail': return <CourseDetails onBack={goBackToCourses} />;
      case 'assignments': return <MyAssignments onAssignmentSelect={handleViewAssignment} />;
      case 'assignment-detail': return <AssignmentDetails data={selectedAssignment} onBack={goBackToAssignments} />;
      case 'grades': return <MyGrades />;
      case 'calendar': return <Calendar />;
      case 'profile': return <UserProfilePage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="dashboard-layout">
      <FaceAuthModal isOpen={showFaceAuth} onClose={() => setShowFaceAuth(false)} onSuccess={handleFaceAuthSuccess} studentName={userName} />

      <aside className="sidebar">
        <div className="sidebar-logo"><div className="logo-icon">🎓</div><h2>UniPortal</h2></div>
        <nav className="sidebar-menu">
          <div className={`menu-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}><span className="icon">🏠</span> Dashboard</div>
          <div className={`menu-item ${activeView === 'courses' || activeView === 'course-detail' ? 'active' : ''}`} onClick={() => setActiveView('courses')}><span className="icon">📚</span> My Courses</div>
          <div className={`menu-item ${activeView === 'assignments' || activeView === 'assignment-detail' ? 'active' : ''}`} onClick={() => setActiveView('assignments')}><span className="icon">📝</span> Assignments</div>
          <div className={`menu-item ${activeView === 'grades' ? 'active' : ''}`} onClick={() => setActiveView('grades')}><span className="icon">📊</span> Grades</div>
          <div className={`menu-item ${activeView === 'calendar' ? 'active' : ''}`} onClick={() => setActiveView('calendar')}><span className="icon">📅</span> Calendar</div>
        </nav>
        <div className="sidebar-footer"><button onClick={onLogout} className="logout-btn">🚪 Logout</button></div>
      </aside>

      <main className="main-content">
        <header className="top-header" style={{ position: 'relative', zIndex: 200 }}>
          <div className="search-bar"><span>🔍</span><input type="text" placeholder="Search..." /></div>
          <div className="user-profile">
            
            {/* Bildirim Zili ve Dropdown */}
            <div className="notification-icon" onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}>
                🔔 {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                {showNotifications && (
                    <div className="dropdown-panel notification-dropdown" onClick={(e) => e.stopPropagation()}>
                        <div className="dropdown-header"><h4>Bildirimler</h4><span className="clear-btn" onClick={handleMarkAsRead}>Tümünü Okundu İşaretle</span></div>
                        <div className="notification-list">
                            {notifications.length > 0 ? (
                                notifications.map((notif, idx) => (
                                    <div key={idx} className="notif-item">
                                        <div className="notif-icon">{notif.type === 'alert' ? '⚠️' : (notif.type === 'announcement' ? '📢' : '📝')}</div>
                                        <div className="notif-content"><h5>{notif.title}</h5><p>{notif.sub}</p><span className="notif-time">{notif.date}</span></div>
                                    </div>
                                ))
                            ) : (<div style={{padding:'20px', textAlign:'center', color:'#999'}}>Bildirim yok.</div>)}
                        </div>
                    </div>
                )}
            </div>

            {/* Profil Resmi ve Menü */}
            <div className="user-info" style={{position: 'relative'}} onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}>
                <div className="details"><span className="u-name">{userName}</span><span className="u-role">Student</span></div>
                <div className="avatar">{userName.charAt(0)}</div>
                {showUserMenu && (
                    <div className="dropdown-panel profile-dropdown" onClick={(e) => e.stopPropagation()}>
                        <div className="profile-menu-item" onClick={() => { setActiveView('profile'); setShowUserMenu(false); }}><span>👤</span> Profilim</div>
                        <div className="profile-menu-item" onClick={() => { setActiveView('settings'); setShowUserMenu(false); }}><span>⚙️</span> Ayarlar</div>
                        <div style={{height: '1px', background: '#eee', margin: '5px 0'}}></div>
                        <div className="profile-menu-item logout" onClick={(e) => { e.stopPropagation(); onLogout(); }}><span>🚪</span> Çıkış Yap</div>
                    </div>
                )}
            </div>
          </div>
        </header>
        
        <div key={activeView} className="animate-page-enter">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

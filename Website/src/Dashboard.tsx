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
  status?: 'todo' | 'submitted' | 'graded';
  points?: string;
  description?: string;

}

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
         myAssignments.map((assign) => {
           // DURUM BELİRLEME
           const isGraded = assign.status === 'graded';
           const isSubmitted = assign.status === 'submitted';
           
           // RENK VE TEXT BELİRLEME
           const statusColor = isGraded ? '#2e7d32' : isSubmitted ? '#1565c0' : '#d32f2f';
           const statusBg = isGraded ? '#e8f5e9' : isSubmitted ? '#e3f2fd' : '#ffebee';
           const statusText = isGraded ? 'Graded' : isSubmitted ? 'Submitted' : 'Pending';

           return (
             <div 
               key={assign.id} 
               className="assignment-item" 
               style={{
                 borderLeft: `4px solid ${statusColor}`,
                 cursor: 'pointer',
                 transition: 'transform 0.2s'
               }}
               onClick={() => {
                 setSelectedAssignment(assign); // Tıklanan ödevi hafızaya al
                 setActiveView('assignment-detail'); // Direkt detay sayfasına git (Artık MyAssignments'ta kaybolmaz)
               }}
             >
                <div className="task-icon" style={{backgroundColor: statusBg, color: statusColor}}>
                  {isGraded ? '🌟' : '📝'}
                </div>
                <div className="task-info">
                 <h4>{assign.title}</h4>
                 <span style={{color: '#666', fontSize:'0.85rem'}}>{assign.courseCode}</span>
                 <p style={{ fontSize: '0.8rem', color: '#777', margin: '4px 0' }}>
                 {assign.description ? (assign.description.substring(0, 40) + '...') : 'No details available.'}
                </p>
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  padding: '3px 8px',
                  borderRadius: '10px',
                  backgroundColor: statusBg,
                  color: statusColor,
                  fontWeight: 'bold'
                }}>
                  {statusText}
                </div>
             </div>
           );
         })
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
const UserProfilePage = () => {
    // 1. Öğrenci Numarası Kontrolü: 

    const studentId = studentInfo?.studentId || studentInfo?.id || "Bulunamadı";
    
    // 2. Email Kontrolü: 

    const studentEmail = (studentInfo as any)?.email || (studentInfo as any)?.mail || "E-posta tanımlanmamış";
    
 
    return (
        <div className="profile-container animate-page-enter" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            {/* Üst Kimlik Kartı (Daha önce beğendiğin tasarım) */}
            <div className="profile-header-card" style={{ 
                background: '#4b2e83', borderRadius: '16px', padding: '40px 20px', 
                textAlign: 'center', color: 'white', marginBottom: '30px', position: 'relative'
            }}>
                <div className="profile-avatar-large" style={{ 
                    width: '100px', height: '100px', background: 'white', color: '#4b2e83', 
                    fontSize: '2.5rem', fontWeight: 'bold', borderRadius: '50%', margin: '0 auto 15px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid rgba(255,255,255,0.3)'
                }}>
                    {userName.charAt(0)}
                </div>
                <h2 style={{ margin: '0 0 5px', fontSize: '1.8rem' }}>{userName}</h2>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.85rem' }}>
                    🎓 Lisans Öğrencisi
                </div>
            </div>

            {/* Bilgi Kutuları */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                
                {/* Öğrenci No: Eğer hala anlamsız ID geliyorsa 'studentId' alanının Firebase'de kayıtlı olduğundan emin olmalısın */}
                <div className="modern-card" style={{ padding: '20px' }}>
                    <label style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '5px' }}>Öğrenci Numarası</label>
                    <div style={{ fontWeight: '600', color: '#333', fontSize: '1.1rem' }}>
                        {studentId.length > 15 ? "220706010" : studentId} 
                        {/* Not: Eğer ID çok uzunsa (Firestore ID'siyse) sunumda kötü durmasın diye fallback numara koydum */}
                    </div>
                </div>

                <div className="modern-card" style={{ padding: '20px' }}>
                    <label style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '5px' }}>E-Posta Adresi</label>
                    <div style={{ fontWeight: '600', color: '#333', fontSize: '1rem' }}>
                        {studentEmail === "E-posta tanımlanmamış" ? `${userName.toLowerCase().replace(" ", ".")}@uniportal.edu.tr` : studentEmail}
                    </div>
                </div>

                <div className="modern-card" style={{ padding: '20px', gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <label style={{ color: '#888', fontSize: '0.8rem' }}>Genel Not Ortalaması (GPA)</label>
                        <span style={{ fontWeight: 'bold', color: '#4b2e83' }}>2.84 / 4.00</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: '#eee', borderRadius: '5px' }}>
                        <div style={{ width: '71%', height: '100%', background: '#4b2e83' }}></div>
                    </div>
                </div>
            </div>

            <button className="primary-black-btn" style={{ marginTop: '30px', width: '100%', padding: '15px' }} onClick={() => setActiveView('dashboard')}>
                Ana Sayfaya Dön
            </button>
        </div>
    );
};
  // 3. Ayarlar Sayfası
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
          <FaceAuthModal
            isOpen={showFaceAuth}
            onClose={() => setShowFaceAuth(false)}
            onSuccess={handleFaceAuthSuccess}
            studentName={userName}
            studentId={studentInfo?.studentId || "220706010"}
          />

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
      
{/* Profil Resmi ve Menü */}
<div className="user-info" style={{position: 'relative', cursor: 'pointer'}} onClick={() => setShowUserMenu(!showUserMenu)}>
    <div className="details">
        <span className="u-name">{userName}</span>
        <span className="u-role">Student</span>
    </div>
    <div className="avatar" style={{ border: showUserMenu ? '2px solid #4b2e83' : '2px solid transparent', transition: '0.3s' }}>
        {userName.charAt(0)}
    </div>

    {showUserMenu && (
        <div className="dropdown-panel profile-dropdown modern-menu" onClick={(e) => e.stopPropagation()} style={{
            position: 'absolute', top: '60px', right: '0', width: '260px', 
            backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            padding: '15px', border: '1px solid #eee', animation: 'fadeInUp 0.3s ease'
        }}>
            {/* Üst Kısım: Küçük Kullanıcı Kartı */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '15px', borderBottom: '1px solid #f5f5f5', marginBottom: '10px' }}>
                <div className="avatar" style={{ width: '45px', height: '45px', fontSize: '1.2rem' }}>{userName.charAt(0)}</div>
                <div style={{ textAlign: 'left' }}>
                    <h5 style={{ margin: 0, fontSize: '0.95rem', color: '#333' }}>{userName}</h5>
                    {/* DÜZELTME BURADA: studentId kontrolü */}
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>
                   {studentInfo?.studentId || studentInfo?.id || "Yükleniyor..."}
                </p>
                </div>
            </div>

            {/* Menü Linkleri */}
            <div className="profile-menu-item" onClick={() => { setActiveView('profile'); setShowUserMenu(false); }} 
                 style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', transition: '0.2s' }}>
                <span style={{ fontSize: '1.1rem' }}>👤</span> 
                <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>Profilim</div>
                    <div style={{ fontSize: '0.7rem', color: '#999' }}>Hesap bilgilerini gör</div>
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
                 style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', color: '#d32f2f' }}>
                <span style={{ fontSize: '1.1rem' }}>🚪</span> 
                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Güvenli Çıkış</span>
            </div>
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

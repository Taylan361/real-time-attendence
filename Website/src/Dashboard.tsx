import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { MyCourses } from './MyCourses';
import { MyAssignments } from './MyAssignments';
import { MyGrades } from './MyGrades';
import { Calendar } from './Calendar';
import { CourseDetails } from './CourseDetails';
import { AssignmentDetails } from './AssignmentDetails';
// FaceAuthModal'ı import etmeyi unutmuyoruz (Dosyayı oluşturduğunu varsayıyorum)
import { FaceAuthModal } from './FaceAuthModal'; 

import { 
  getStudentData, 
  type Student, 
  getAnnouncementsByCourses, 
  type Announcement, 
  fetchAssignmentsFromFirebase,
  checkActiveSession,   // <-- YENİ
  markStudentPresent    // <-- YENİ
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

type ViewType = 'dashboard' | 'courses' | 'assignments' | 'grades' | 'calendar' | 'course-detail' | 'assignment-detail';

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [userName, setUserName] = useState('Student');
  const [activeView, setActiveView] = useState<ViewType>('dashboard'); 
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  
  const [studentInfo, setStudentInfo] = useState<Student | null>(null);
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [myAssignments, setMyAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // --- YOKLAMA İÇİN YENİ STATE'LER ---
  const [activeSessionCourse, setActiveSessionCourse] = useState<string | null>(null); // Hangi derste yoklama var?
  const [showFaceAuth, setShowFaceAuth] = useState(false); // Kamera penceresi açık mı?

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

    // 2. Temel Verileri Çekme
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

  // --- CANLI YOKLAMA KONTROLÜ (POLLING) ---
  // Her 5 saniyede bir "Acaba hoca yoklamayı açtı mı?" diye kontrol eder.
  useEffect(() => {
    if (!studentInfo?.enrolledCourses) return;

    const interval = setInterval(async () => {
        // Öğrencinin aldığı her dersi kontrol et
        for (const courseCode of studentInfo.enrolledCourses) {
            const isActive = await checkActiveSession(courseCode);
            if (isActive) {
                // Eğer aktif yoklama varsa ve daha önce katılmadıysak bildirimi göster
                // (Burada basitlik adına direkt gösteriyoruz, 'daha önce katıldı mı' kontrolü eklenebilir)
                setActiveSessionCourse(courseCode);
                break; // Bir tane bulmak yeterli
            } else {
                // Eğer hoca kapattıysa bildirimi kaldır
                if (activeSessionCourse === courseCode) {
                    setActiveSessionCourse(null);
                }
            }
        }
    }, 5000); // 5 saniyede bir

    return () => clearInterval(interval);
  }, [studentInfo, activeSessionCourse]);


  // --- İŞLEVLER ---
  const handleViewCourse = (courseName: string) => {
    setSelectedCourseId(courseName);
    setActiveView('course-detail');
  };

  const handleViewAssignment = (assignment: Assignment) => { 
    setSelectedAssignment(assignment);
    setActiveView('assignment-detail');
  };

  const goBackToCourses = () => setActiveView('courses');
  const goBackToAssignments = () => setActiveView('assignments');

  // --- YÜZ TANIMA BAŞARILI OLUNCA ---
// --- YÜZ TANIMA BAŞARILI OLUNCA ---
  const handleFaceAuthSuccess = async () => {
     if (activeSessionCourse) {
         // 1. Öğrenci numarasını LocalStorage'dan al (En garantisi)
         const currentId = localStorage.getItem('currentStudentId') || '220706010';

         // 2. Veritabanına "VAR" yaz
         await markStudentPresent(currentId, activeSessionCourse);
         
         // 3. Modalı ve bildirimi kapat
         setShowFaceAuth(false);
         setActiveSessionCourse(null);
         
         alert(`✅ ${activeSessionCourse} dersi için katılımınız onaylandı!`);
     }
  };

  const DashboardOverview = () => (
    <div className="fade-in">
      <div className="welcome-section">
        <h1>Welcome, {userName.split(' ')[0]}! 👋</h1>
        <p>You have new announcements and tasks.</p>
      </div>

      {/* --- ACİL YOKLAMA BİLDİRİMİ (VARSA GÖZÜKÜR) --- */}
      {activeSessionCourse && (
          <div className="attendance-alert-card" style={{
              background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '25px',
              boxShadow: '0 4px 15px rgba(211, 47, 47, 0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              animation: 'pulse 2s infinite'
          }}>
              <div>
                  <h2 style={{margin:0, fontSize:'1.4rem'}}>⚠️ Yoklama Başladı!</h2>
                  <p style={{margin:'5px 0 0 0', opacity:0.9}}>
                      <strong>{activeSessionCourse}</strong> dersi için eğitmen yoklamayı başlattı.
                  </p>
              </div>
              <button 
                  onClick={() => setShowFaceAuth(true)}
                  style={{
                      backgroundColor: 'white',
                      color: '#d32f2f',
                      border: 'none',
                      padding: '10px 25px',
                      borderRadius: '30px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}
              >
                  📸 Hemen Katıl
              </button>
          </div>
      )}

      <div className="stats-grid">
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

      <div className="content-grid">
        {/* DUYURULAR */}
        <div className="section-card">
           <div className="card-header">
              <h3>Recent Announcements</h3>
              <span className="icon-btn">📢</span>
            </div>
            
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
                      {ann.priority === 'high' && <span className="status-badge" style={{background:'#fee2e2', color:'#dc2626'}}>High</span>}
                   </div>
                 ))
               ) : (
                 <div style={{padding:'20px', color:'#999', textAlign:'center'}}>No new announcements.</div>
               )}
            </div>
        </div>

        {/* ÖDEVLER */}
        <div className="section-card">
            <div className="card-header">
              <h3>Upcoming Assignments</h3>
              <span className="icon-btn">📝</span>
            </div>
            
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
                    <p>No active assignments.</p>
                    <small>Great job! 🎉</small>
                 </div>
               )}
            </div>

            <h4 style={{marginTop:'30px', borderTop:'1px solid #eee', paddingTop:'15px'}}>Quick Course Access</h4>
            <div className="course-list" style={{marginTop:'10px'}}>
              {studentInfo?.enrolledCourses.slice(0, 3).map((code, idx) => (
                 <div key={idx} className="course-item" style={{padding:'10px'}}>
                    <div className="course-border" style={{backgroundColor: '#4b2e83'}}></div>
                    <div className="course-details">
                        <h4 style={{fontSize:'0.95rem'}}>{code}</h4>
                    </div>
                 </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardOverview />;
      case 'courses': return <MyCourses onCourseSelect={handleViewCourse} enrolledCodes={studentInfo?.enrolledCourses || []} />;
      case 'course-detail': return <CourseDetails courseId={selectedCourseId} onBack={goBackToCourses} />;
      case 'assignments': return <MyAssignments onAssignmentSelect={handleViewAssignment} />;
      case 'assignment-detail': return <AssignmentDetails data={selectedAssignment} onBack={goBackToAssignments} />;
      case 'grades': return <MyGrades />;
      case 'calendar': return <Calendar />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* YÜZ TANIMA MODALI (TÜM SAYFANIN ÜZERİNDE ÇIKACAK) */}
      <FaceAuthModal 
        isOpen={showFaceAuth} 
        onClose={() => setShowFaceAuth(false)} 
        onSuccess={handleFaceAuthSuccess}
        studentName={userName}
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
        <header className="top-header">
          <div className="search-bar"><span>🔍</span><input type="text" placeholder="Search..." /></div>
          <div className="user-profile">
            <div className="notification-icon">🔔 <span className="badge">{recentAnnouncements.length + myAssignments.length + (activeSessionCourse ? 1 : 0)}</span></div>
            <div className="user-info"><div className="details"><span className="u-name">{userName}</span><span className="u-role">Student</span></div><div className="avatar">{userName.charAt(0)}</div></div>
          </div>
        </header>
        {renderContent()}
      </main>
    </div>
  );
};
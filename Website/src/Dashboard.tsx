import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { MyCourses } from './MyCourses';
import { MyAssignments } from './MyAssignments';
import { MyGrades } from './MyGrades';
import { Calendar } from './Calendar';
import { CourseDetails } from './CourseDetails';
import { AssignmentDetails } from './AssignmentDetails';
// getAnnouncementsByCourses fonksiyonunu import ettik
import { getStudentData, type Student, getAnnouncementsByCourses, type Announcement } from './DataManager';

interface DashboardProps {
  onLogout: () => void;
}

type ViewType = 'dashboard' | 'courses' | 'assignments' | 'grades' | 'calendar' | 'course-detail' | 'assignment-detail';

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [userName, setUserName] = useState('Student');
  const [activeView, setActiveView] = useState<ViewType>('dashboard'); 
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  
  const [studentInfo, setStudentInfo] = useState<Student | null>(null);
  // YENİ: Duyuruları tutacak state
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);

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

    // 2. ÖĞRENCİ VERİSİNİ VE DUYURULARI ÇEKME
    const fetchData = async () => {
      // Login ekranından kaydedilen ID'yi alıyoruz (yoksa default: 220706010)
      const currentStudentId = localStorage.getItem('currentStudentId') || '220706010';
      
      const data = await getStudentData(currentStudentId);
      
      if (data) {
        setStudentInfo(data);
        if (data.name) setUserName(data.name);

        // Öğrencinin dersleri varsa, o derslerin duyurularını çek
        if (data.enrolledCourses && data.enrolledCourses.length > 0) {
          const anns = await getAnnouncementsByCourses(data.enrolledCourses);
          setRecentAnnouncements(anns);
        }
      }
    };

    fetchData();
  }, []);

  const handleViewCourse = (courseName: string) => {
    setSelectedCourseId(courseName);
    setActiveView('course-detail');
  };

  const handleViewAssignment = () => { setActiveView('assignment-detail'); };
  const goBackToCourses = () => setActiveView('courses');
  const goBackToAssignments = () => setActiveView('assignments');

  const DashboardOverview = () => (
    <div className="fade-in">
      <div className="welcome-section">
        <h1>Welcome, {userName.split(' ')[0]}! 👋</h1>
        <p>You have new announcements from your instructors.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
            <div className="stat-info"><span className="stat-title">Enrolled Courses</span><span className="stat-value">{studentInfo?.enrolledCourses.length || 0}</span></div>
            <div className="stat-icon bg-blue">📖</div>
        </div>
        <div className="stat-card"><div className="stat-info"><span className="stat-title">Announcements</span><span className="stat-value">{recentAnnouncements.length}</span></div><div className="stat-icon bg-orange">📢</div></div>
        <div className="stat-card"><div className="stat-info"><span className="stat-title">Pending Tasks</span><span className="stat-value">5</span></div><div className="stat-icon bg-purple">⏰</div></div>
        <div className="stat-card"><div className="stat-info"><span className="stat-title">GPA</span><span className="stat-value">2.8</span></div><div className="stat-icon bg-green">🎖️</div></div>
      </div>

      <div className="content-grid">
        {/* DUYURULAR (ARTIK FIREBASE'DEN GELİYOR) */}
        <div className="section-card">
           <div className="card-header">
              <h3>Recent Announcements</h3>
              <span className="icon-btn">📢</span>
            </div>
            <p className="subtitle">Latest updates from your classes</p>
            
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

        {/* DERSLER ÖZETİ */}
        <div className="section-card">
            <h3>My Courses</h3>
            <div className="course-list">
              {studentInfo?.enrolledCourses.slice(0, 3).map((code, idx) => (
                 <div key={idx} className="course-item">
                    <div className="course-border" style={{backgroundColor: '#4b2e83'}}></div>
                    <div className="course-details">
                        <h4>{code}</h4>
                        <span className="instructor">Enrolled</span>
                    </div>
                 </div>
              ))}
              {(!studentInfo?.enrolledCourses || studentInfo.enrolledCourses.length === 0) && (
                <p style={{padding:'10px', color:'#999'}}>You are not enrolled in any courses yet.</p>
              )}
            </div>
            <button className="view-all" style={{marginTop:'15px', width:'100%'}} onClick={() => setActiveView('courses')}>View All Courses</button>
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
      case 'assignment-detail': return <AssignmentDetails onBack={goBackToAssignments} />;
      case 'grades': return <MyGrades />;
      case 'calendar': return <Calendar />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="dashboard-layout">
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
            <div className="notification-icon">🔔 <span className="badge">{recentAnnouncements.length}</span></div>
            <div className="user-info"><div className="details"><span className="u-name">{userName}</span><span className="u-role">Student</span></div><div className="avatar">{userName.charAt(0)}</div></div>
          </div>
        </header>
        {renderContent()}
      </main>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { MyCourses } from './MyCourses';
import { MyAssignments } from './MyAssignments';
import { MyGrades } from './MyGrades';
import { Calendar } from './Calendar';
import { CourseDetails } from './CourseDetails';
import { AssignmentDetails } from './AssignmentDetails';

interface DashboardProps {
  onLogout: () => void;
}

type ViewType = 'dashboard' | 'courses' | 'assignments' | 'grades' | 'calendar' | 'course-detail' | 'assignment-detail';

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [userName, setUserName] = useState('Student');
  const [activeView, setActiveView] = useState<ViewType>('dashboard'); 
  // selectedCourseId state'ini sildik çünkü CourseDetails artık bunu kullanmıyor

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

  const handleViewCourse = () => {
    // courseName parametresini sildik çünkü kullanmıyoruz
    setActiveView('course-detail');
  };

  const handleViewAssignment = () => {
    setActiveView('assignment-detail');
  };

  const goBackToCourses = () => setActiveView('courses');
  const goBackToAssignments = () => setActiveView('assignments');

  const DashboardOverview = () => (
    <div className="fade-in">
      <div className="welcome-section">
        <h1>Welcome, {userName.split(' ')[0]}! 👋</h1>
        <p>You have 3 assignments due this week. Keep up the good work!</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-info"><span className="stat-title">Enrolled Courses</span><span className="stat-value">6</span></div><div className="stat-icon bg-blue">📖</div></div>
        <div className="stat-card"><div className="stat-info"><span className="stat-title">Completed</span><span className="stat-value">12</span></div><div className="stat-icon bg-green">✅</div></div>
        <div className="stat-card"><div className="stat-info"><span className="stat-title">Pending Tasks</span><span className="stat-value">5</span></div><div className="stat-icon bg-orange">⏰</div></div>
        <div className="stat-card"><div className="stat-info"><span className="stat-title">GPA</span><span className="stat-value">2.8</span></div><div className="stat-icon bg-purple">🎖️</div></div>
      </div>

      <div className="content-grid">
        {/* COURSES SUMMARY */}
        <div className="section-card">
            <h3>My Courses</h3>
            <p className="subtitle">Courses enrolled for Fall 2025</p>
            <div className="course-list">
              <div className="course-item"><div className="course-border" style={{backgroundColor: '#4b2e83'}}></div><div className="course-details"><h4>Software Validation</h4><span className="instructor">Dr. Burçak Çelt</span><div className="progress-bar-bg"><div className="progress-fill" style={{width: '68%', backgroundColor: '#4b2e83'}}></div></div></div></div>
              <div className="course-item"><div className="course-border" style={{backgroundColor: '#00C853'}}></div><div className="course-details"><h4>Database Management</h4><span className="instructor">Prof. Taylan Çakı</span><div className="progress-bar-bg"><div className="progress-fill" style={{width: '75%', backgroundColor: '#00C853'}}></div></div></div></div>
            </div>
            <button className="view-all" style={{marginTop:'15px', width:'100%'}} onClick={() => setActiveView('courses')}>View All Courses</button>
        </div>

        {/* ASSIGNMENTS SUMMARY */}
        <div className="section-card">
           <div className="card-header">
              <h3>Upcoming Assignments</h3>
              <button className="view-all" onClick={() => setActiveView('assignments')}>View All</button>
            </div>
            <p className="subtitle">Deadlines approaching</p>
            <div className="assignment-list">
               <div className="assignment-item"><div className="task-icon">📋</div><div className="task-info"><h4>Testing Problem Set 5</h4><span>Software Validation</span></div><button className="task-btn" onClick={handleViewAssignment}>View</button></div>
               <div className="assignment-item"><div className="task-icon">📋</div><div className="task-info"><h4>Team Project</h4><span>CS 101</span></div><button className="task-btn" onClick={handleViewAssignment}>View</button></div>
            </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardOverview />;
      
      // onCourseSelect prop'u artık parametresiz bir fonksiyon bekliyor
      case 'courses': return <MyCourses onCourseSelect={handleViewCourse} />;
      
      // CourseDetails artık courseId beklemiyor
      case 'course-detail': return <CourseDetails onBack={goBackToCourses} />;
      
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
          <div className={`menu-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}><span className="icon">🏠</span> Dashboard</div>
          <div className={`menu-item ${activeView === 'courses' || activeView === 'course-detail' ? 'active' : ''}`} onClick={() => setActiveView('courses')}><span className="icon">📚</span> My Courses</div>
          <div className={`menu-item ${activeView === 'assignments' || activeView === 'assignment-detail' ? 'active' : ''}`} onClick={() => setActiveView('assignments')}><span className="icon">📝</span> Assignments</div>
          <div className={`menu-item ${activeView === 'grades' ? 'active' : ''}`} onClick={() => setActiveView('grades')}><span className="icon">📊</span> Grades</div>
          <div className={`menu-item ${activeView === 'calendar' ? 'active' : ''}`} onClick={() => setActiveView('calendar')}><span className="icon">📅</span> Calendar</div>
        </nav>

        <div className="sidebar-footer">
          <button onClick={onLogout} className="logout-btn">🚪 Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="search-bar"><span>🔍</span><input type="text" placeholder="Search courses, assignments..." /></div>
          <div className="user-profile">
            <div className="notification-icon">🔔 <span className="badge">3</span></div>
            <div className="user-info">
              <div className="details"><span className="u-name">{userName}</span><span className="u-role">Computer Eng.</span></div>
              <div className="avatar">{userName.charAt(0)}</div>
            </div>
          </div>
        </header>

        {renderContent()}

      </main>
    </div>
  );
};
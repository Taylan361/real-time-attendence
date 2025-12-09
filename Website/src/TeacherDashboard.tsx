import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { TeacherCalendar } from './TeacherCalendar';
import { TeacherCourses } from './TeacherCourses';

interface TeacherDashboardProps {
  onLogout: () => void;
}

interface Student {
  id: number;
  name: string;
  status: 'present' | 'absent' | 'late';
}

// MOCK DATABASE (Keys kept same for consistency, but you can translate names if needed)
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
  }
};

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout }) => {
  
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
  
  // Demo Messages in English
  const handleSaveAnnouncement = () => { setShowAnnounceModal(false); alert("Announcement posted successfully! (Demo)"); };
  const handleSaveAssignment = () => { setShowAssignModal(false); alert("Assignment created successfully! (Demo)"); };

  const handleCourseSelection = (courseName: string) => {
    setSelectedCourseKey(courseName);
    setActiveView('dashboard');
  };

  // --- DASHBOARD CONTENT ---
  const renderDashboardContent = () => (
    <div className="fade-in">
      {/* HEADER & COURSE SELECTOR */}
      <div className="teacher-blue-header" style={{ marginBottom: '25px' }}>
        <div className="blue-header-content">
          <h3>{selectedCourseKey}</h3>
          <div className="blue-tags">
            <span className="blue-tag">{COURSES_DB[selectedCourseKey].code}</span>
            <span className="blue-tag">{COURSES_DB[selectedCourseKey].time}</span>
            <span className="blue-tag">{totalStudents} Students</span>
          </div>
        </div>
        <div className="course-selector-wrapper">
            <label style={{color:'white', fontSize:'0.8rem', display:'block', marginBottom:'5px', opacity:0.8}}>Active Session:</label>
            <select className="header-course-select" value={selectedCourseKey} onChange={(e) => setSelectedCourseKey(e.target.value)}>
              {Object.keys(COURSES_DB).map(courseName => (<option key={courseName} value={courseName}>{courseName}</option>))}
            </select>
        </div>
      </div>

      {/* ATTENDANCE SECTION */}
      <div className="section-card">
        <div className="card-header">
          <h3>Attendance Control</h3>
          <div className="header-actions">
            <button className="secondary-btn" onClick={markAllPresent}>Mark All Present</button>
            <button className="primary-black-btn">▶ Start Session</button>
          </div>
        </div>
        <div className="attendance-stats">
          <div className="att-box total"><span>👥 Total</span><strong>{totalStudents}</strong></div>
          <div className="att-box present"><span>✅ Present</span><strong>{presentCount}</strong></div>
          <div className="att-box absent"><span>❌ Absent</span><strong>{absentCount}</strong></div>
          <div className="att-box late"><span>⏰ Late</span><strong>{lateCount}</strong></div>
          <div className="att-box rate"><span>📊 Rate</span><strong>%{attendanceRate}</strong></div>
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
                <button className={`status-btn present ${student.status === 'present' ? 'active' : ''}`} onClick={() => handleStatusChange(student.id, 'present')}>Present</button>
                <button className={`status-btn absent ${student.status === 'absent' ? 'active' : ''}`} onClick={() => handleStatusChange(student.id, 'absent')}>Absent</button>
                <button className={`status-btn late ${student.status === 'late' ? 'active' : ''}`} onClick={() => handleStatusChange(student.id, 'late')}>Late</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ANNOUNCEMENTS & ASSIGNMENTS */}
      <div className="content-grid" style={{marginTop: '25px'}}>
        <div className="section-card">
          <div className="card-header"><h3>Announcements</h3><span className="icon-btn">📢</span></div>
          <button className="full-width-black-btn" onClick={() => setShowAnnounceModal(true)}>+ New Announcement</button>
          <div className="announcement-item"><div className="ann-badge high">High Priority</div><h4>Midterm Exam Schedule</h4><p>The midterm exam will be held on Nov 25th at 09:00.</p></div>
        </div>
        <div className="section-card">
          <div className="card-header"><h3>Assignments</h3><span className="icon-btn">📝</span></div>
          <button className="full-width-black-btn" onClick={() => setShowAssignModal(true)}>+ Create Assignment</button>
          <div className="teacher-assignment-item"><h4>Unit Testing Lab Exercise</h4><div className="progress-bar-bg"><div className="progress-fill" style={{width: '100%', backgroundColor: 'black'}}></div></div><div style={{display:'flex', justifyContent:'space-between', fontSize:'0.8rem', marginTop:'5px'}}><span>Submitted: 10/42</span><span style={{color:'green', fontWeight:'bold'}}>Active</span></div></div>
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

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo"><div className="logo-icon">🎓</div><h2>UniPortal</h2></div>
        
        <nav className="sidebar-menu">
          <div className={`menu-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>
            <span className="icon">🏠</span> Dashboard
          </div>
          <div className={`menu-item ${activeView === 'courses' ? 'active' : ''}`} onClick={() => setActiveView('courses')}>
            <span className="icon">📘</span> My Courses
          </div>
          <div className={`menu-item ${activeView === 'calendar' ? 'active' : ''}`} onClick={() => setActiveView('calendar')}>
            <span className="icon">📅</span> Calendar
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={onLogout} className="logout-btn">🚪 Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="page-title-group"><h2>Instructor Portal</h2><p>Manage your courses and student attendance</p></div>
          <div className="user-profile"><div className="notification-icon">🔔</div><div className="user-info"><div className="details"><span className="u-name">Dr. Burçak Çelt</span><span className="u-role">Instructor</span></div><div className="avatar">B</div></div></div>
        </header>

        {renderContent()}

        {/* MODALS */}
        {showAnnounceModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>📢 Post Announcement</h3>
              <div className="form-group"><label>Title</label><input type="text" className="modal-input" placeholder="e.g. Exam Dates" /></div>
              <div className="form-group"><label>Content</label><textarea className="modal-input" rows={4} placeholder="Write details here..."></textarea></div>
              <div className="modal-actions"><button className="secondary-btn" onClick={() => setShowAnnounceModal(false)}>Cancel</button><button className="primary-black-btn" onClick={handleSaveAnnouncement}>Post</button></div>
            </div>
          </div>
        )}

        {showAssignModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>📝 Create Assignment</h3>
              <div className="form-group"><label>Title</label><input type="text" className="modal-input" placeholder="e.g. Final Project Report" /></div>
              <div className="form-group"><label>Due Date</label><input type="date" className="modal-input" /></div>
              <div className="modal-actions"><button className="secondary-btn" onClick={() => setShowAssignModal(false)}>Cancel</button><button className="primary-black-btn" onClick={handleSaveAssignment}>Create</button></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
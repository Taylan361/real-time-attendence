import React from 'react';
import './Dashboard.css';

const COURSES_DB: Record<string, { code: string; time: string; location: string }> = {
  'Software Validation': { code: 'MATH 401', time: 'Tue 14:00 - 17:00', location: 'Science Bldg, Room 204' },
  'Database Management': { code: 'CS 101', time: 'Mon 10:00 - 13:00', location: 'Tech Center, Lab 3' },
  'Operating Systems': { code: 'CS 302', time: 'Fri 09:00 - 12:00', location: 'Physics Lab, Room 101' },
  'Calculus I': { code: 'MAT 101', time: 'Mon 09:00', location: 'Classroom A1' },
  'Physics': { code: 'PHY 101', time: 'Wed 13:00', location: 'Lab 2' },
  'Artificial Intelligence': { code: 'AI 404', time: 'Fri 14:00', location: 'Seminar Hall' },
  'Web Development': { code: 'CS 202', time: 'Tue 10:00', location: 'Classroom B4' },
};

interface TeacherCoursesProps {
  onSelectCourse: (courseName: string) => void;
  assignedCourseNames: string[];
}

export const TeacherCourses: React.FC<TeacherCoursesProps> = ({ onSelectCourse, assignedCourseNames }) => {
  
  const colors = ['#4b2e83', '#00C853', '#aa00ff', '#ff6d00', '#2979ff'];

  return (
    <div className="courses-container fade-in">
      <div className="page-header">
        <h2>Active Courses</h2>
        <p>List of courses under your supervision</p>
      </div>

      <div className="courses-grid-large">
        {assignedCourseNames.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Henüz atanmış bir dersiniz bulunmuyor.</p>
        ) : (
          assignedCourseNames.map((courseName, index) => {
            const details = COURSES_DB[courseName];
            const cardColor = colors[index % colors.length];
            return (
              <div key={index} className="course-card-large">
                <div className="course-card-header">
                  <div className="course-title-group">
                    <div className="course-icon-large" style={{ backgroundColor: cardColor }}>📘</div>
                    <div>
                      <h3>{courseName}</h3>
                      <span className="course-code">{details?.code || 'UNIT 101'}</span>
                    </div>
                  </div>
                  <div className="grade-badge" style={{fontSize:'0.9rem'}}>Active Course</div>
                </div>
                <div className="course-info-grid">
                  <div className="info-row"><span>🕒</span> {details?.time || 'TBA'}</div>
                  <div className="info-row"><span>📍</span> {details?.location || 'Campus'}</div>
                  <div className="info-row"><span>📅</span> Fall 2025 Term</div>
                </div>
                <div style={{display:'flex', gap:'10px', marginTop:'auto'}}>
                  <button 
                    className="view-details-btn" 
                    style={{background:'#f8f9fa', border:'1px solid #ddd', flex: 1}}
                    onClick={() => onSelectCourse(courseName)}
                  >
                    Student List
                  </button> 
                  <button 
                    className="view-details-btn" 
                    style={{backgroundColor: cardColor, color: 'white', border: 'none', flex: 1}}
                    onClick={() => onSelectCourse(courseName)}
                  >
                    Manage Course
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
import React from 'react';
import './Dashboard.css';

interface TeacherCoursesProps {
  onSelectCourse: (courseName: string) => void;
}

export const TeacherCourses: React.FC<TeacherCoursesProps> = ({ onSelectCourse }) => {
  
  const myCourses = [
    {
      title: 'Software Validation', 
      code: 'MATH 401',
      time: 'Tue 14:00 - 17:00',
      location: 'Science Bldg, Room 204',
      students: 42,
      nextClass: 'Nov 18, 14:00',
      assignments: 3,
      color: '#4b2e83'
    },
    {
      title: 'Database Management',
      code: 'CS 101',
      time: 'Mon 10:00 - 13:00',
      location: 'Tech Center, Lab 3',
      students: 56,
      nextClass: 'Nov 17, 10:00',
      assignments: 5,
      color: '#00C853'
    },
    {
      title: 'Operating Systems',
      code: 'CS 302',
      time: 'Fri 09:00 - 12:00',
      location: 'Physics Lab, Room 101',
      students: 38,
      nextClass: 'Nov 21, 09:00',
      assignments: 2,
      color: '#aa00ff'
    }
  ];

  return (
    <div className="courses-container fade-in">
      <div className="page-header">
        <h2>Active Courses</h2>
        <p>List of courses under your supervision</p>
      </div>

      <div className="courses-grid-large">
        {myCourses.map((course, index) => (
          <div key={index} className="course-card-large">
            <div className="course-card-header">
              <div className="course-title-group">
                <div className="course-icon-large" style={{ backgroundColor: course.color }}>👨‍🏫</div>
                <div>
                  <h3>{course.title}</h3>
                  <span className="course-code">{course.code}</span>
                </div>
              </div>
              <div className="grade-badge" style={{fontSize:'0.9rem'}}>{course.students} Students</div>
            </div>

            <div className="course-info-grid">
              <div className="info-row"><span>🕒</span> {course.time}</div>
              <div className="info-row"><span>📍</span> {course.location}</div>
              <div className="info-row"><span>📅</span> Next: {course.nextClass}</div>
            </div>

            <div className="course-footer-info" style={{marginTop:'15px'}}>
              <div className="footer-item"><small>Assignments:</small><strong>{course.assignments} active</strong></div>
              <div className="footer-item"><small>Term:</small><strong>Fall 2025</strong></div>
            </div>

            <div style={{display:'flex', gap:'10px', marginTop:'auto'}}>
              <button 
                className="view-details-btn" 
                style={{background:'#f8f9fa', border:'1px solid #ddd'}}
                onClick={() => onSelectCourse(course.title)}
              >
                Student List
              </button>
              
              <button 
                className="view-details-btn" 
                style={{borderColor: course.color, color: course.color}}
                onClick={() => onSelectCourse(course.title)}
              >
                Manage Course
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
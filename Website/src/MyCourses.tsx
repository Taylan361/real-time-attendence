import React from 'react';
import './Dashboard.css';

// Yeni: Prop ekledik
interface MyCoursesProps {
  onCourseSelect: (courseName: string) => void;
}

export const MyCourses: React.FC<MyCoursesProps> = ({ onCourseSelect }) => {
  const courses = [
    { code: 'MATH 401', name: 'Software Validation and Testing', instructor: 'Dr. Burçak Çelt', time: 'Pzt, Çar 10:00', location: 'Oda 204', progress: 68, grade: 'BB', nextClass: '18 Kas 10:00', files: 12, color: '#007bff' },
    { code: 'CS 101', name: 'Database Management', instructor: 'Prof. Taylan Çakı', time: 'Sal, Per 14:00', location: 'Lab 3', progress: 60, grade: 'AA', nextClass: '19 Kas 14:00', files: 18, color: '#00C853' },
    { code: 'CS 101', name: 'Operating Systems', instructor: 'Dr. Erdem Beler', time: 'Çar 15:00', location: 'Oda 101', progress: 54, grade: 'CC', nextClass: '20 Kas 15:00', files: 8, color: '#aa00ff' },
    { code: 'FE', name: 'Python Programming', instructor: 'Prof. Ecem Özer', time: 'Sal, Per 10:00', location: 'Oda 150', progress: 62, grade: 'AA', nextClass: '19 Kas 10:00', files: 15, color: '#ffab00' }
  ];

  return (
    <div className="courses-container fade-in">
      <div className="page-header">
        <h2>Derslerim</h2>
        <p>2025 Güz döneminde kayıtlı olduğun dersler</p>
      </div>

      <div className="courses-grid-large">
        {courses.map((course, index) => (
          <div key={index} className="course-card-large">
            <div className="course-card-header">
              <div className="course-title-group">
                <div className="course-icon-large" style={{ backgroundColor: course.color }}>📖</div>
                <div>
                  <h3>{course.name}</h3>
                  <span className="course-code">{course.code}</span>
                </div>
              </div>
              <span className="grade-badge">{course.grade}</span>
            </div>

            <div className="course-info-grid">
              <div className="info-row"><span>👤</span> {course.instructor}</div>
              <div className="info-row"><span>🕒</span> {course.time}</div>
              <div className="info-row"><span>📍</span> {course.location}</div>
            </div>

            <div className="course-progress-section">
              <div className="progress-labels">
                <span>Ders İlerlemesi</span>
                <span>%{course.progress}</span>
              </div>
              <div className="progress-bg">
                <div className="progress-fill" style={{ width: `${course.progress}%`, backgroundColor: '#1a1a1a' }}></div>
              </div>
            </div>

            <div className="course-footer-info">
              <div className="footer-item"><small>Sıradaki Ders:</small><strong>{course.nextClass}</strong></div>
              <div className="footer-item"><small>Materyaller:</small><strong>{course.files} dosya</strong></div>
            </div>

            {/* BUTON ARTIK FONKSİYONLU */}
            <button className="view-details-btn" onClick={() => onCourseSelect(course.name)}>
              Ders Detaylarını Gör
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
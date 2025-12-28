import React from 'react';
import './Dashboard.css';

// Dashboard ile iletişim kuracak fonksiyon (Parametresiz)
interface MyCoursesProps {
  onCourseSelect: (courseName: string) => void;
  enrolledCodes: string[]; // YENİ: Hangi dersleri aldığımız bilgisi buraya geliyor
}

export const MyCourses: React.FC<MyCoursesProps> = ({ onCourseSelect, enrolledCodes }) => {
  
  // Tüm olası derslerin havuzu (Detay bilgileri burada tutuyoruz)
  const allCoursesDB = [
    { code: 'MATH 401', name: 'Software Validation and Testing', instructor: 'Dr. Burçak Çelt', time: 'Mon, Wed 10:00', location: 'Room 204', progress: 68, grade: 'BB', nextClass: 'Nov 18 10:00', files: 12, color: '#007bff' },
    { code: 'CS 101', name: 'Database Management', instructor: 'Prof. Taylan Çakı', time: 'Tue, Thu 14:00', location: 'Lab 3', progress: 60, grade: 'AA', nextClass: 'Nov 19 14:00', files: 18, color: '#00C853' },
    { code: 'CS 302', name: 'Operating Systems', instructor: 'Dr. Erdem Beler', time: 'Wed 15:00', location: 'Room 101', progress: 54, grade: 'CC', nextClass: 'Nov 20 15:00', files: 8, color: '#aa00ff' },
    { code: 'FE 101', name: 'Python Programming', instructor: 'Prof. Ecem Özer', time: 'Tue, Thu 10:00', location: 'Room 150', progress: 62, grade: 'AA', nextClass: 'Nov 19 10:00', files: 15, color: '#ffab00' }
  ];

  // Sadece kayıtlı olunan dersleri filtrele
  // Eğer enrolledCodes boşsa (henüz yüklenmediyse) boş dizi döner
  const myCourses = allCoursesDB.filter(course => enrolledCodes.includes(course.code));

  return (
    <div className="courses-container fade-in">
      {/* SAYFA BAŞLIĞI */}
      <div className="page-header">
        <h2>My Courses</h2>
        <p>Courses you are enrolled in</p>
      </div>

      {/* DERS KARTLARI GRİDİ */}
      <div className="courses-grid-large">
        {myCourses.length > 0 ? (
          myCourses.map((course, index) => (
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
                  <span>Progress</span>
                  <span>%{course.progress}</span>
                </div>
                <div className="progress-bg">
                  <div className="progress-fill" style={{ width: `${course.progress}%`, backgroundColor: '#1a1a1a' }}></div>
                </div>
              </div>

              <div className="course-footer-info">
                <div className="footer-item"><small>Next Class:</small><strong>{course.nextClass}</strong></div>
                <div className="footer-item"><small>Materials:</small><strong>{course.files} files</strong></div>
              </div>

              <button className="view-details-btn" onClick={() => onCourseSelect(course.name)}>
                View Course Details
              </button>
            </div>
          ))
        ) : (
          <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: '#f5f5f5', borderRadius: '10px'}}>
              <h3>No courses found.</h3>
              <p>It looks like you are not enrolled in any courses yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
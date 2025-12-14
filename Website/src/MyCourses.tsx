import React from 'react';
import './Dashboard.css';

// Dashboard ile iletişim kuracak fonksiyon (Parametresiz)
interface MyCoursesProps {
  onCourseSelect: () => void;
}

export const MyCourses: React.FC<MyCoursesProps> = ({ onCourseSelect }) => {
  // MOCK DATA: Ders Listesi
  const courses = [
    {
      code: 'MATH 401',
      name: 'Software Validation and Testing',
      instructor: 'Dr. Burçak Çelt',
      time: 'Pzt, Çar 10:00 - 11:30',
      location: 'Bilim Binası, Oda 204',
      progress: 68,
      grade: 'BB',
      nextClass: 'Pazartesi, 18 Kas 10:00',
      files: 12,
      color: '#007bff'
    },
    {
      code: 'CS 101',
      name: 'Database Management',
      instructor: 'Prof. Taylan Çakı',
      time: 'Sal, Per 14:00 - 15:30',
      location: 'Teknoloji Merkezi, Lab 3',
      progress: 60,
      grade: 'AA',
      nextClass: 'Salı, 19 Kas 14:00',
      files: 18,
      color: '#00C853'
    },
    {
      code: 'CS 101',
      name: 'Operating Systems',
      instructor: 'Dr. Erdem Beler',
      time: 'Çar 15:00 - 17:00',
      location: 'Fizik Lab, Oda 101',
      progress: 54,
      grade: 'CC',
      nextClass: 'Çarşamba, 20 Kas 15:00',
      files: 8,
      color: '#aa00ff'
    },
    {
      code: 'FE',
      name: 'Python Programming',
      instructor: 'Prof. Ecem Özer',
      time: 'Sal, Per 10:00 - 11:30',
      location: 'İnsanlık Binası, Oda 150',
      progress: 62,
      grade: 'AA',
      nextClass: 'Salı, 19 Kas 10:00',
      files: 15,
      color: '#ffab00'
    }
  ];

  return (
    <div className="courses-container fade-in">
      {/* SAYFA BAŞLIĞI */}
      <div className="page-header">
        <h2>Derslerim</h2>
        <p>2025 Güz döneminde kayıtlı olduğun dersler</p>
      </div>

      {/* DERS KARTLARI GRİDİ */}
      <div className="courses-grid-large">
        {courses.map((course, index) => (
          <div key={index} className="course-card-large">
            
            {/* Kart Başlığı ve İkon */}
            <div className="course-card-header">
              <div className="course-title-group">
                <div className="course-icon-large" style={{ backgroundColor: course.color }}>
                  📖
                </div>
                <div>
                  <h3>{course.name}</h3>
                  <span style={{color: '#a0aec0', fontSize: '0.85rem', fontWeight: '600'}}>
                    {course.code}
                  </span>
                </div>
              </div>
              <span className="grade-badge">{course.grade}</span>
            </div>

            {/* Ders Bilgileri */}
            <div className="course-info-grid">
              <div className="info-row">
                <span>👤</span> {course.instructor}
              </div>
              <div className="info-row">
                <span>🕒</span> {course.time}
              </div>
              <div className="info-row">
                <span>📍</span> {course.location}
              </div>
            </div>

            {/* İlerleme Çubuğu */}
            <div className="course-progress-section">
              <div className="progress-labels">
                <span>Ders İlerlemesi</span>
                <span>%{course.progress}</span>
              </div>
              <div className="progress-bg">
                <div 
                  className="progress-fill" 
                  style={{ width: `${course.progress}%`, backgroundColor: '#1a1a1a' }} 
                ></div>
              </div>
            </div>

            {/* Alt Bilgi */}
            <div className="course-footer-info" style={{display:'flex', justifyContent:'space-between', paddingBottom:'15px', borderBottom:'1px solid #f0f0f0'}}>
              <div style={{display:'flex', flexDirection:'column'}}>
                <small>Sıradaki Ders:</small>
                <strong>{course.nextClass}</strong>
              </div>
              <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end'}}>
                <small>Materyaller:</small>
                <strong>{course.files} dosya</strong>
              </div>
            </div>

            {/* Detay Butonu */}
            <button className="view-details-btn" onClick={onCourseSelect}>
              Ders Detaylarını Gör
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
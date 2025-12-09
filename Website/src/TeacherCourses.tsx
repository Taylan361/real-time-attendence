import React from 'react';
import './Dashboard.css';

// YENİ: Prop tanımı ekliyoruz
interface TeacherCoursesProps {
  onSelectCourse: (courseName: string) => void;
}

export const TeacherCourses: React.FC<TeacherCoursesProps> = ({ onSelectCourse }) => {
  
  const myCourses = [
    {
      // ÖNEMLİ: Bu isimler TeacherDashboard'daki COURSES_DB anahtarlarıyla AYNI olmalı
      title: 'Software Validation', 
      code: 'MATH 401',
      time: 'Salı 14:00 - 17:00',
      location: 'Bilim Binası, Oda 204',
      students: 42,
      nextClass: '18 Kasım, 14:00',
      assignments: 3,
      color: '#4b2e83'
    },
    {
      title: 'Database Management',
      code: 'CS 101',
      time: 'Pazartesi 10:00 - 13:00',
      location: 'Teknoloji Merkezi, Lab 3',
      students: 56,
      nextClass: '17 Kasım, 10:00',
      assignments: 5,
      color: '#00C853'
    },
    {
      title: 'Operating Systems',
      code: 'CS 302',
      time: 'Cuma 09:00 - 12:00',
      location: 'Fizik Lab, Oda 101',
      students: 38,
      nextClass: '21 Kasım, 09:00',
      assignments: 2,
      color: '#aa00ff'
    }
  ];

  return (
    <div className="courses-container fade-in">
      <div className="page-header">
        <h2>Verilen Dersler</h2>
        <p>Yönetiminizdeki aktif derslerin listesi</p>
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
              <div className="grade-badge" style={{fontSize:'0.9rem'}}>{course.students} Öğrenci</div>
            </div>

            <div className="course-info-grid">
              <div className="info-row"><span>🕒</span> {course.time}</div>
              <div className="info-row"><span>📍</span> {course.location}</div>
              <div className="info-row"><span>📅</span> Sıradaki: {course.nextClass}</div>
            </div>

            <div className="course-footer-info" style={{marginTop:'15px'}}>
              <div className="footer-item"><small>Aktif Ödevler:</small><strong>{course.assignments} adet</strong></div>
              <div className="footer-item"><small>Dönem:</small><strong>2025 Güz</strong></div>
            </div>

            {/* BUTONLAR ARTIK ÇALIŞIYOR */}
            <div style={{display:'flex', gap:'10px', marginTop:'auto'}}>
              {/* İkisi de Dashboard'a gidip o dersi açıyor */}
              <button 
                className="view-details-btn" 
                style={{background:'#f8f9fa', border:'1px solid #ddd'}}
                onClick={() => onSelectCourse(course.title)}
              >
                Öğrenci Listesi
              </button>
              
              <button 
                className="view-details-btn" 
                style={{borderColor: course.color, color: course.color}}
                onClick={() => onSelectCourse(course.title)}
              >
                Dersi Yönet
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
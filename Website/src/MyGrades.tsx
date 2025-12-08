import React from 'react';
import './Dashboard.css';

export const MyGrades: React.FC = () => {
  // MOCK DATA: Üstteki İstatistikler
  const stats = {
    gpa: '2.8',
    semesterAvg: 89.7,
    credits: 18
  };

  // MOCK DATA: Dersler ve Notlar
  const courseGrades = [
    {
      id: 1,
      name: 'Software Validation and Testing',
      instructor: 'Dr. Burçak Çelt',
      finalLetter: 'AA',
      finalScore: 90,
      assignments: [
        { name: 'Problem Set 1', grade: 95, max: 100, weight: '10%' },
        { name: 'Problem Set 2', grade: 88, max: 100, weight: '10%' },
        { name: 'Problem Set 3', grade: 92, max: 100, weight: '10%' },
        { name: 'Midterm Exam', grade: 88, max: 200, weight: '30%' },
        { name: 'Final Exam', grade: null, max: 100, weight: '30%' }, // Henüz girilmemiş
      ]
    },
    {
      id: 2,
      name: 'Computer Science 101',
      instructor: 'Prof. Taylan Çakı',
      finalLetter: 'A',
      finalScore: 94,
      assignments: [
        { name: 'Lab 1', grade: 100, max: 50, weight: '5%' },
        { name: 'Lab 2', grade: 95, max: 50, weight: '5%' },
        { name: 'Project 1', grade: 92, max: 150, weight: '20%' },
        { name: 'Midterm Exam', grade: 95, max: 200, weight: '30%' },
        { name: 'Final Exam', grade: null, max: 100, weight: '30%' },
      ]
    },
    {
      id: 3,
      name: 'Physics Laboratory',
      instructor: 'Dr. Erdem Beler',
      finalLetter: 'B+',
      finalScore: 85,
      assignments: [
        { name: 'Lab Report 1', grade: 85, max: 80, weight: '15%' },
        { name: 'Lab Report 2', grade: 88, max: 80, weight: '15%' },
        { name: 'Midterm Exam', grade: 82, max: 200, weight: '30%' },
        { name: 'Final Exam', grade: null, max: 100, weight: '30%' },
      ]
    }
  ];

  return (
    <div className="grades-page fade-in">
      
      {/* SAYFA BAŞLIĞI */}
      <div className="page-header">
        <h2>Notlar</h2>
        <p>Akademik performansını takip et</p>
      </div>

      {/* ÜST İSTATİSTİK KARTLARI */}
      <div className="grades-stats-grid">
        {/* GPA Kartı */}
        <div className="grade-stat-card">
          <span className="stat-label">Genel Ort (GPA)</span>
          <div className="stat-main-value">{stats.gpa}</div>
          <span className="stat-sub">4.0 üzerinden</span>
        </div>

        {/* Dönem Ortalaması Kartı */}
        <div className="grade-stat-card">
          <span className="stat-label">Dönem Ortalaması</span>
          <div className="stat-main-value">{stats.semesterAvg}%</div>
          <div className="grade-progress-bar">
            <div className="grade-progress-fill" style={{ width: `${stats.semesterAvg}%` }}></div>
          </div>
        </div>

        {/* Kredi Kartı */}
        <div className="grade-stat-card">
          <span className="stat-label">Tamamlanan Kredi</span>
          <div className="stat-main-value">{stats.credits}</div>
          <span className="stat-sub">Bu dönem</span>
        </div>
      </div>

      {/* DERS NOTLARI LİSTESİ */}
      <div className="grades-list">
        {courseGrades.map((course) => (
          <div key={course.id} className="grade-course-card">
            
            {/* Kart Başlığı */}
            <div className="grade-card-header">
              <div>
                <h3>{course.name}</h3>
                <span className="instructor-name">{course.instructor}</span>
              </div>
              <div className="final-grade-box">
                <span className="letter-grade">{course.finalLetter}</span>
                <span className="percentage-grade">%{course.finalScore}</span>
              </div>
            </div>

            {/* Not Tablosu */}
            <div className="grade-table-wrapper">
              <table className="grade-table">
                <thead>
                  <tr>
                    <th style={{width: '40%'}}>Ödev/Sınav</th>
                    <th style={{width: '20%', textAlign: 'center'}}>Not</th>
                    <th style={{width: '20%', textAlign: 'center'}}>Puan</th>
                    <th style={{width: '20%', textAlign: 'right'}}>Ağırlık</th>
                  </tr>
                </thead>
                <tbody>
                  {course.assignments.map((item, idx) => (
                    <tr key={idx}>
                      <td className="task-name">{item.name}</td>
                      <td className="task-grade" style={{ textAlign: 'center' }}>
                        {item.grade !== null ? (
                          <span className={item.grade >= 90 ? 'grade-high' : item.grade >= 70 ? 'grade-mid' : 'grade-low'}>
                            {item.grade}
                          </span>
                        ) : (
                          <span className="grade-pending">-</span>
                        )}
                      </td>
                      <td className="task-points" style={{ textAlign: 'center' }}>{item.max}</td>
                      <td className="task-weight" style={{ textAlign: 'right' }}>{item.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
import React from 'react';
import './Dashboard.css';

interface CourseDetailsProps {
  courseId: string | null; // Hangi dersin seçildiğini anlamak için
  onBack: () => void;
}

export const CourseDetails: React.FC<CourseDetailsProps> = ({ courseId, onBack }) => {
  // Normalde courseId'ye göre veritabanından çekilir, şimdilik Mock Data:
  const courseData = {
    title: "Software Validation and Testing",
    code: "MATH 401",
    instructor: "Dr. Burçak Çelt",
    description: "Bu ders, yazılım doğrulama teknikleri, birim testleri ve entegrasyon test süreçlerini kapsar.",
    syllabus: [
      { week: 1, topic: "Introduction to Testing", status: "completed" },
      { week: 2, topic: "Black Box Testing", status: "completed" },
      { week: 3, topic: "White Box Testing", status: "current" },
      { week: 4, topic: "Unit Testing Frameworks", status: "upcoming" },
    ],
    files: [
      { name: "Week 1 - Slides.pdf", type: "pdf" },
      { name: "Lab Manual.docx", type: "doc" },
      { name: "Assignment_Guide.pdf", type: "pdf" }
    ]
  };

  return (
    <div className="fade-in">
      <button onClick={onBack} className="back-button" style={{marginBottom: '20px'}}>
        ← Derslere Dön
      </button>

      {/* Mavi Header (Teacher'daki tasarımı kullandık) */}
      <div className="teacher-blue-header" style={{ marginBottom: '25px' }}>
        <div className="blue-header-content">
          <h3>{courseData.title}</h3>
          <div className="blue-tags">
            <span className="blue-tag">{courseData.code}</span>
            <span className="blue-tag">{courseData.instructor}</span>
          </div>
        </div>
      </div>

      <div className="content-grid">
        {/* SOL: DERS İÇERİĞİ */}
        <div className="section-card">
          <h3>Ders Programı</h3>
          <div className="course-list">
            {courseData.syllabus.map((item, idx) => (
              <div key={idx} className="course-item">
                <div className={`course-border`} style={{backgroundColor: item.status === 'completed' ? '#4caf50' : item.status === 'current' ? '#2196f3' : '#ccc'}}></div>
                <div className="course-details">
                  <h4>Hafta {item.week}: {item.topic}</h4>
                  <span className="progress-text">
                    Durum: {item.status === 'completed' ? 'Tamamlandı' : item.status === 'current' ? 'İşleniyor' : 'Bekliyor'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SAĞ: DOSYALAR VE DUYURULAR */}
        <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
          <div className="section-card">
            <h3>Ders Materyalleri</h3>
            <div className="assignment-list">
              {courseData.files.map((file, idx) => (
                <div key={idx} className="assignment-item" style={{padding:'10px'}}>
                  <div className="task-icon">📂</div>
                  <div className="task-info">
                    <h4>{file.name}</h4>
                    <span>.{file.type} dosyası</span>
                  </div>
                  <button className="task-btn">İndir</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import './Dashboard.css';

export const MyAssignments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'todo' | 'submitted' | 'graded'>('todo');

  const assignments = [
    {
      id: 1,
      title: 'Software Validation and Testing',
      courseTag: 'Software',
      desc: 'Complete problems 1-20 from Chapter 5',
      dueDate: '17 Kas, 2025',
      points: '100 puan',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Database Management',
      courseTag: 'Computer Science 101',
      desc: 'Build a responsive web application using React',
      dueDate: '30 Kas, 2025',
      points: '150 puan',
      status: 'inprogress' // Siyah etiketli
    },
    {
      id: 3,
      title: 'Operating Systems',
      courseTag: 'CPU Lab',
      desc: 'Write a detailed lab report on the thermodynamics experiment',
      dueDate: '14 Kas, 2025',
      points: '80 puan',
      status: 'pending'
    }
  ];

  return (
    <div className="assignments-page fade-in">
      
      {/* BAŞLIK */}
      <div className="page-header">
        <h2>Ödevlerim</h2>
        <p>Ders ödevlerini görüntüle ve gönder</p>
      </div>

     

      {/* SEKMELER */}
      <div className="tabs-wrapper">
        <button 
          className={`tab-item ${activeTab === 'todo' ? 'active' : ''}`} 
          onClick={() => setActiveTab('todo')}
        >
          Yapılacaklar (3)
        </button>
        <button 
          className={`tab-item ${activeTab === 'submitted' ? 'active' : ''}`} 
          onClick={() => setActiveTab('submitted')}
        >
          Teslim Edilenler (1)
        </button>
        <button 
          className={`tab-item ${activeTab === 'graded' ? 'active' : ''}`} 
          onClick={() => setActiveTab('graded')}
        >
          Notlandırılanlar (1)
        </button>
      </div>

      {/* ÖDEV LİSTESİ */}
      <div className="assignments-list">
        {assignments.map((item) => (
          <div key={item.id} className="assignment-card">
            
            {/* İkon */}
            <div className="card-icon">📄</div>
            
            {/* İçerik */}
            <div className="card-content">
              <div className="card-header-row">
                <h3>{item.title}</h3>
                <span className="course-badge">{item.courseTag}</span>
                {item.status === 'inprogress' && <span className="status-badge">Devam Ediyor</span>}
              </div>
              
              <p className="card-desc">{item.desc}</p>
              
              <div className="card-meta">
                <span className="meta-date">📅 Teslim: {item.dueDate}</span>
                <span className="meta-points">🏆 {item.points}</span>
              </div>
            </div>

            {/* Butonlar */}
            <div className="card-actions">
              <button className="btn-details">Detaylar</button>
              <button className="btn-submit">Teslim Et</button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
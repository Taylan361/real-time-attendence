import React, { useState } from 'react';
import './Dashboard.css';

// Yeni: Prop ekledik
interface MyAssignmentsProps {
  onAssignmentSelect: () => void;
}

export const MyAssignments: React.FC<MyAssignmentsProps> = ({ onAssignmentSelect }) => {
  // Filtreleme için state'i kullanıyoruz
  const [activeTab, setActiveTab] = useState<'todo' | 'submitted' | 'graded'>('todo');

  const allAssignments = [
    { id: 1, title: 'Software Validation and Testing', courseTag: 'Software', desc: 'Complete problems 1-20 from Chapter 5', dueDate: '17 Kas, 2025', points: '100 puan', status: 'todo' },
    { id: 2, title: 'Database Management', courseTag: 'CS 101', desc: 'Build a responsive web application', dueDate: '30 Kas, 2025', points: '150 puan', status: 'inprogress' }, // inprogress de todo sayılır
    { id: 3, title: 'Operating Systems Report', courseTag: 'CPU Lab', desc: 'Write a detailed lab report', dueDate: '14 Kas, 2025', points: '80 puan', status: 'submitted' },
    { id: 4, title: 'Python Basics Quiz', courseTag: 'FE', desc: 'Online quiz completion', dueDate: '10 Kas, 2025', points: '100/90', status: 'graded' }
  ];

  // Filtreleme Mantığı
  const filteredAssignments = allAssignments.filter(item => {
    if (activeTab === 'todo') return item.status === 'todo' || item.status === 'inprogress';
    return item.status === activeTab;
  });

  return (
    <div className="assignments-page fade-in">
      <div className="page-header">
        <h2>Ödevlerim</h2>
        <p>Ders ödevlerini görüntüle ve gönder</p>
      </div>

      {/* SEKMELER ARTIK ÇALIŞIYOR */}
      <div className="tabs-wrapper">
        <button className={`tab-item ${activeTab === 'todo' ? 'active' : ''}`} onClick={() => setActiveTab('todo')}>
          Yapılacaklar
        </button>
        <button className={`tab-item ${activeTab === 'submitted' ? 'active' : ''}`} onClick={() => setActiveTab('submitted')}>
          Teslim Edilenler
        </button>
        <button className={`tab-item ${activeTab === 'graded' ? 'active' : ''}`} onClick={() => setActiveTab('graded')}>
          Notlandırılanlar
        </button>
      </div>

      <div className="assignments-list">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((item) => (
            <div key={item.id} className="assignment-card">
              <div className="card-icon">📄</div>
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
              <div className="card-actions">
                {/* BUTONLAR ARTIK FONKSİYONLU */}
                <button className="btn-details" onClick={onAssignmentSelect}>Detaylar</button>
                {activeTab === 'todo' && (
                   <button className="btn-submit" onClick={onAssignmentSelect}>Teslim Et</button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{textAlign:'center', padding:'20px', color:'#999'}}>Bu kategoride ödev bulunmuyor.</div>
        )}
      </div>
    </div>
  );
};
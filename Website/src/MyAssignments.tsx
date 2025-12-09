import React, { useState } from 'react';
import './Dashboard.css';

interface MyAssignmentsProps {
  onAssignmentSelect: () => void;
}

// Assignment Veri Tipi
interface Assignment {
  id: number;
  title: string;
  course: string;
  desc: string;
  dueDate: string;
  points: string;
  status: 'todo' | 'submitted' | 'graded';
}

export const MyAssignments: React.FC<MyAssignmentsProps> = ({ onAssignmentSelect }) => {
  const [activeTab, setActiveTab] = useState<'todo' | 'submitted' | 'graded'>('todo');

  // MOCK DATA (İngilizce - Direkt buraya yazdık)
  const allAssignments: Assignment[] = [
    { 
      id: 1, 
      title: 'Software Validation Problem Set', 
      course: 'Software Validation', 
      desc: 'Complete problems 1-20 from Chapter 5.', 
      dueDate: 'Nov 17, 2025', 
      points: '100 pts', 
      status: 'todo' 
    },
    { 
      id: 2, 
      title: 'Database Project Phase 1', 
      course: 'Database Management', 
      desc: 'Design the ER diagram for the hospital system.', 
      dueDate: 'Nov 30, 2025', 
      points: '150 pts', 
      status: 'todo' 
    },
    { 
      id: 3, 
      title: 'Operating Systems Lab Report', 
      course: 'Operating Systems', 
      desc: 'Write a detailed report on the scheduling algorithm experiment.', 
      dueDate: 'Nov 14, 2025', 
      points: '80 pts', 
      status: 'submitted' 
    },
    { 
      id: 4, 
      title: 'Python Basics Quiz', 
      course: 'Python Programming', 
      desc: 'Online quiz completion.', 
      dueDate: 'Nov 10, 2025', 
      points: '90/100', 
      status: 'graded' 
    }
  ];

  // Filtreleme Mantığı
  const filteredAssignments = allAssignments.filter(item => {
    if (activeTab === 'todo') return item.status === 'todo';
    return item.status === activeTab;
  });

  return (
    <div className="assignments-page fade-in">
      <div className="page-header">
        <h2>My Assignments</h2>
        <p>View and submit course assignments</p>
      </div>

      <div className="tabs-wrapper">
        <button className={`tab-item ${activeTab === 'todo' ? 'active' : ''}`} onClick={() => setActiveTab('todo')}>
          To Do
        </button>
        <button className={`tab-item ${activeTab === 'submitted' ? 'active' : ''}`} onClick={() => setActiveTab('submitted')}>
          Submitted
        </button>
        <button className={`tab-item ${activeTab === 'graded' ? 'active' : ''}`} onClick={() => setActiveTab('graded')}>
          Graded
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
                  <span className="course-badge">{item.course}</span>
                </div>
                <p className="card-desc">{item.desc}</p>
                <div className="card-meta">
                  <span className="meta-date">📅 Due: {item.dueDate}</span>
                  <span className="meta-points">🏆 {item.points}</span>
                </div>
              </div>
              <div className="card-actions">
                <button className="btn-details" onClick={onAssignmentSelect}>Details</button>
                {activeTab === 'todo' && (
                   <button className="btn-submit" onClick={onAssignmentSelect}>Submit</button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{textAlign:'center', padding:'20px', color:'#999'}}>No assignments found in this category.</div>
        )}
      </div>
    </div>
  );
};
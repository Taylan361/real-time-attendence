import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { fetchAssignmentsFromFirebase, getStudentData } from './DataManager';
import { db } from './firebase'; 
import { doc, updateDoc } from "firebase/firestore";

interface MyAssignmentsProps {
  // onAssignmentSelect artık veri taşıyor
  onAssignmentSelect: (assignment: any) => void;
}

interface Assignment {
  id: number | string;
  title: string;
  course: string;
  desc: string;
  dueDate: string;
  points: string;
  status: 'todo' | 'submitted' | 'graded';
}

export const MyAssignments: React.FC<MyAssignmentsProps> = ({ onAssignmentSelect }) => {
  const [activeTab, setActiveTab] = useState<'todo' | 'submitted' | 'graded'>('todo');
  
  // Mock Data
  const [assignments, setAssignments] = useState<Assignment[]>([
    { 
      id: 1, title: 'Örnek Veri', course: 'Test', 
      desc: 'Sistem testi.', dueDate: '2025-01-01', points: '100 pts', status: 'todo' 
    }
  ]);

  useEffect(() => {
    const loadRealAssignments = async () => {
      try {
        const currentStudentId = localStorage.getItem('currentStudentId') || '220706010';
        const studentData = await getStudentData(currentStudentId);

        if (studentData && studentData.enrolledCourses) {
          const firebaseAssignments = await fetchAssignmentsFromFirebase();
          
          // @ts-ignore
          const myNewAssignments: Assignment[] = firebaseAssignments
            .filter((a: any) => {
                const assignmentCode = a.courseCode ? a.courseCode.toString().trim().toUpperCase() : "";
                return studentData.enrolledCourses.some((courseName: string) => 
                    courseName.trim().toUpperCase() === assignmentCode
                );
            })
            // @ts-ignore
            .map((a: any) => {
                // --- DÜZELTME BURADA ---
                // Eğer Firebase'den puan gelmişse onu kullan, yoksa '100 pts' yaz.
                let displayPoints = '100 pts';
                if (a.points && a.points !== '100 pts') {
                    displayPoints = a.points; // Öğretmenin verdiği not (Örn: 85)
                }

                let currentStatus = 'todo';
                if (a.status === 'submitted') currentStatus = 'submitted';
                if (a.status === 'graded') currentStatus = 'graded';

                return {
                    id: a.id,
                    title: a.title,
                    course: a.courseCode,
                    desc: 'Instructor assigned task.',
                    dueDate: a.dueDate,
                    points: displayPoints, // Güncellenen puan değişkeni
                    status: currentStatus as 'todo' | 'submitted' | 'graded'
                };
            });

          setAssignments(prev => {
             const existingIds = new Set(prev.map(p => p.id));
             const uniqueNew = myNewAssignments.filter(n => !existingIds.has(n.id));
             return [...uniqueNew, ...prev]; 
          });
        }
      } catch (error) {
        console.error("Hata:", error);
      }
    };

    loadRealAssignments();
  }, []);

  const handleSubmitAssignment = async (id: number | string) => {
    if (window.confirm("Bu ödevi teslim etmek istediğinize emin misiniz?")) {
      try {
        if (typeof id === 'string') {
            const assignmentRef = doc(db, "assignments", id);
            await updateDoc(assignmentRef, { status: 'submitted' });
        }
        setAssignments(prev => prev.map(item => item.id === id ? { ...item, status: 'submitted' } : item));
        alert("Ödev teslim edildi!");
        setActiveTab('submitted'); 
      } catch (error) {
        console.error("Hata:", error);
      }
    }
  };

  const filteredAssignments = assignments.filter(item => {
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
          To Do ({assignments.filter(a=>a.status==='todo').length})
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
                  <span className="meta-date" style={{color: item.status==='todo' ? '#d32f2f' : '#666'}}>
                    📅 Due: {item.dueDate}
                  </span>
                  
                  {/* PUAN GÖSTERİMİ */}
                  <span className="meta-points" style={{fontWeight:'bold', color: item.status === 'graded' ? '#4b2e83' : '#666'}}>
                     {item.status === 'graded' ? `Not: ${item.points}` : `🏆 ${item.points}`}
                  </span>
                </div>
              </div>
              <div className="card-actions">
                {/* Details butonuna item verisini yolluyoruz */}
                <button className="btn-details" onClick={() => onAssignmentSelect(item)}>Details</button>
                
                {activeTab === 'todo' && (
                   <button className="btn-submit" style={{backgroundColor: '#2e7d32', color: 'white'}} onClick={() => handleSubmitAssignment(item.id)}>Submit</button>
                )}
                
                {activeTab === 'submitted' && <span style={{color:'green', fontWeight:'bold', alignSelf:'center'}}>✅ Submitted</span>}
                
                {activeTab === 'graded' && <span style={{color:'#4b2e83', fontWeight:'bold', alignSelf:'center'}}>🌟 Graded</span>}
              </div>
            </div>
          ))
        ) : (
          <div style={{textAlign:'center', padding:'40px', color:'#999'}}>
            <div style={{fontSize:'2rem', marginBottom:'10px'}}>📂</div>
            Bu kategoride ödev yok.
          </div>
        )}
      </div>
    </div>
  );
};
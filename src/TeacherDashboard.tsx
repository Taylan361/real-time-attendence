import { useState } from 'react';
import './TeacherDashboard.css';

// App.tsx'ten gelen 'onLogout' fonksiyonunun tipini tanımlıyoruz
interface TeacherDashboardProps {
  onLogout: () => void;
}

// Öğrenci veri tipi
interface Student {
  id: number;
  name: string;
  number: string;
  status: 'present' | 'absent' | 'pending';
}

const TeacherDashboard = ({ onLogout }: TeacherDashboardProps) => {
  // Örnek veriler
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: "Ahmet Yılmaz", number: "2023001", status: 'pending' },
    { id: 2, name: "Ayşe Demir", number: "2023002", status: 'pending' },
    { id: 3, name: "Mehmet Çelik", number: "2023003", status: 'pending' },
    { id: 4, name: "Zeynep Kaya", number: "2023004", status: 'pending' },
    { id: 5, name: "Elif Öztürk", number: "2023005", status: 'pending' },
  ]);

  const toggleStatus = (id: number, newStatus: 'present' | 'absent') => {
    setStudents(prev => 
      prev.map(student => 
        student.id === id ? { ...student, status: newStatus } : student
      )
    );
  };

  const handleSave = () => {
    console.log("Kaydedilen Yoklama:", students);
    alert("Yoklama başarıyla sisteme kaydedildi!");
  };

  return (
    <div className="teacher-container">
      {/* Üst Bar: Başlık ve Çıkış Butonu */}
      <header className="dashboard-header">
        <h1>Öğretmen Paneli</h1>
        <button onClick={onLogout} className="logout-btn">Güvenli Çıkış</button>
      </header>
      
      <div className="attendance-card">
        <h3>Bugünkü Yoklama Listesi</h3>
        <div className="attendance-table">
          <div className="table-header">
            <span>No</span>
            <span>İsim Soyisim</span>
            <span>Durum</span>
          </div>

          {students.map((student) => (
            <div key={student.id} className={`table-row ${student.status}`}>
              <span>{student.number}</span>
              <span>{student.name}</span>
              <div className="actions">
                <button 
                  className={`btn check ${student.status === 'present' ? 'active' : ''}`}
                  onClick={() => toggleStatus(student.id, 'present')}
                >
                  Var
                </button>
                <button 
                  className={`btn cross ${student.status === 'absent' ? 'active' : ''}`}
                  onClick={() => toggleStatus(student.id, 'absent')}
                >
                  Yok
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="save-btn" onClick={handleSave}>Yoklamayı Tamamla</button>
      </div>
    </div>
  );
};

export default TeacherDashboard;
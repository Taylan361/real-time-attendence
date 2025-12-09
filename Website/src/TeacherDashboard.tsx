import React, { useState } from 'react';
import './Dashboard.css';

interface TeacherDashboardProps {
  onLogout: () => void;
}

// Öğrenci Tipi
interface Student {
  id: number;
  name: string;
  status: 'present' | 'absent' | 'late';
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout }) => {
 
  
  // YOKLAMA LİSTESİ (STATE OLARAK TUTUYORUZ Kİ DEĞİŞTİREBİLELİM)
  const [students, setStudents] = useState<Student[]>([
    { id: 2024006, name: 'Öykü Şahin', status: 'absent' },
    { id: 2024007, name: 'Kaan Gündüz', status: 'present' },
    { id: 2024008, name: 'Doğukan Gökdemir', status: 'present' },
    { id: 2024009, name: 'Ceren Tuncer', status: 'late' },
    { id: 2024010, name: 'Hasan Yanık', status: 'present' },
    { id: 2024011, name: 'Ali Yılmaz', status: 'present' },
    { id: 2024012, name: 'Ayşe Demir', status: 'present' },
    { id: 2024013, name: 'Mehmet Öz', status: 'absent' },
  ]);

  // İSTATİSTİKLERİ HESAPLA
  const totalStudents = students.length;
  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const lateCount = students.filter(s => s.status === 'late').length;
  const attendanceRate = Math.round(((presentCount + (lateCount * 0.5)) / totalStudents) * 100);

  // DURUM DEĞİŞTİRME FONKSİYONU
  const handleStatusChange = (id: number, newStatus: 'present' | 'absent' | 'late') => {
    setStudents(prev => prev.map(student => 
      student.id === id ? { ...student, status: newStatus } : student
    ));
  };

  // TÜMÜNÜ VAR YAZ
  const markAllPresent = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'present' })));
  };

  return (
    <div className="dashboard-layout">
      {/* SOL SIDEBAR (SADELEŞTİRİLDİ) */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🎓</div>
          <h2>UniPortal</h2>
        </div>
        
        <nav className="sidebar-menu">
          <div className="menu-item active">
            <span className="icon">🏠</span> Dashboard
          </div>
          <div className="menu-item">
            <span className="icon">📘</span> Derslerim
          </div>
          <div className="menu-item">
            <span className="icon">📅</span> Takvim
          </div>
        </nav>

        <div className="sidebar-footer">
          <button onClick={onLogout} className="logout-btn">
            🚪 Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ANA İÇERİK */}
      <main className="main-content">
        
        {/* HEADER */}
        <header className="top-header">
          <div className="page-title-group">
            <h2>Akademisyen Paneli</h2>
            <p>Derslerinizi ve yoklamayı buradan yönetin</p>
          </div>
          
          <div className="user-profile">
            <div className="notification-icon">🔔</div>
            <div className="user-info">
              <div className="details">
                <span className="u-name">Dr. Burçak Çelt</span>
                <span className="u-role">Akademisyen</span>
              </div>
              <div className="avatar">B</div>
            </div>
          </div>
        </header>

        {/* İÇERİK ALANI */}
        <div className="fade-in">
          
          {/* Mavi Bilgi Kartı */}
          <div className="teacher-blue-header" style={{ marginBottom: '25px' }}>
            <div className="blue-header-content">
              <h3>Database Management</h3>
              <div className="blue-tags">
                <span className="blue-tag">CS 101</span>
                <span className="blue-tag">Sal/Per 14:00</span>
                <span className="blue-tag">{totalStudents} Öğrenci Kayıtlı</span>
              </div>
            </div>
            <div className="current-session-info">
              <small>Mevcut Oturum</small>
              <strong>Pazar, 7 Ara</strong>
            </div>
          </div>

          {/* YOKLAMA KONTROLÜ */}
          <div className="section-card">
            <div className="card-header">
              <h3>Yoklama Kontrolü</h3>
              <div className="header-actions">
                <button className="secondary-btn" onClick={markAllPresent}>Tümünü Var Yaz</button>
                <button className="primary-black-btn">▶ Oturumu Başlat</button>
              </div>
            </div>

            {/* Dinamik İstatistikler */}
            <div className="attendance-stats">
              <div className="att-box total">
                <span>👥 Toplam</span>
                <strong>{totalStudents}</strong>
              </div>
              <div className="att-box present">
                <span>✅ Mevcut</span>
                <strong>{presentCount}</strong>
              </div>
              <div className="att-box absent">
                <span>❌ Yok</span>
                <strong>{absentCount}</strong>
              </div>
              <div className="att-box late">
                <span>⏰ Geç</span>
                <strong>{lateCount}</strong>
              </div>
              <div className="att-box rate">
                <span>📊 Oran</span>
                <strong>%{attendanceRate}</strong>
              </div>
            </div>

            {/* Etkileşimli Öğrenci Listesi */}
            <div className="student-list">
              {students.map((student) => (
                <div key={student.id} className="student-row">
                  <div className="student-info">
                    <div className={`student-avatar ${['Ö', 'C', 'A'].includes(student.name.charAt(0)) ? 'pink' : 'green'}`}>
                      {student.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <strong>{student.name}</strong>
                      <span style={{display:'block', fontSize:'0.8rem', color:'#888'}}>{student.id}</span>
                    </div>
                  </div>
                  
                  {/* YOKLAMA BUTONLARI */}
                  <div className="attendance-actions-group">
                    <button 
                      className={`status-btn present ${student.status === 'present' ? 'active' : ''}`}
                      onClick={() => handleStatusChange(student.id, 'present')}
                    >
                      Mevcut
                    </button>
                    <button 
                      className={`status-btn absent ${student.status === 'absent' ? 'active' : ''}`}
                      onClick={() => handleStatusChange(student.id, 'absent')}
                    >
                      Yok
                    </button>
                    <button 
                      className={`status-btn late ${student.status === 'late' ? 'active' : ''}`}
                      onClick={() => handleStatusChange(student.id, 'late')}
                    >
                      Geç
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DİĞER KARTLAR (Duyuru & Ödev) */}
          <div className="content-grid" style={{marginTop: '25px'}}>
            <div className="section-card">
              <div className="card-header">
                <h3>Duyurular</h3>
                <span className="icon-btn">📢</span>
              </div>
              <button className="full-width-black-btn">+ Duyuru Oluştur</button>
              <div className="announcement-item">
                <div className="ann-badge high">Yüksek</div>
                <h4>Vize Sınav Takvimi</h4>
                <p>Vize sınavı 25 Kasım saat 09:00'da yapılacaktır.</p>
              </div>
            </div>

            <div className="section-card">
              <div className="card-header">
                <h3>Ödev Yönetimi</h3>
                <span className="icon-btn">📝</span>
              </div>
              <button className="full-width-black-btn">+ Yeni Ödev Ekle</button>
              <div className="teacher-assignment-item">
                <h4>Unit Testing Lab Exercise</h4>
                <div className="progress-bar-bg">
                  <div className="progress-fill" style={{width: '100%', backgroundColor: 'black'}}></div>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.8rem', marginTop:'5px'}}>
                  <span>Teslim: 10/10</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
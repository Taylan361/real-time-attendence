import React, { useState } from 'react';
import './Dashboard.css';

export const Calendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<number>(18); // Varsayılan seçili gün

  // MOCK DATA: Takvimdeki Günler (Kasım 2025 Örneği)
  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);

  // MOCK DATA: Etkinlikler
  const events = [
    {
      id: 1,
      title: 'Software Validation and Testing',
      type: 'class', // Ders
      time: '10:00 - 11:30',
      location: 'Bilim Binası, Oda 204',
      day: 18
    },
    {
      id: 2,
      title: 'Database Management Project',
      type: 'deadline', // Teslim
      time: '23:59',
      location: 'Online Teslim',
      day: 18
    },
    {
      id: 3,
      title: 'Operating Systems',
      type: 'class',
      time: '13:00 - 15:00',
      location: 'Fizik Lab, Oda 101',
      day: 19
    },
    {
      id: 4,
      title: 'Midterm Exam: Physics',
      type: 'exam', // Sınav
      time: '09:00 - 11:00',
      location: 'Ana Amfi',
      day: 20
    }
  ];

  // Seçili güne göre etkinlikleri filtrele
  const todaysEvents = events.filter(e => e.day === selectedDate);

  return (
    <div className="calendar-page fade-in">
      
      <div className="page-header">
        <h2>Takvim</h2>
        <p>Ders programını ve yaklaşan etkinlikleri görüntüle</p>
      </div>

      <div className="calendar-layout">
        
        {/* SOL: TAKVİM GRİDİ */}
        <div className="calendar-card">
          <div className="calendar-header">
            <h3>Kasım 2025</h3>
            <div className="calendar-nav">
              <button>‹</button>
              <button>›</button>
            </div>
          </div>

          <div className="calendar-weekdays">
            <span>Pzt</span><span>Sal</span><span>Çar</span><span>Per</span><span>Cum</span><span>Cmt</span><span>Paz</span>
          </div>

          <div className="calendar-grid">
            {/* Boşluklar (Ayın ilk günü ayarı için) */}
            <span className="empty-day"></span><span className="empty-day"></span><span className="empty-day"></span><span className="empty-day"></span>

            {calendarDays.map(day => {
              // O günde etkinlik var mı?
              const hasEvent = events.some(e => e.day === day);
              const isSelected = day === selectedDate;

              return (
                <div 
                  key={day} 
                  className={`calendar-day ${isSelected ? 'selected' : ''} ${hasEvent ? 'has-event' : ''}`}
                  onClick={() => setSelectedDate(day)}
                >
                  {day}
                  {hasEvent && <span className="event-dot"></span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* SAĞ: GÜNLÜK AJANDA */}
        <div className="agenda-card">
          <div className="agenda-header">
            <h3>{selectedDate} Kasım, Pazartesi</h3>
            <span className="event-count">{todaysEvents.length} Etkinlik</span>
          </div>

          <div className="agenda-list">
            {todaysEvents.length > 0 ? (
              todaysEvents.map(event => (
                <div key={event.id} className={`agenda-item ${event.type}`}>
                  <div className="time-col">
                    <span className="event-time">{event.time}</span>
                    <span className="time-line"></span>
                  </div>
                  <div className="event-details">
                    <h4>{event.title}</h4>
                    <span className="event-loc">📍 {event.location}</span>
                    <span className="event-tag">
                      {event.type === 'class' ? 'Ders' : event.type === 'exam' ? 'Sınav' : 'Teslim'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-events">
                <span className="chill-icon">☕</span>
                <p>Bugün için planlanmış etkinlik yok.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
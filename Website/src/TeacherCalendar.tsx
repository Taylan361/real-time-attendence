import React, { useState } from 'react';
import './Dashboard.css';

export const TeacherCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<number>(18); // Varsayılan gün

  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);

  // MOCK DATA: ÖĞRETMEN PROGRAMI
  const events = [
    {
      id: 1,
      title: 'Software Validation (Ders)',
      type: 'class', // Stil dosyasında .class rengi mor
      time: '10:00 - 11:30',
      location: 'Bilim Binası, Oda 204',
      day: 18
    },
    {
      id: 2,
      title: 'Bölüm Toplantısı',
      type: 'deadline', // Stil dosyasında .deadline rengi turuncu (Toplantı için kullanalım)
      time: '14:00 - 15:00',
      location: 'Toplantı Salonu A',
      day: 18
    },
    {
      id: 3,
      title: 'Operating Systems (Ders)',
      type: 'class',
      time: '13:00 - 15:00',
      location: 'Fizik Lab, Oda 101',
      day: 19
    },
    {
      id: 4,
      title: 'Ofis Saati (Öğrenci Görüşmeleri)',
      type: 'exam', // Stil dosyasında .exam rengi kırmızı/pembe
      time: '15:30 - 16:30',
      location: 'Ofis 302',
      day: 19
    },
    {
      id: 5,
      title: 'Vize Sorularını Hazırla',
      type: 'deadline',
      time: '17:00',
      location: '-',
      day: 20
    }
  ];

  const todaysEvents = events.filter(e => e.day === selectedDate);

  return (
    <div className="calendar-page fade-in">
      <div className="section-card" style={{marginBottom: '20px', border:'none', boxShadow:'none', padding:'0', background:'transparent'}}>
         {/* Başlık kısmını kaldırdık çünkü Dashboard header zaten var, direkt içeriği basıyoruz */}
      </div>

      <div className="calendar-layout">
        {/* SOL: TAKVİM */}
        <div className="calendar-card">
          <div className="calendar-header">
            <h3>Kasım 2025</h3>
            <div className="calendar-nav">
              <button>‹</button><button>›</button>
            </div>
          </div>
          <div className="calendar-weekdays">
            <span>Pzt</span><span>Sal</span><span>Çar</span><span>Per</span><span>Cum</span><span>Cmt</span><span>Paz</span>
          </div>
          <div className="calendar-grid">
            <span className="empty-day"></span><span className="empty-day"></span><span className="empty-day"></span><span className="empty-day"></span>
            {calendarDays.map(day => {
              const hasEvent = events.some(e => e.day === day);
              const isSelected = day === selectedDate;
              return (
                <div key={day} className={`calendar-day ${isSelected ? 'selected' : ''} ${hasEvent ? 'has-event' : ''}`} onClick={() => setSelectedDate(day)}>
                  {day}
                  {hasEvent && <span className="event-dot"></span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* SAĞ: AJANDA */}
        <div className="agenda-card">
          <div className="agenda-header">
            <h3>{selectedDate} Kasım</h3>
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
                  </div>
                </div>
              ))
            ) : (
              <div className="no-events"><span className="chill-icon">☕</span><p>Programınız boş.</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
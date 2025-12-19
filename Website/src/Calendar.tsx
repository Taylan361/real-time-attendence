import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { fetchAssignmentsFromFirebase, getStudentData } from './DataManager';

// Event Tipi Tanımı
interface CalendarEvent {
  id: number | string;
  title: string;
  type: 'class' | 'exam' | 'deadline';
  time: string;
  location: string;
  day: number; // Basitlik olması için ayın günü (1-30) olarak tutuyoruz
}

export const Calendar: React.FC = () => {
  // Varsayılan olarak bugünü seç
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate());
  
  // Takvim günleri (Basitlik için 30 günlük statik bir ay)
  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);

  // Başlangıçtaki Sabit Ders Programı (Mock Data)
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: 1, title: 'Software Validation Class', type: 'class', time: '10:00 - 11:30', location: 'Science Bldg, Room 204', day: 18 },
    { id: 3, title: 'Operating Systems Class', type: 'class', time: '13:00 - 15:00', location: 'Physics Lab, Room 101', day: 19 },
    { id: 4, title: 'Midterm Exam: Physics', type: 'exam', time: '09:00 - 11:00', location: 'Main Hall', day: 20 }
  ]);

  // --- FIREBASE'DEN ÖDEVLERİ ÇEKİP TAKVİME EKLEME ---
  useEffect(() => {
    const loadCalendarEvents = async () => {
      try {
        const currentStudentId = localStorage.getItem('currentStudentId') || '220706010';
        
        // 1. Öğrenci verisini ve ödevleri çek
        const studentData = await getStudentData(currentStudentId);
        const firebaseAssignments = await fetchAssignmentsFromFirebase();

        if (studentData && studentData.enrolledCourses) {
           
           // 2. Ödevleri filtrele ve "Event" formatına çevir
           // @ts-ignore
           const newDeadlineEvents: CalendarEvent[] = firebaseAssignments
             .filter((a: any) => {
                const aCode = a.courseCode ? a.courseCode.trim().toUpperCase() : "";
                return studentData.enrolledCourses.some((c: string) => c.trim().toUpperCase() === aCode);
             })
             .map((a: any) => {
                // Tarihi Parse Et (Örn: "2025-11-25") -> Gün: 25
                const dateParts = a.dueDate ? a.dueDate.split('-') : [];
                let dayNum = 1;
                // Eğer tarih formatı uygunsa günü al, değilse rastgele bir gün atama (Hata önlemek için)
                if(dateParts.length === 3) {
                    dayNum = parseInt(dateParts[2]);
                } else {
                    // Alternatif tarih formatı kontrolü veya varsayılan
                    const d = new Date(a.dueDate);
                    if (!isNaN(d.getTime())) dayNum = d.getDate();
                }

                return {
                    id: `deadline-${a.id}`, // Benzersiz ID
                    title: `${a.courseCode}: ${a.title}`, // Ders Kodu + Başlık
                    type: 'deadline',
                    time: '23:59', // Teslim saati genelde gün sonudur
                    location: 'Online Submission',
                    day: dayNum
                };
             });

           // 3. Mevcut etkinliklerin üzerine ekle (Tekrarı önlemek için kontrol)
           setEvents(prev => {
              const existingIds = new Set(prev.map(e => e.id));
              const uniqueNew = newDeadlineEvents.filter(e => !existingIds.has(e.id));
              // Firebase'den gelenleri de listeye ekle
              return [...prev, ...uniqueNew];
           });
        }
      } catch (err) {
        console.error("Takvim verisi çekilemedi:", err);
      }
    };

    loadCalendarEvents();
  }, []);

  const todaysEvents = events.filter(e => e.day === selectedDate);

  return (
    <div className="calendar-page fade-in">
      <div className="page-header">
        <h2>Calendar</h2>
        <p>View schedule and upcoming events</p>
      </div>
      
      <div className="calendar-layout">
        {/* SOL TARAFTAKİ TAKVİM IZGARASI */}
        <div className="calendar-card">
          <div className="calendar-header">
            <h3>December 2025</h3> {/* Demo için sabit ay */}
            <div className="calendar-nav">
                <button style={{cursor:'pointer'}}>‹</button>
                <button style={{cursor:'pointer'}}>›</button>
            </div>
          </div>
          <div className="calendar-weekdays"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
          <div className="calendar-grid">
            <span className="empty-day"></span><span className="empty-day"></span><span className="empty-day"></span><span className="empty-day"></span>
            {calendarDays.map(day => {
              // O gün herhangi bir etkinlik var mı?
              const hasEvent = events.some(e => e.day === day);
              const isSelected = day === selectedDate;
              
              // O gün ÖDEV teslimi var mı? (Varsa kırmızı nokta koymak için)
              const hasDeadline = events.some(e => e.day === day && e.type === 'deadline');

              return (
                <div key={day} className={`calendar-day ${isSelected ? 'selected' : ''} ${hasEvent ? 'has-event' : ''}`} onClick={() => setSelectedDate(day)}>
                  {day}
                  {hasEvent && (
                      <span className="event-dot" style={{backgroundColor: hasDeadline ? '#d32f2f' : '#4b2e83'}}></span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SAĞ TARAFTAKİ AJANDA LİSTESİ */}
        <div className="agenda-card">
          <div className="agenda-header">
              <h3>{selectedDate} December</h3>
              <span className="event-count">{todaysEvents.length} Events</span>
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
                        {event.type === 'class' ? 'Class' : event.type === 'exam' ? 'Exam' : 'Deadline'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-events">
                  <span className="chill-icon">☕</span>
                  <p>No events scheduled for today.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
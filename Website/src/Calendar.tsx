import React, { useState } from 'react';
import './Dashboard.css';

export const Calendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<number>(18);
  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);

  const events = [
    { id: 1, title: 'Software Validation and Testing', type: 'class', time: '10:00 - 11:30', location: 'Science Bldg, Room 204', day: 18 },
    { id: 2, title: 'Database Management Project', type: 'deadline', time: '23:59', location: 'Online Submission', day: 18 },
    { id: 3, title: 'Operating Systems', type: 'class', time: '13:00 - 15:00', location: 'Physics Lab, Room 101', day: 19 },
    { id: 4, title: 'Midterm Exam: Physics', type: 'exam', time: '09:00 - 11:00', location: 'Main Hall', day: 20 }
  ];

  const todaysEvents = events.filter(e => e.day === selectedDate);

  return (
    <div className="calendar-page fade-in">
      <div className="page-header"><h2>Calendar</h2><p>View schedule and upcoming events</p></div>
      <div className="calendar-layout">
        <div className="calendar-card">
          <div className="calendar-header">
            <h3>November 2025</h3>
            <div className="calendar-nav"><button>‹</button><button>›</button></div>
          </div>
          <div className="calendar-weekdays"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
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

        <div className="agenda-card">
          <div className="agenda-header"><h3>November {selectedDate}</h3><span className="event-count">{todaysEvents.length} Events</span></div>
          <div className="agenda-list">
            {todaysEvents.length > 0 ? (
              todaysEvents.map(event => (
                <div key={event.id} className={`agenda-item ${event.type}`}>
                  <div className="time-col"><span className="event-time">{event.time}</span><span className="time-line"></span></div>
                  <div className="event-details">
                    <h4>{event.title}</h4>
                    <span className="event-loc">📍 {event.location}</span>
                    <span className="event-tag">{event.type === 'class' ? 'Class' : event.type === 'exam' ? 'Exam' : 'Deadline'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-events"><span className="chill-icon">☕</span><p>No events scheduled for today.</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
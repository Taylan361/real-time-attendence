import React from 'react';
import './Dashboard.css';

export const MyGrades: React.FC = () => {
  const stats = { gpa: '2.8', semesterAvg: 89.7, credits: 18 };

  const courseGrades = [
    {
      id: 1,
      name: 'Software Validation and Testing',
      instructor: 'Dr. Burçak Çelt',
      finalLetter: 'AA',
      finalScore: 90,
      assignments: [
        { name: 'Problem Set 1', grade: 95, max: 100, weight: '10%' },
        { name: 'Problem Set 2', grade: 88, max: 100, weight: '10%' },
        { name: 'Midterm Exam', grade: 88, max: 200, weight: '30%' },
        { name: 'Final Exam', grade: null, max: 100, weight: '30%' },
      ]
    },
    {
      id: 2,
      name: 'Computer Science 101',
      instructor: 'Prof. Taylan Çakı',
      finalLetter: 'A',
      finalScore: 94,
      assignments: [
        { name: 'Lab 1', grade: 100, max: 50, weight: '5%' },
        { name: 'Project 1', grade: 92, max: 150, weight: '20%' },
        { name: 'Midterm Exam', grade: 95, max: 200, weight: '30%' },
      ]
    }
  ];

  return (
    <div className="grades-page fade-in">
      <div className="page-header">
        <h2>My Grades</h2>
        <p>Track your academic performance</p>
      </div>

      <div className="grades-stats-grid">
        <div className="grade-stat-card"><span className="stat-label">Overall GPA</span><div className="stat-main-value">{stats.gpa}</div><span className="stat-sub">out of 4.0</span></div>
        <div className="grade-stat-card">
          <span className="stat-label">Semester Avg</span>
          <div className="stat-main-value">{stats.semesterAvg}%</div>
          <div className="grade-progress-bar"><div className="grade-progress-fill" style={{ width: `${stats.semesterAvg}%` }}></div></div>
        </div>
        <div className="grade-stat-card"><span className="stat-label">Completed Credits</span><div className="stat-main-value">{stats.credits}</div><span className="stat-sub">This semester</span></div>
      </div>

      <div className="grades-list">
        {courseGrades.map((course) => (
          <div key={course.id} className="grade-course-card">
            <div className="grade-card-header">
              <div><h3>{course.name}</h3><span className="instructor-name">{course.instructor}</span></div>
              <div className="final-grade-box"><span className="letter-grade">{course.finalLetter}</span><span className="percentage-grade">%{course.finalScore}</span></div>
            </div>
            <div className="grade-table-wrapper">
              <table className="grade-table">
                <thead>
                  <tr>
                    <th style={{width: '40%'}}>Assignment/Exam</th>
                    <th style={{width: '20%', textAlign: 'center'}}>Grade</th>
                    <th style={{width: '20%', textAlign: 'center'}}>Points</th>
                    <th style={{width: '20%', textAlign: 'right'}}>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {course.assignments.map((item, idx) => (
                    <tr key={idx}>
                      <td className="task-name">{item.name}</td>
                      <td className="task-grade" style={{ textAlign: 'center' }}>
                        {item.grade !== null ? (
                          <span className={item.grade >= 90 ? 'grade-high' : item.grade >= 70 ? 'grade-mid' : 'grade-low'}>{item.grade}</span>
                        ) : (<span className="grade-pending">-</span>)}
                      </td>
                      <td className="task-points" style={{ textAlign: 'center' }}>{item.max}</td>
                      <td className="task-weight" style={{ textAlign: 'right' }}>{item.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
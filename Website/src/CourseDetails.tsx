import React from 'react';
import './Dashboard.css';

interface CourseDetailsProps {
  onBack: () => void;
}

// DÜZELTME BURADA: ({ courseId, onBack }) yerine sadece ({ onBack }) yazdık.
// courseId hala interface'de var ama kullanmadığımız için buradan sildik.
export const CourseDetails: React.FC<CourseDetailsProps> = ({ onBack }) => {
  const courseData = {
    title: "Software Validation and Testing",
    code: "MATH 401",
    instructor: "Dr. Burçak Çelt",
    description: "This course covers software validation techniques, unit testing, and integration testing processes.",
    syllabus: [
      { week: 1, topic: "Introduction to Testing", status: "completed" },
      { week: 2, topic: "Black Box Testing", status: "completed" },
      { week: 3, topic: "White Box Testing", status: "current" },
      { week: 4, topic: "Unit Testing Frameworks", status: "upcoming" },
    ],
    files: [
      { name: "Week 1 - Slides.pdf", type: "pdf" },
      { name: "Lab Manual.docx", type: "doc" },
      { name: "Assignment_Guide.pdf", type: "pdf" }
    ]
  };

  return (
    <div className="fade-in">
      <button onClick={onBack} className="back-button" style={{marginBottom: '20px'}}>
        ← Back to Courses
      </button>

      <div className="teacher-blue-header" style={{ marginBottom: '25px' }}>
        <div className="blue-header-content">
          <h3>{courseData.title}</h3>
          <div className="blue-tags">
            <span className="blue-tag">{courseData.code}</span>
            <span className="blue-tag">{courseData.instructor}</span>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="section-card">
          <h3>Syllabus</h3>
          <div className="course-list">
            {courseData.syllabus.map((item, idx) => (
              <div key={idx} className="course-item">
                <div className={`course-border`} style={{backgroundColor: item.status === 'completed' ? '#4caf50' : item.status === 'current' ? '#2196f3' : '#ccc'}}></div>
                <div className="course-details">
                  <h4>Week {item.week}: {item.topic}</h4>
                  <span className="progress-text">
                    Status: {item.status === 'completed' ? 'Completed' : item.status === 'current' ? 'In Progress' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
          <div className="section-card">
            <h3>Course Materials</h3>
            <div className="assignment-list">
              {courseData.files.map((file, idx) => (
                <div key={idx} className="assignment-item" style={{padding:'10px'}}>
                  <div className="task-icon">📂</div>
                  <div className="task-info">
                    <h4>{file.name}</h4>
                    <span>.{file.type} file</span>
                  </div>
                  <button className="task-btn">Download</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
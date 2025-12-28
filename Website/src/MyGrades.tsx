import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { fetchAssignmentsFromFirebase, getStudentData } from './DataManager';

// --- TİP TANIMLAMALARI ---
interface GradeAssignment {
  name: string;
  grade: string | number | null; // Puan (Örn: 85 veya null)
  max: number;    // Maksimum puan (Genelde 100)
  weight: string; // Ağırlık (Şimdilik sabit)
  status: 'todo' | 'submitted' | 'graded';
}

interface CourseGradeCard {
  id: string;
  name: string;       // Ders Kodu (Örn: MATH 401)
  instructor: string; // Şimdilik sabit veya boş
  finalLetter: string;// Şimdilik sabit
  finalScore: number; // Şimdilik sabit
  assignments: GradeAssignment[];
}

export const MyGrades: React.FC = () => {
  // İstatistikler (Senin isteğin üzerine sabit bıraktık)
  const stats = { gpa: '2.8', semesterAvg: 89.7, credits: 18 };

  const [courseGrades, setCourseGrades] = useState<CourseGradeCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGrades = async () => {
      try {
        const currentStudentId = localStorage.getItem('currentStudentId') || '220706010';
        
        // 1. Öğrenci verisini ve aldığı dersleri çek
        const studentData = await getStudentData(currentStudentId);
        
        // 2. Tüm ödevleri çek
        const allAssignments = await fetchAssignmentsFromFirebase();

        if (studentData && studentData.enrolledCourses) {
          
          // 3. Öğrencinin derslerine göre gruplandırma yapacağımız geçici yapı
          // Örn: { "MATH 401": [Ödev1, Ödev2], "CS 101": [ÖdevA] }
          const coursesMap: Record<string, GradeAssignment[]> = {};

          // Öğrencinin aldığı her ders için boş bir liste başlat
          studentData.enrolledCourses.forEach((code: string) => {
             coursesMap[code] = [];
          });

          // 4. Ödevleri ilgili derslerin altına yerleştir
          // @ts-ignore
          allAssignments.forEach((assign: any) => {
             // Ders kodu eşleşiyor mu? (Boşluk/Harf duyarsız kontrol)
             const assignCode = assign.courseCode ? assign.courseCode.trim().toUpperCase() : "";
             
             // Öğrencinin derslerinden hangisine uyuyor?
             const matchedCourse = studentData.enrolledCourses.find((c: string) => c.trim().toUpperCase() === assignCode);

             if (matchedCourse) {
               // Notu parse et (Örn: "85/100" -> 85 veya "85" -> 85)
               let gradeValue: string | number | null = null;
               
               if (assign.status === 'graded' && assign.points) {
                  // Sadece sayı kısmını almaya çalışalım
                  const score = parseInt(assign.points); 
                  if (!isNaN(score)) gradeValue = score;
                  else gradeValue = assign.points; // Sayı değilse direkt yazıyı göster
               }

               coursesMap[matchedCourse].push({
                 name: assign.title,
                 grade: gradeValue,
                 max: 100, // Varsayılan max puan
                 weight: '-', // Firebase'de ağırlık tutmuyoruz, tire koyduk
                 status: assign.status || 'todo'
               });
             }
          });

          // 5. State'e dönüştür (CourseGradeCard formatına)
          const dynamicGrades: CourseGradeCard[] = Object.keys(coursesMap).map((courseCode, index) => ({
            id: `course-${index}`,
            name: courseCode, // Dersin adı (MATH 401 vb.)
            instructor: 'Akademisyen', // İsim veritabanında "teachers" tablosunda, buraya çekmek kompleks olur şimdilik sabit
            finalLetter: '-', // Henüz hesaplanmıyor
            finalScore: 0,    // Henüz hesaplanmıyor
            assignments: coursesMap[courseCode]
          }));

          setCourseGrades(dynamicGrades);
        }
      } catch (error) {
        console.error("Notlar yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGrades();
  }, []);

  if (loading) {
    return <div className="fade-in" style={{padding:'40px', textAlign:'center'}}>Notlar yükleniyor...</div>;
  }

  return (
    <div className="grades-page fade-in">
      <div className="page-header">
        <h2>My Grades</h2>
        <p>Track your academic performance</p>
      </div>

      {/* İSTATİSTİKLER (SABİT) */}
      <div className="grades-stats-grid">
        <div className="grade-stat-card"><span className="stat-label">Overall GPA</span><div className="stat-main-value">{stats.gpa}</div><span className="stat-sub">out of 4.0</span></div>
        <div className="grade-stat-card">
          <span className="stat-label">Semester Avg</span>
          <div className="stat-main-value">{stats.semesterAvg}%</div>
          <div className="grade-progress-bar"><div className="grade-progress-fill" style={{ width: `${stats.semesterAvg}%` }}></div></div>
        </div>
        <div className="grade-stat-card"><span className="stat-label">Completed Credits</span><div className="stat-main-value">{stats.credits}</div><span className="stat-sub">This semester</span></div>
      </div>

      {/* DERS VE NOT LİSTESİ (DİNAMİK) */}
      <div className="grades-list">
        {courseGrades.length > 0 ? (
          courseGrades.map((course) => (
            <div key={course.id} className="grade-course-card">
              <div className="grade-card-header">
                <div>
                    <h3>{course.name}</h3>
                    <span className="instructor-name">{course.instructor}</span>
                </div>
                {/* Final notu şu an hesaplanmadığı için gizleyebiliriz veya tire koyabiliriz */}
                <div className="final-grade-box" style={{opacity: 0.5}}>
                    <span className="letter-grade">-</span>
                    <span className="percentage-grade">Current</span>
                </div>
              </div>
              
              <div className="grade-table-wrapper">
                {course.assignments.length > 0 ? (
                    <table className="grade-table">
                    <thead>
                        <tr>
                        <th style={{width: '40%'}}>Assignment/Exam</th>
                        <th style={{width: '20%', textAlign: 'center'}}>Grade</th>
                        <th style={{width: '20%', textAlign: 'center'}}>Max</th>
                        <th style={{width: '20%', textAlign: 'right'}}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {course.assignments.map((item, idx) => (
                        <tr key={idx}>
                            <td className="task-name">{item.name}</td>
                            
                            {/* NOT GÖSTERİMİ */}
                            <td className="task-grade" style={{ textAlign: 'center' }}>
                            {item.grade !== null ? (
                                <span className={typeof item.grade === 'number' && item.grade >= 90 ? 'grade-high' : 'grade-mid'}>
                                    {item.grade}
                                </span>
                            ) : (
                                <span className="grade-pending">-</span>
                            )}
                            </td>
                            
                            <td className="task-points" style={{ textAlign: 'center' }}>{item.max}</td>
                            
                            {/* DURUM GÖSTERİMİ */}
                            <td className="task-weight" style={{ textAlign: 'right', fontSize:'0.8rem' }}>
                                {item.status === 'graded' ? <span style={{color:'#4b2e83', fontWeight:'bold'}}>Graded</span> : 
                                 item.status === 'submitted' ? <span style={{color:'green'}}>Submitted</span> : 
                                 <span style={{color:'#d32f2f'}}>Pending</span>}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                ) : (
                    <div style={{padding:'15px', color:'#999', fontSize:'0.9rem', fontStyle:'italic'}}>
                        No assignments for this course yet.
                    </div>
                )}
              </div>
            </div>
          ))
        ) : (
            <div style={{textAlign:'center', padding:'30px', color:'#777'}}>
                Henüz kayıtlı dersiniz veya notunuz bulunmuyor.
            </div>
        )}
      </div>
    </div>
  );
};
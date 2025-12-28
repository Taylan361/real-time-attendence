import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import './Dashboard.css';

interface Teacher {
  email: string; 
  name: string;
  surname: string;
  assignedCourses: string[];
}

const ALL_COURSES = [
  'Software Validation',
  'Database Management',
  'Operating Systems',
  'Calculus I',
  'Physics',
  'Artificial Intelligence',
  'Web Development'
];

interface Props {
    onLogout: () => void;
}

export const PrincipalDashboard: React.FC<Props> = ({ onLogout }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // Öğretmenleri Firebase'den Çek
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "teachers"));
        const teacherList: Teacher[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          teacherList.push({
            email: doc.id,
            name: data.name,
            surname: data.surname,
            assignedCourses: data.assignedCourses || []
          });
        });
        setTeachers(teacherList);
      } catch (error) {
        console.error("Öğretmenler çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Ders Atama / Kaldırma İşlemi
  const toggleCourse = async (teacherEmail: string, courseName: string, isAssigned: boolean) => {
    const teacherRef = doc(db, "teachers", teacherEmail);

    try {
      if (isAssigned) {
        // Varsa kaldır
        await updateDoc(teacherRef, {
          assignedCourses: arrayRemove(courseName)
        });
      } else {
        // Yoksa ekle
        await updateDoc(teacherRef, {
          assignedCourses: arrayUnion(courseName)
        });
      }

      // State'i güncelle (Sayfayı yenilemeden değişikliği gör)
      setTeachers(prev => prev.map(t => {
        if (t.email === teacherEmail) {
          const newCourses = isAssigned 
            ? t.assignedCourses.filter(c => c !== courseName)
            : [...t.assignedCourses, courseName];
          return { ...t, assignedCourses: newCourses };
        }
        return t;
      }));

    } catch (error) {
      console.error("Ders güncelleme hatası:", error);
      alert("İşlem başarısız.");
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="main-content" style={{padding: '2rem'}}>
        <header className="top-header">
            <h2>🏛️ Müdür Paneli</h2>
            <button onClick={onLogout} className="logout-btn" style={{backgroundColor: '#d9534f'}}>Çıkış Yap</button>
        </header>

        <div className="section-card" style={{marginTop: '20px'}}>
            <h3>Kayıtlı Öğretmenler ve Ders Atamaları</h3>
            {loading ? <p>Yükleniyor...</p> : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px'}}>
                    {teachers.length === 0 && <p>Henüz kayıtlı öğretmen yok.</p>}
                    
                    {teachers.map((teacher) => (
                        <div key={teacher.email} style={{border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: 'white'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
                                <div style={{width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#4b2e83', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold'}}>
                                    {teacher.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 style={{margin: 0}}>{teacher.name} {teacher.surname}</h4>
                                    <span style={{fontSize: '0.8rem', color: '#666'}}>{teacher.email}</span>
                                </div>
                            </div>
                            
                            <div style={{borderTop: '1px solid #eee', paddingTop: '10px'}}>
                                <p style={{fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px'}}>Atanacak Dersler:</p>
                                <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                                    {ALL_COURSES.map(course => {
                                        const isAssigned = teacher.assignedCourses.includes(course);
                                        return (
                                            <label key={course} style={{
                                                display: 'flex', alignItems: 'center', gap: '5px', 
                                                padding: '5px 10px', borderRadius: '15px', 
                                                backgroundColor: isAssigned ? '#e6fffa' : '#f5f5f5',
                                                border: isAssigned ? '1px solid #38b2ac' : '1px solid #ddd',
                                                cursor: 'pointer'
                                            }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={isAssigned} 
                                                    onChange={() => toggleCourse(teacher.email, course, isAssigned)}
                                                />
                                                <span style={{fontSize: '0.9rem'}}>{course}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
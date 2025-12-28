import { useState, useEffect } from 'react';
import './App.css';
import LoginPage from './LoginPage'; 
import { Dashboard } from './Dashboard';
import { TeacherDashboard } from './TeacherDashboard';
import { PrincipalDashboard } from './PrincipalDashboard'; // Yeni oluşturacağız

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'teacher' | 'principal'>('student');
  const [currentId, setCurrentId] = useState<string>(''); // Öğrenci No veya Email

  useEffect(() => {
    // Sayfa yenilendiğinde oturumu hatırla
    const savedLogin = localStorage.getItem('savedLogin');
    const savedRole = localStorage.getItem('savedRole'); // Rolü de kaydedelim

    if (savedLogin && savedRole) {
      setCurrentId(savedLogin);
      // @ts-ignore
      setUserRole(savedRole);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (role: 'student' | 'teacher' | 'principal', id: string) => {
    setUserRole(role);
    setCurrentId(id);
    setIsLoggedIn(true);
    
    // Oturumu kaydet
    localStorage.setItem('savedLogin', id);
    localStorage.setItem('savedRole', role);
  };

  const handleLogout = () => {
    localStorage.removeItem('savedLogin');
    localStorage.removeItem('savedRole');
    localStorage.removeItem('currentStudentId');
    setIsLoggedIn(false);
    setUserRole('student');
    setCurrentId('');
  };

  return (
    <div className="app-container">
      {!isLoggedIn ? (
        <LoginPage onLoginSuccess={handleLogin} />
      ) : (
        <>
          {userRole === 'principal' && <PrincipalDashboard onLogout={handleLogout} />}
          {userRole === 'teacher' && <TeacherDashboard onLogout={handleLogout} currentUserEmail={currentId} />}
          {userRole === 'student' && <Dashboard onLogout={handleLogout} />}
        </>
      )}
    </div>
  );
}

export default App;
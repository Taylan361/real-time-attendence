import { useState, useEffect } from 'react';
import './App.css';
import LoginPage from './LoginPage'; 
import { Dashboard } from './Dashboard';
import { TeacherDashboard } from './TeacherDashboard';
// initDB satırını sildik çünkü artık Firebase kullanıyoruz.

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'teacher'>('student');

  useEffect(() => {
    // Sayfa yenilendiğinde oturumu hatırla
    const savedLogin = localStorage.getItem('savedLogin');
    if (savedLogin) {
      // Basit kontrol: Email formatıysa öğretmendir
      if (savedLogin.includes('@')) {
        setUserRole('teacher');
      } else {
        setUserRole('student');
      }
      setIsLoggedIn(true);
    }
  }, []);

  // Login sayfasından gelen rolü karşılayan fonksiyon
  const handleLogin = (role: string) => {
    // Login sayfası 'admin' gönderirse biz onu 'teacher' olarak işleyelim
    if (role === 'admin' || role === 'teacher') {
      setUserRole('teacher');
    } else {
      setUserRole('student');
    }
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('savedLogin');
    localStorage.removeItem('currentStudentId');
    setIsLoggedIn(false);
    setUserRole('student');
  };

  return (
    <div className="app-container">
      {!isLoggedIn ? (
        <LoginPage onLoginSuccess={handleLogin} />
      ) : (
        // Rol kontrolüne göre doğru paneli aç
        userRole === 'teacher' ? (
          <TeacherDashboard onLogout={handleLogout} />
        ) : (
          <Dashboard onLogout={handleLogout} />
        )
      )}
    </div>
  );
}

export default App;
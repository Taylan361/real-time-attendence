import { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import { Dashboard } from './Dashboard';
import { TeacherDashboard } from './TeacherDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'student' | 'admin'>('student');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedLogin = localStorage.getItem('savedLogin');
    if (savedLogin) {
      const userRecord = localStorage.getItem(savedLogin);
      if (userRecord) {
        const user = JSON.parse(userRecord);
        setIsAuthenticated(true);
        setUserRole(user.role); // Kayıtlı rolü yükle
      }
    }
    setIsLoading(false);
  }, []);

  // GÜNCELLEME: Rolü doğrudan parametre olarak alıyoruz
  const handleLoginSuccess = (role: 'student' | 'admin') => {
    setUserRole(role); // Gelen rolü state'e yaz
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('student');
  };

  if (isLoading) {
    return <div style={{display:'flex', height:'100vh', justifyContent:'center', alignItems:'center'}}>Yükleniyor...</div>;
  }

  return (
    <div>
      {!isAuthenticated ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        userRole === 'admin' ? (
          <TeacherDashboard onLogout={handleLogout} />
        ) : (
          <Dashboard onLogout={handleLogout} />
        )
      )}
    </div>
  );
}

export default App;
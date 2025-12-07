import { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import { Dashboard } from './Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sayfa açılınca giriş yapmış mı kontrol et
  useEffect(() => {
    const savedLogin = localStorage.getItem('savedLogin');
    if (savedLogin) {
      // Eğer 'savedLogin' varsa ve local storage'da user verisi duruyorsa giriş yapılmış say
      const userRecord = localStorage.getItem(savedLogin);
      if (userRecord) {
        setIsAuthenticated(true);
      }
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    // İstersen: localStorage.removeItem('savedLogin'); // Beni hatırla'yı silmek istersen
  };

  if (isLoading) {
    return <div style={{display:'flex', height:'100vh', justifyContent:'center', alignItems:'center'}}>Yükleniyor...</div>;
  }

  return (
    <div>
      {isAuthenticated ? (
        // Giriş yapıldıysa Dashboard'u göster
        <Dashboard onLogout={handleLogout} />
      ) : (
        // Giriş yapılmadıysa Login Page'i göster
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
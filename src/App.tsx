import { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import { Dashboard } from './Dashboard'; // Öğrenci Paneli
import TeacherDashboard from './TeacherDashboard'; // Yeni Öğretmen Paneli

// Rolleri tip olarak tanımlayalım ki hata yapmayalım
type UserRole = 'student' | 'teacher' | null;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(null); // Rol durumunu tutan state
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sayfa açılınca giriş kontrolü
  useEffect(() => {
    const savedLogin = localStorage.getItem('savedLogin');
    
    if (savedLogin) {
      const userRecordStr = localStorage.getItem(savedLogin);
      if (userRecordStr) {
        try {
          const userRecord = JSON.parse(userRecordStr);
          
          // Kullanıcı var, giriş yapıldı olarak işaretle
          setIsAuthenticated(true);
          
          // Eğer kaydedilen veride rol varsa onu al, yoksa varsayılan 'student' yap
          // Not: Login olurken localStorage'a "role": "teacher" gibi bir veri kaydettiğini varsayıyoruz
          setUserRole(userRecord.role || 'student'); 
        } catch (e) {
          console.error("Local storage verisi bozuk", e);
        }
      }
    }
    setIsLoading(false);
  }, []);

  // Login başarılı olduğunda çalışacak fonksiyon
  // Artık bu fonksiyon kimin giriş yaptığını (role) parametre olarak almalı
  const handleLoginSuccess = (role: UserRole) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('savedLogin'); // Çıkışta hafızayı temizle
  };

  if (isLoading) {
    return <div style={{display:'flex', height:'100vh', justifyContent:'center', alignItems:'center'}}>Yükleniyor...</div>;
  }

  return (
    <div>
      {!isAuthenticated ? (
        // --- GİRİŞ EKRANI ---
        // Login sayfasına, giriş yapanın rolünü belirleyip bize geri göndermesi için güncellenmiş fonksiyonu yolluyoruz
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        // --- İÇERİK EKRANLARI ---
        userRole === 'teacher' ? (
          // Eğer Öğretmense:
          <TeacherDashboard onLogout={handleLogout} />
        ) : (
          // Eğer Öğrenciyse (veya rol yoksa):
          <Dashboard onLogout={handleLogout} />
        )
      )}
    </div>
  );
}

export default App;
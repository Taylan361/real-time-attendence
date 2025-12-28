import React, { useState, useEffect } from 'react';
import './LoginPage.css';
import { getStudentData, completeStudentRegistration } from './DataManager';
import { db } from './firebase'; // Firebase bağlantısı
import { doc, setDoc, getDoc } from "firebase/firestore";

// Resim Importları
import logoImg from './assets/logo.jpg';
import trFlag from './assets/tr.jpg';
import enFlag from './assets/en.jpg';

const translations = {
  tr: {
    uniName: "MALTEPE ÜNİVERSİTESİ",
    sysName: "Gerçek Zamanlı Yoklama Sistemi",
    portalTitle: "Giriş Portalı",
    portalDesc: "Giriş türünü seçiniz",
    studentLogin: "🎓 Öğrenci Girişi",
    adminLogin: "👨‍🏫 Akademisyen Girişi",
    principalBtn: "🏛️ Müdür Girişi",
    registerLink: "Hesabınız yok mu?",
    registerClick: "Kayıt Ol",
    back: "← Geri Dön",
    loginDescStudent: "Öğrenci numaranızla giriş yapın",
    loginDescAdmin: "Kurumsal e-posta ile giriş yapın",
    email: "E-posta Adresi",
    studentNo: "Öğrenci Numarası",
    password: "Şifre",
    RememberMe: "Beni Hatırla",
    loginBtn: "Giriş Yap",
    checking: "Kontrol Ediliyor...",
    registerTitle: "Yeni Kayıt",
    registerDesc: "Lütfen bilgilerinizi eksiksiz doldurun",
    name: "Ad",
    surname: "Soyad",
    setPass: "Şifre Belirle",
    instCode: "Kurum Kodu (Akademisyen Onayı)",
    registerBtn: "Kayıt Ol",
    studentRole: "Öğrenci",
    adminRole: "Akademisyen",
    navHome: "Ana Sayfa",
    navAbout: "Proje Hakkında",
    aboutTitle: "Proje Detayları",
    aboutDesc: "Sistem ve geliştirici ekip hakkında bilgiler",
    
    // --- EKSİK OLAN KISIMLAR BURADA ---
    sectOverview: "Genel Bakış",
    txtOverview: "Bu proje, sınıflardaki öğrenci yoklamasını gerçek zamanlı yüz tanıma teknolojisi kullanarak otomatize etmek için tasarlanmıştır. Amacı doğruluğu artırmak ve akademisyenlere zaman kazandırmaktır.",
    sectObjectives: "Proje Hedefleri",
    obj1: "Yoklama takibini otomatize etmek",
    obj2: "Yüksek doğruluklu yüz tanıma",
    obj3: "Raporlama ve bildirim sistemi",
    sectTeam: "Geliştirici Ekip",
    sectTech: "Metodoloji & Teknoloji",
    txtTech: "Bu proje Scrum metodolojisi kullanılarak geliştirilmiş ve Jira üzerinden takip edilmiştir.",
    
    errNotFound: "Öğrenci sistemde bulunamadı! Öğretmeninizden sizi eklemesini isteyin.",
    errGenLogin: "Giriş başarısız.",
    errInvalidPass: "Hatalı şifre!",
    errRegFirst: "Kaydınız tamamlanmamış. Lütfen 'Kayıt Ol' butonuna basarak şifrenizi oluşturun.",
    successReg: "Kayıt Başarılı! Şimdi giriş yapabilirsiniz."
  },
  en: {
    uniName: "MALTEPE UNIVERSITY",
    sysName: "Real-Time Attendance System",
    portalTitle: "Login Portal",
    portalDesc: "Select login type",
    studentLogin: "🎓 Student Login",
    adminLogin: "👨‍🏫 Instructor Login",
    principalBtn: "🏛️ Principal Login",
    registerLink: "No account?",
    registerClick: "Register",
    back: "← Go Back",
    loginDescStudent: "Login with your Student ID",
    loginDescAdmin: "Login with institutional email",
    email: "Email Address",
    studentNo: "Student ID Number",
    password: "Password",
    RememberMe: "Remember Me",
    loginBtn: "Login",
    checking: "Checking...",
    registerTitle: "New Registration",
    registerDesc: "Please fill in your details",
    name: "Name",
    surname: "Surname",
    setPass: "Set Password",
    instCode: "Institution Code (Instructor Only)",
    registerBtn: "Register",
    studentRole: "Student",
    adminRole: "Instructor",
    navHome: "Home",
    navAbout: "About Project",
    aboutTitle: "Project Details",
    aboutDesc: "Information about the system and team",
    
    // --- EKSİK OLAN KISIMLAR BURADA ---
    sectOverview: "Overview",
    txtOverview: "The Real-Time Attendance System is designed to automate student attendance monitoring using facial recognition. It aims to improve accuracy and save time for instructors.",
    sectObjectives: "Project Objectives",
    obj1: "Automate attendance tracking",
    obj2: "Real-time facial recognition",
    obj3: "Reporting and notifications",
    sectTeam: "Development Team",
    sectTech: "Methodology & Tech",
    txtTech: "This project is developed using Scrum methodology and tracked via Jira.",
    
    errNotFound: "Student not found in system! Ask your instructor to add you.",
    errGenLogin: "Login failed.",
    errInvalidPass: "Invalid password!",
    errRegFirst: "Registration incomplete. Please click 'Register' to set your password.",
    successReg: "Registration Successful! You can now login."
  }
};
// --- GEREKLİ IMPORTLARI SAYFANIN EN BAŞINA EKLEDİĞİNDEN EMİN OL:
// import { db } from './firebase';
// import { doc, getDoc, setDoc } from "firebase/firestore";

type ViewState = 'selection' | 'student' | 'admin' | 'register' | 'about';
type NotificationType = 'success' | 'error' | null;
type LangType = 'tr' | 'en';

interface LoginPageProps {
  // App.tsx'teki yapıya uyması için id parametresini ekledik
  onLoginSuccess: (role: 'student' | 'teacher' | 'principal', id: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<ViewState>('selection');
  const [notification, setNotification] = useState<{msg: string, type: NotificationType}>({ msg: '', type: null });
  const [lang, setLang] = useState<LangType>('tr'); 
  const t = translations[lang];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State'leri
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  
  // DİKKAT: Büyük/Küçük harf uyumu için senin kodundaki yapıyı korudum
  const [rememberMe, setRememberMe] = useState(false);
  
  const [registerRole, setRegisterRole] = useState<'student' | 'admin'>('student');
  const [adminSecret, setAdminSecret] = useState('');

  useEffect(() => {
    const savedLogin = localStorage.getItem('savedLogin');
    if (savedLogin) {
      if (savedLogin.includes('@')) setEmail(savedLogin);
      else setStudentNumber(savedLogin);
      setRememberMe(true);
    }
  }, []);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => {
      setNotification({ msg: '', type: null });
      if (type === 'success' && view === 'register') {
        goBack();
      }
    }, 2000);
  };

  const clearForm = () => {
    setEmail(''); setPassword(''); setName(''); setSurname(''); setStudentNumber(''); setAdminSecret('');
  };

  const goBack = () => {
    clearForm();
    setView('selection');
  };

  // --- MÜDÜR GİRİŞİ FONKSİYONU (YENİ) ---
  const handlePrincipalLogin = () => {
    // Müdür şifresiz giriyor, direkt App.tsx'e bildiriyoruz
    onLoginSuccess('principal', 'mudur@maltepe.edu.tr');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- KAYIT OLMA İŞLEMİ ---
    if (view === 'register') {
      if (registerRole === 'admin' && adminSecret !== 'MALT2024') return showToast(lang === 'tr' ? 'Hatalı Kurum Kodu!' : 'Invalid Institution Code!', 'error');
      
      // 1. ÖĞRENCİ KAYDI (Mevcut Sistem)
      if (registerRole === 'student') {
        if (studentNumber.length < 3) return showToast(lang === 'tr' ? 'Geçerli bir numara giriniz!' : 'Enter valid ID!', 'error');
        setIsLoading(true);
        try {
          const result = await completeStudentRegistration(studentNumber, name, surname, password);
          if (result.success) {
            showToast(result.message, 'success');
          } else {
            showToast(result.message, 'error');
          }
        } catch (error) {
          console.error(error);
          showToast("Bağlantı hatası oluştu.", 'error');
        } finally {
          setIsLoading(false);
        }
      } 
      // 2. AKADEMİSYEN KAYDI (Firebase'e Yazılacak - YENİ)
      else {
        setIsLoading(true);
        try {
          // Firestore'a kaydet
          await setDoc(doc(db, "teachers", email), {
            name,
            surname,
            email,
            password, // Güvenlik notu: Gerçek projede hashlenmeli
            role: 'teacher',
            assignedCourses: []
          });
          
          showToast(lang === 'tr' ? 'Kayıt Başarılı!' : 'Registration Successful!', 'success');
        } catch (error) {
          console.error("Firebase Hatası:", error);
          showToast("Kayıt sırasında hata oluştu.", 'error');
        } finally {
          setIsLoading(false);
        }
      }
    } 
    
    // --- GİRİŞ YAPMA İŞLEMİ ---
    else {
      // 1. ÖĞRENCİ GİRİŞİ (Mevcut Sistem)
      if (view === 'student') {
        if (!studentNumber) return showToast(lang === 'tr' ? 'Öğrenci No Gerekli' : 'ID Required', 'error');
        
        setIsLoading(true);
        try {
          const studentData = await getStudentData(studentNumber);

          if (studentData) {
            // @ts-ignore
            if (studentData.isRegistered === false) {
               showToast(t.errRegFirst || "Kayıt tamamlanmamış.", 'error');
               setIsLoading(false);
               return;
            }
            // @ts-ignore
            if (studentData.password && studentData.password !== password) {
               showToast(t.errInvalidPass, 'error');
               setIsLoading(false);
               return;
            }

            localStorage.setItem('currentStudentId', studentData.studentId);
            if (rememberMe) localStorage.setItem('savedLogin', studentNumber);
            
            // App.tsx'e ID ile bildiriyoruz
            onLoginSuccess('student', studentNumber);

          } else {
            showToast(t.errNotFound, 'error');
          }
        } catch (error) {
          console.error(error);
          showToast(t.errGenLogin, 'error');
        } finally {
          setIsLoading(false);
        }
      } 
      
      // 2. AKADEMİSYEN GİRİŞİ (Firebase'den Kontrol - YENİ)
      else if (view === 'admin') {
        if (!email) return showToast(lang === 'tr' ? 'Email Gerekli' : 'Email Required', 'error');
        
        setIsLoading(true);
        try {
          // Firebase'den öğretmeni çek
          const docRef = doc(db, "teachers", email);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const teacherData = docSnap.data();
            if (teacherData.password === password) {
              if (rememberMe) localStorage.setItem('savedLogin', email);
              // Başarılı giriş -> App.tsx
              onLoginSuccess('teacher', email);
            } else {
              showToast(t.errInvalidPass, 'error');
            }
          } else {
            showToast("Kayıtlı öğretmen bulunamadı.", 'error');
          }
        } catch (error) {
          console.error("Login Hatası:", error);
          showToast(t.errGenLogin, 'error');
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const NotificationModal = () => (
    <div className="notification-overlay" style={{zIndex: 9999}}> 
      <div className="notification-box">
        <div className={`notification-icon ${notification.type === 'success' ? 'icon-success' : 'icon-error'}`}>
          {notification.type === 'success' ? '✓' : '!'}
        </div>
        <div className="notification-message">{notification.msg}</div>
      </div>
    </div>
  );

  const Header = () => {
    const currentLangData = { tr: { flag: trFlag, label: "Türkçe" }, en: { flag: enFlag, label: "English" } };
    return (
      <header className="app-header">
        <div className="header-left">
          <img src={logoImg} alt="Logo" className="header-logo" />
          <div className="system-titles">
            <span className="uni-name">{t.uniName}</span>
            <span className="system-name">{t.sysName}</span>
          </div>
        </div>
        <div className="desktop-nav-area">
            <nav className="header-nav">
                <button className={`nav-link ${view !== 'about' ? 'active' : ''}`} onClick={() => setView('selection')}>{t.navHome}</button>
                <button className={`nav-link ${view === 'about' ? 'active' : ''}`} onClick={() => setView('about')}>{t.navAbout}</button>
            </nav>
            <div className="language-dropdown">
              <div className="selected-lang">
                  <img src={currentLangData[lang].flag} alt="Flag" className="flag-icon" />
                  <span>{currentLangData[lang].label}</span>
                  <span className="arrow-icon">▼</span>
              </div>
              <div className="lang-menu">
                  <div className="lang-option" onClick={() => setLang('tr')}><img src={trFlag} alt="TR" className="flag-icon" /> <span>Türkçe</span></div>
                  <div className="lang-option" onClick={() => setLang('en')}><img src={enFlag} alt="EN" className="flag-icon" /> <span>English</span></div>
              </div>
            </div>
        </div>
        <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>☰</button>
        {isMobileMenuOpen && (
          <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-menu-header">
                 <span style={{fontWeight: 'bold', color: '#4b2e83'}}>Menü</span>
                 <button className="close-btn" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
              </div>
              <div className="mobile-nav-items">
                <button className={`mobile-link ${view !== 'about' ? 'active' : ''}`} onClick={() => { setView('selection'); setIsMobileMenuOpen(false); }}>🏠 {t.navHome}</button>
                <button className={`mobile-link ${view === 'about' ? 'active' : ''}`} onClick={() => { setView('about'); setIsMobileMenuOpen(false); }}>ℹ️ {t.navAbout}</button>
              </div>
              <div className="mobile-lang-section">
                <span className="mobile-lang-title">Dil Seçimi / Language</span>
                <div className="mobile-flags">
                   <button className={`mobile-flag-btn ${lang === 'tr' ? 'active' : ''}`} onClick={() => setLang('tr')}><img src={trFlag} className="flag-icon" /> Türkçe</button>
                   <button className={`mobile-flag-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}><img src={enFlag} className="flag-icon" /> English</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    );
  };

  const renderAboutPage = () => (
    <>
      <div className="login-header"> <h2>{t.aboutTitle}</h2> <p>{t.aboutDesc}</p> </div>
      <div className="about-content">
        <div className="about-section"> <h3>📝 {t.sectOverview}</h3> <p>{t.txtOverview}</p> </div>
        <div className="about-section"> <h3>🎯 {t.sectObjectives}</h3> <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: '#555', lineHeight: '1.5' }}><li>{t.obj1}</li> <li>{t.obj2}</li> <li>{t.obj3}</li></ul> </div>
        <div className="about-section"> <h3>👥 {t.sectTeam}</h3> <div className="team-list"> <span className="team-member">Burçak Çelt</span> <span className="team-member">Ecem Nur Özer</span> <span className="team-member">Erdem Beler</span> <span className="team-member">Taylan Alp Çakı</span> </div> </div>
        <div className="about-section"> <h3>⚙️ {t.sectTech}</h3> <p style={{marginBottom: '10px'}}>{t.txtTech}</p> <div className="tech-badges"> <span>Scrum</span> <span>Jira</span> <span>React</span> <span>AI Face Rec.</span> </div> </div>
      </div>
      <button className="back-button" onClick={() => setView('selection')} style={{marginTop: '1rem'}}>{t.back}</button>
    </>
  );

  const renderSelection = () => (
    <>
      <div className="login-header"> <h2>{t.portalTitle}</h2> <p>{t.portalDesc}</p> </div>
      <div className="selection-buttons">
        <button className="role-button" onClick={() => setView('student')}>{t.studentLogin}</button>
        <button className="role-button" onClick={() => setView('admin')}>{t.adminLogin}</button>
      </div>
      
      {/* --- MÜDÜR GİRİŞİ BUTONU (YENİ EKLENDİ) --- */}
      <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <button 
            className="role-button" 
            onClick={handlePrincipalLogin}
            style={{ backgroundColor: '#2d3436', color: 'white', border: 'none' }}
          >
            {t.principalBtn || "🏛️ Müdür Girişi"}
          </button>
      </div>

      <div className="register-link" style={{marginTop:'15px'}}> {t.registerLink} <span onClick={() => setView('register')}>{t.registerClick}</span> </div>
    </>
  );

  const renderLoginForm = () => (
    <>
      <button className="back-button" onClick={goBack}>{t.back}</button>
      <div className="login-header"> <h2>{view === 'student' ? t.studentLogin : t.adminLogin}</h2> <p>{view === 'student' ? t.loginDescStudent : t.loginDescAdmin}</p> </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{view === 'student' ? t.studentNo : t.email}</label>
          {view === 'student' ? <input type="text" placeholder="220706010" value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} required /> : <input type="email" placeholder="admin@maltepe.edu.tr" value={email} onChange={(e) => setEmail(e.target.value)} required />}
        </div>
        <div className="form-group"><label>{t.password}</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        
        {/* Remember Me */}
        <div className="remember-forgot">
            <label className="remember-me">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                {t.RememberMe}
            </label>
        </div>
        
        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? t.checking : t.loginBtn}
        </button>
      </form>
    </>
  );

  const renderRegisterForm = () => (
    <>
      <button className="back-button" onClick={goBack}>{t.back}</button>
      <div className="login-header"> <h2>{t.registerTitle}</h2> <p>{t.registerDesc}</p> </div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
        <button type="button" className={`role-button ${registerRole === 'student' ? '' : 'inactive'}`} style={{ padding: '0.5rem', flex: 1 }} onClick={() => setRegisterRole('student')}>{t.studentRole}</button>
        <button type="button" className={`role-button ${registerRole === 'admin' ? '' : 'inactive'}`} style={{ padding: '0.5rem', flex: 1 }} onClick={() => setRegisterRole('admin')}>{t.adminRole}</button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>{t.name}</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div className="form-group"><label>{t.surname}</label><input type="text" value={surname} onChange={(e) => setSurname(e.target.value)} required /></div>
        <div className="form-group"><label>{t.email}</label><input type="email" placeholder="ornek@maltepe.edu.tr" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        {registerRole === 'student' && <div className="form-group"><label>{t.studentNo} (9 Hane)</label><input type="number" placeholder="220706010" value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} required /></div>}
        <div className="form-group"><label>{t.setPass}</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        {registerRole === 'admin' && <div className="form-group"><label style={{color: '#d9534f'}}>{t.instCode}</label><input type="password" placeholder="MALT2024" value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)} required /></div>}
        <button type="submit" className="login-button">{t.registerBtn}</button>
      </form>
    </>
  );

  return (
    <>
      <Header />
      <div className="login-container">
        {notification.msg && <NotificationModal />}
        <div className="login-card">
          {view === 'selection' && renderSelection()}
          {(view === 'student' || view === 'admin') && renderLoginForm()}
          {view === 'register' && renderRegisterForm()}
          {view === 'about' && renderAboutPage()}
        </div>
      </div>
    </>
  );
};

export default LoginPage;
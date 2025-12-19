import { db } from './firebase';
import { 
  collection, getDocs, addDoc, updateDoc, doc, 
  query, where, arrayUnion , orderBy, setDoc,  // <-- BUNU EKLE
  getDoc, onSnapshot
} from 'firebase/firestore';

// --- TİP TANIMLARI (Interfaces) ---
// DİKKAT: Başlarında 'export' yazması ŞART!

export interface Announcement {
  id?: string;
  courseCode: string;
  title: string;
  content: string;
  date: string;
  priority: 'normal' | 'high';
}

export interface Student {
  id?: string;
  studentId: string;
  name: string;
  enrolledCourses: string[];
}

export interface Course {
  id?: string;
  code: string;
  name: string;
  instructor: string;
}

// ... dosyanın geri kalanı (fonksiyonlar) aynı kalabilir ...

// --- FONKSİYONLAR ---

// 1. DUYURU EKLE (Öğretmen)
export const addAnnouncementToFirebase = async (announcement: Announcement) => {
  try {
    await addDoc(collection(db, "announcements"), announcement);
    console.log("Duyuru eklendi!");
  } catch (e) {
    console.error("Hata:", e);
    alert("Duyuru eklenirken bir hata oluştu.");
  }
};

// 2. ÖĞRENCİ EKLE (Öğretmen)
export const registerStudentToCourse = async (studentSchoolId: string, courseCode: string) => {
  try {
    const studentsRef = collection(db, "students");
    const q = query(studentsRef, where("studentId", "==", studentSchoolId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Öğrenci zaten varsa sadece dersi ekle
      const studentDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "students", studentDoc.id), {
        enrolledCourses: arrayUnion(courseCode)
      });
      alert(`Öğrenci (${studentSchoolId}) derse eklendi.`);
    } else {
      // Öğrenci yoksa, İSİMSİZ olarak oluştur
      await addDoc(collection(db, "students"), {
        studentId: studentSchoolId,
        name: "Kayıt Bekleniyor...", // Placeholder isim
        isRegistered: false, // Henüz kayıt olmadı bayrağı
        enrolledCourses: [courseCode]
      });
      alert(`Öğrenci (${studentSchoolId}) sisteme ön-kayıt edildi.`);
    }
  } catch (error) {
    console.error("Hata:", error);
  }
};

export const completeStudentRegistration = async (studentId: string, name: string, surname: string, password: string) => {
  const studentsRef = collection(db, "students");
  const q = query(studentsRef, where("studentId", "==", studentId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    // Eğer öğretmen bu numarayı hiç eklememişse kayıt olamaz!
    return { success: false, message: "Numaranız sistemde bulunamadı! Önce ders hocanızın sizi eklemesi gerekiyor." };
  }

  const studentDoc = querySnapshot.docs[0];
  const studentData = studentDoc.data();

  // Zaten kayıtlıysa?
  if (studentData.isRegistered) {
    return { success: false, message: "Bu numara zaten kayıtlı! Lütfen giriş yapın." };
  }

  // Kaydı Güncelle (Update)
  const userRef = doc(db, "students", studentDoc.id);
  await updateDoc(userRef, {
    name: `${name} ${surname}`, // İsmi birleştirip yazıyoruz
    password: password, // Gerçek projelerde şifre hashlenmeli ama şimdilik düz tutuyoruz
    isRegistered: true // Artık kayıtlı bir kullanıcı
  });

  return { success: true, message: "Kayıt başarılı! Şimdi giriş yapabilirsiniz." };
};

// 3. ÖĞRENCİ VERİSİNİ GETİR (Login ve Dashboard için)
export const getStudentData = async (studentSchoolId: string) => {
  const q = query(collection(db, "students"), where("studentId", "==", studentSchoolId));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Student;
  }
  return null;
};

// 4. DUYURULARI GETİR (Öğrenci Paneli için)
// Dashboard.tsx'de kırmızı yanan fonksiyon buydu
export const getAnnouncementsByCourses = async (courseCodes: string[]) => {
  if (!courseCodes || courseCodes.length === 0) return [];
  
  // Firebase 'in' sorgusu en fazla 10 eleman alır
  const safeCourses = courseCodes.slice(0, 10);
  
  const q = query(collection(db, "announcements"), where("courseCode", "in", safeCourses));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
};

// --- YENİ: VERİTABANINI DOLDURMA (SEED) ---
// Bunu sadece bir kere çalıştırıp veritabanını doldurmak için kullanabilirsin
export const seedDatabase = async () => {
  const testStudentId = "220706010";
  
  // Önce öğrenci var mı bakalım
  const check = await getStudentData(testStudentId);
  if (!check) {
    await addDoc(collection(db, "students"), {
      studentId: testStudentId,
      name: "Öykü Şahin",
      enrolledCourses: ["MATH 401"]
    });
    console.log("Demo öğrenci oluşturuldu.");
  }
  alert("Veritabanı hazır!");
};
export const addAssignmentToFirebase = async (data: { courseCode: string, title: string, dueDate: string }) => {
  try {
    const docRef = await addDoc(collection(db, "assignments"), {
      courseCode: data.courseCode,
      title: data.title,
      dueDate: data.dueDate,
      createdAt: new Date(), // Oluşturulma zamanı
      status: 'Active',      // Varsayılan aktif
      submittedCount: 0,     // Henüz kimse teslim etmedi
      totalStudents: 0       // İleride öğrenci sayısını buraya bağlarız
    });
    console.log("Ödev eklendi ID: ", docRef.id);
    return { success: true };
  } catch (error) {
    console.error("Ödev eklenirken hata:", error);
    return { success: false, error };
  }
};


export const fetchAssignmentsFromFirebase = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "assignments"));
    const assignmentsList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log("🔥 Firebase'den Çekilen Ham Ödev Sayısı:", assignmentsList.length);
    return assignmentsList;
  } catch (error) {
    console.error("Ödev çekme hatası:", error);
    return [];
  }
};

// --- 1. NOTLANDIRMA FONKSİYONU ---
export const gradeAssignment = async (assignmentId: string, score: string) => {
  try {
    const assignmentRef = doc(db, "assignments", assignmentId);
    await updateDoc(assignmentRef, {
      points: score,       // Örneğin: "85/100"
      status: 'graded'     // Durumu 'graded' yapıyoruz
    });
    return { success: true };
  } catch (error) {
    console.error("Notlandırma hatası:", error);
    return { success: false, error };
  }
};

// --- 2. DERSE KAYITLI ÖĞRENCİLERİ ÇEKME ---
export const getStudentsByCourse = async (courseCode: string) => {
  try {
    // Tüm öğrencileri çek (Gerçek projede 'where' sorgusu daha verimli olur ama şimdilik böyle yapalım)
    // Not: 'students' koleksiyonun varsa oradan çekiyoruz.
    // Eğer students koleksiyonun yoksa DataManager'daki mock veriyi simüle edebiliriz.
    
    // YÖNTEM A: Firebase'de 'students' koleksiyonu varsa:
    const q = query(collection(db, "students"), where("enrolledCourses", "array-contains", courseCode));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

  } catch (error) {
    console.error("Öğrenci çekme hatası:", error);
    return [];
  }
};

// --- YOKLAMA OTURUM YÖNETİMİ ---

// 1. Öğretmen: Yoklama oturumunu başlatır/bitirir
export const toggleAttendanceSession = async (courseCode: string, isOpen: boolean) => {
  try {
    // 'active_sessions' koleksiyonunda ders koduyla bir doküman tutuyoruz
    await setDoc(doc(db, "active_sessions", courseCode), {
      isActive: isOpen,
      startTime: isOpen ? new Date().toISOString() : null,
      courseCode: courseCode
    });
    return { success: true };
  } catch (error) {
    console.error("Oturum açma hatası:", error);
    return { success: false, error };
  }
};

// 2. Öğrenci: Aktif yoklama var mı diye kontrol eder
export const checkActiveSession = async (courseCode: string) => {
  try {
    const docRef = doc(db, "active_sessions", courseCode);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().isActive) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

// 3. Öğrenci: Kendini "Var" olarak işaretler (Gerçek Kayıt)
export const markStudentPresent = async (studentId: string, courseCode: string) => {
  try {
    // Bugünün tarihi (Örn: 2025-12-19)
    const today = new Date().toISOString().split('T')[0];
    
    // Benzersiz bir ID oluşturuyoruz: DERS_TARIH_OGRENCI
    // Böylece aynı öğrenci aynı gün 2 kere yoklama alamaz, üstüne yazar.
    const docId = `${courseCode}_${today}_${studentId}`;

    // 'attendance' koleksiyonuna kaydet
    await setDoc(doc(db, "attendance", docId), {
        studentId: studentId,
        courseCode: courseCode,
        date: today,
        status: 'present',
        method: 'face_recognition', // Yüz tanıma ile geldiğini belirtelim (Hava atarız sunumda)
        timestamp: new Date()
    });

    console.log(`✅ Veritabanına işlendi: ${docId}`);
    return { success: true };
  } catch (error) {
    console.error("Yoklama kaydı hatası:", error);
    return { success: false, error };
  }
};

export const listenToRealTimeAttendance = (courseCode: string, callback: (presentStudentIds: string[]) => void) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Sadece bugünün ve bu dersin kayıtlarını dinle
  const q = query(
    collection(db, "attendance"),
    where("courseCode", "==", courseCode),
    where("date", "==", today)
  );

  // onSnapshot: Veritabanında bir şey değiştiği an çalışır!
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const presentIds = snapshot.docs.map(doc => doc.data().studentId);
    callback(presentIds); // Hocanın ekranına ID listesini gönder
  });

  return unsubscribe; // Dinlemeyi durdurmak için bunu döndürüyoruz
};


// FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ******
// FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ******
// FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ******
// FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ******
// FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ******
// FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ******
// FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ******
// FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ******
// FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ******
// FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ****** FAKE DATAS ******

export const injectSampleData = async () => {
  const confirm = window.confirm("⚠️ DİKKAT: Veritabanına toplu sahte veri eklenecek. Onaylıyor musunuz?");
  if (!confirm) return;

  console.log("Veri enjeksiyonu başlıyor...");

  // 1. SAHTE DUYURULAR (ANNOUNCEMENTS)
  const fakeAnnouncements = [
    { courseCode: 'MATH 401', title: 'Vize Sonuçları Açıklandı', content: 'Arkadaşlar vize kağıtlarınızı ofisimden alabilirsiniz. Çan eğrisi 45 puandır.', date: '2025-11-15', priority: 'high' },
    { courseCode: 'CS 101', title: 'Laboratuvar İptali', content: 'Bu haftaki Cuma laboratuvarı elektrik kesintisi nedeniyle yapılmayacaktır.', date: '2025-12-01', priority: 'normal' },
    { courseCode: 'GENEL', title: 'Kış Festivali', content: 'Kampüs bahçesinde düzenlenecek kış festivaline tüm öğrenciler davetlidir.', date: '2025-12-20', priority: 'low' },
    { courseCode: 'PHY 101', title: 'Ek Ders Duyurusu', content: 'Final öncesi soru çözüm saati Çarşamba 14:00\'te yapılacaktır.', date: '2025-12-18', priority: 'high' },
    { courseCode: 'CS 302', title: 'Proje Teslim Tarihi Uzatıldı', content: 'Yoğun istek üzerine işletim sistemleri projesi 2 gün ertelenmiştir.', date: '2025-12-10', priority: 'normal' },
  ];

  // 2. SAHTE ÖDEVLER (ASSIGNMENTS)
  const fakeAssignments = [
    // MATH 401
    { courseCode: 'MATH 401', title: 'Calculus Problem Set 1', dueDate: '2025-10-15', points: '85', status: 'graded' },
    { courseCode: 'MATH 401', title: 'Midterm Preparation', dueDate: '2025-11-10', points: '90', status: 'graded' },
    { courseCode: 'MATH 401', title: 'Final Project: Graphs', dueDate: '2025-12-30', points: '100 pts', status: 'todo' },
    
    // CS 101
    { courseCode: 'CS 101', title: 'Intro to Algorithms Quiz', dueDate: '2025-10-20', points: '100', status: 'graded' },
    { courseCode: 'CS 101', title: 'Database Design Schema', dueDate: '2025-11-25', points: '75', status: 'graded' },
    { courseCode: 'CS 101', title: 'SQL Queries Homework', dueDate: '2025-12-15', points: '100 pts', status: 'submitted' },
    
    // CS 302
    { courseCode: 'CS 302', title: 'Process Scheduling Sim', dueDate: '2025-11-05', points: '88', status: 'graded' },
    { courseCode: 'CS 302', title: 'Memory Management Report', dueDate: '2025-12-25', points: '100 pts', status: 'todo' },

    // PHY 101
    { courseCode: 'PHY 101', title: 'Lab Report: Gravity', dueDate: '2025-11-12', points: '95', status: 'graded' },
    { courseCode: 'PHY 101', title: 'Thermodynamics Essay', dueDate: '2025-12-05', points: '100 pts', status: 'submitted' }
  ];

  try {
    // Duyuruları Yükle
    for (const ann of fakeAnnouncements) {
      await addDoc(collection(db, "announcements"), ann);
    }
    console.log("✅ Duyurular eklendi.");

    // Ödevleri Yükle
    for (const assign of fakeAssignments) {
      await addDoc(collection(db, "assignments"), assign);
    }
    console.log("✅ Ödevler eklendi.");

    alert("🎉 İşlem Tamam! Sisteme 5 duyuru ve 10 ödev başarıyla enjekte edildi.");
    
    // Sayfayı yenile ki veriler görünsün
    window.location.reload();

  } catch (error) {
    console.error("Veri ekleme hatası:", error);
    alert("Bir hata oluştu.");
  }
};

// DataManager.ts en altına ekle:

// 5. Öğretmen: Canlı Ödev Takibi (Real-time Assignments)
export const listenToRealTimeAssignments = (callback: (assignments: any[]) => void) => {
  // Tüm ödevleri dinle
  const q = query(collection(db, "assignments"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const assignmentsList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // Değişiklik olduğunda yeni listeyi hocaya gönder
    callback(assignmentsList);
  });

  return unsubscribe; // Dinlemeyi durdurmak için
};
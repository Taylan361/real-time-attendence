# Maltepe Üniversitesi | Gerçek Zamanlı Yoklama ve Öğrenci Yönetim Sistemi (M.Ü. GYÖS)

## 🌟 Proje Tanıtımı

Bu proje, Maltepe Üniversitesi Bilgisayar Mühendisliği Bölümü için geliştirilmiş, öğrenci ve akademisyenlerin günlük ders/ödev yönetimini ve **gerçek zamanlı yoklama takibini** sağlayan bir web uygulaması prototipidir.

Uygulama, modern bir arayüz ile öğrenci ve akademisyen deneyimini merkezine alarak tasarlanmıştır.

## ✨ Temel Özellikler

### 🎓 Öğrenci Paneli (Student Dashboard)
* **Derslerim:** Kayıtlı olunan derslerin detaylarını, eğitmen bilgilerini ve ilerleme durumlarını görüntüleme.
* **Ödev Yönetimi:** Yapılacak, teslim edilmiş ve notlandırılmış ödevleri sekmeler halinde takip etme.
* **Notlarım:** Her derse ait vize, final ve ödev notlarının ağırlıklarıyla birlikte izlenmesi.
* **Takvim:** Ders, sınav ve ödev teslim tarihlerini içeren kişiselleştirilmiş takvim görünümü.

### 👨‍🏫 Akademisyen Paneli (Instructor Dashboard)
* **Gerçek Zamanlı Yoklama:** Seçilen derse ait öğrenci listesini görüntüleme ve anlık olarak yoklama alma (Present, Absent, Late).
* **Duyuru Oluşturma:** Öğrencilere özel duyurular yayımlama ve aciliyet seviyesi belirleme.
* **Ödev Takibi:** Derse ait ödevlerin teslim istatistiklerini izleme.

## 💻 Kullanılan Teknolojiler

Proje, modern ve hızlı bir kullanıcı deneyimi sunmak için React ekosistemi kullanılarak geliştirilmiştir.

| Kategori | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Ön Yüz (Frontend)** | React (TypeScript) | Kullanıcı arayüzü bileşenleri ve state yönetimi için temel kütüphane. |
| **Dil** | TypeScript (TSX) | Daha güvenli ve ölçeklenebilir kod yazmak için JavaScript'in tip tabanlı üst kümesi. |
| **Stil** | CSS / Vanilla CSS | Özelleştirilmiş ve temiz bir UI/UX için saf CSS kullanımı. |
| **Veri Yönetimi** | Mock Data (Sahte Veri) | Demo amaçlı olarak verilerin dışa bağımlı olmadan React bileşenleri içinde tutulması. |
| **Kimlik Doğrulama** | `localStorage` | Giriş bilgilerinin (Kullanıcı Rolü) tarayıcıda geçici olarak saklanması. |

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları takip edin:

### Ön Gereksinimler

* [Node.js](https://nodejs.org/en) (tercihen LTS sürümü)
* [npm](https://www.npmjs.com/) veya [Yarn](https://yarnpkg.com/)

### Adımlar

1.  **Depoyu Klonlayın:**
    ```bash
    git clone [REPO_ADRESİNİZİ_BURAYA_EKLEYİN]
    cd [PROJE_KLASÖRÜ_ADI]
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    # veya
    yarn install
    ```

3.  **Projeyi Başlatın:**
    ```bash
    npm run dev
    # veya
    yarn dev
    ```

Proje, genellikle `http://localhost:5173` adresinde otomatik olarak açılacaktır.

## 🔑 Demo Giriş Bilgileri

Uygulamayı test etmek için aşağıdaki sahte kullanıcıları kullanabilirsiniz. (Giriş yapmadan önce, *Kayıt Ol* ekranında bu kullanıcıları oluşturmanız gerekebilir.)

| Rol | Kullanıcı Adı / No | Şifre |
| :--- | :--- | :--- |
| **Öğrenci** | 220706010 | 123456 |
| **Akademisyen** | taylan.caki@maltepe.edu.tr | 123456 |

## ✍️ Katkıda Bulunanlar

* [Adınız Soyadınız / GitHub Kullanıcı Adınız]
* [Arkadaşınızın Adı Soyadı / GitHub Kullanıcı Adı]

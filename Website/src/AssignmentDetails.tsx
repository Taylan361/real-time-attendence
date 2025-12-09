import React, { useState, useRef } from 'react';
import './Dashboard.css';

interface AssignmentDetailsProps {
  onBack: () => void;
}

export const AssignmentDetails: React.FC<AssignmentDetailsProps> = ({ onBack }) => {
  // --- STATE YÖNETİMİ ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  
  // Gizli input elementine erişmek için referans
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FONKSİYONLAR ---

  // 1. Gizli dosya inputunu tetikler
  const handleZoneClick = () => {
    fileInputRef.current?.click();
  };

  // 2. Dosya seçildiğinde çalışır
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // 3. Gönder butonuna basınca çalışır (Simülasyon)
  const handleUpload = () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');

    // 2 saniye bekleyip başarılı kabul ediyoruz (API isteği simülasyonu)
    setTimeout(() => {
      setUploadStatus('success');
      
      // 1.5 saniye sonra da listeye geri dönelim
      setTimeout(() => {
        onBack();
      }, 1500);
    }, 2000);
  };

  // --- İÇERİK ---
  return (
    <div className="fade-in">
      <button onClick={onBack} className="back-button" style={{marginBottom: '20px'}}>
        ← Ödevlere Dön
      </button>

      <div className="section-card" style={{maxWidth: '800px', margin: '0 auto'}}>
        
        {/* ÜST BİLGİ ALANI */}
        <div className="card-header">
          <h2>Testing Problem Set 5</h2>
          <span className="status-badge" style={{background:'#fff7ed', color:'#ea580c', fontSize:'0.9rem'}}>Teslim Bekliyor</span>
        </div>
        
        <p className="subtitle">Ders: Software Validation and Testing</p>
        
        <div style={{background: '#f8fafc', padding: '20px', borderRadius: '10px', marginBottom: '20px'}}>
          <h4 style={{marginTop:0}}>Ödev Açıklaması:</h4>
          <p style={{color:'#555', lineHeight:'1.6'}}>
            Bölüm 5'teki 1 ile 20 arasındaki problemleri çözünüz. 
            Unit testlerinizi ekran görüntüleri ile belgeleyip tek bir PDF dosyası halinde yükleyiniz.
            Kod kalitesine ve isimlendirme standartlarına dikkat ediniz.
          </p>
          <div className="card-meta" style={{marginTop:'15px'}}>
            <span>📅 Son Teslim: 17 Kasım 2025, 23:59</span>
            <span>🏆 Puan: 100</span>
          </div>
        </div>

        {/* --- YÜKLEME ALANI (UPLOAD ZONE) --- */}
        {uploadStatus === 'success' ? (
          // BAŞARILI OLURSA GÖZÜKECEK KISIM
          <div style={{textAlign:'center', padding:'40px', background:'#f0fdf4', borderRadius:'12px', border:'1px solid #bbf7d0'}}>
            <div style={{fontSize:'40px', marginBottom:'10px'}}>🎉</div>
            <h3 style={{color:'#166534', margin:0}}>Ödeviniz Başarıyla Gönderildi!</h3>
            <p style={{color:'#15803d'}}>Yönlendiriliyorsunuz...</p>
          </div>
        ) : (
          // NORMAL DURUMDA GÖZÜKECEK KISIM
          <>
            <h3 style={{marginBottom:'15px'}}>Dosya Yükle</h3>
            
            {/* Gizli Input (Görünmez ama işi bu yapar) */}
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{display: 'none'}} 
              onChange={handleFileChange}
            />

            {/* Görünen Özel Buton */}
            <div 
              className="upload-zone-btn" 
              onClick={handleZoneClick}
              style={{
                background: selectedFile ? '#f0f9ff' : '#1a1a1a', 
                color: selectedFile ? '#0369a1' : 'white',
                border: selectedFile ? '2px solid #0ea5e9' : '2px dashed #444',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
              }}
            >
              {selectedFile ? (
                <>
                  <span style={{fontSize:'24px'}}>📄</span>
                  <span>{selectedFile.name}</span>
                  <span style={{fontSize:'0.8rem', opacity:0.7}}>Değiştirmek için tıklayın</span>
                </>
              ) : (
                <>
                  <span style={{fontSize:'24px'}}>📂</span>
                  <span>Dosya Seçmek İçin Tıklayın veya Sürükleyin</span>
                </>
              )}
            </div>
            
            {/* AKSİYON BUTONLARI */}
            <div style={{display:'flex', justifyContent:'flex-end', marginTop:'20px', gap:'10px'}}>
              <button 
                className="secondary-btn" 
                onClick={onBack}
                disabled={uploadStatus === 'uploading'}
              >
                İptal
              </button>
              
              <button 
                className="primary-black-btn" 
                onClick={handleUpload}
                disabled={!selectedFile || uploadStatus === 'uploading'}
                style={{opacity: (!selectedFile || uploadStatus === 'uploading') ? 0.5 : 1}}
              >
                {uploadStatus === 'uploading' ? 'Yükleniyor...' : 'Ödevi Gönder'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
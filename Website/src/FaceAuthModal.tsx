import React, { useEffect, useRef, useState } from 'react';
import './Dashboard.css';

interface FaceAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  studentName: string;
}

export const FaceAuthModal: React.FC<FaceAuthModalProps> = ({ isOpen, onClose, onSuccess, studentName }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'verified'>('idle');
  const [message, setMessage] = useState("Kamera başlatılıyor...");
  const [isCameraActive, setIsCameraActive] = useState(false); // Kamera gerçekten açıldı mı?

  useEffect(() => {
    if (isOpen) {
      setScanStatus('idle');
      setMessage("Yüzünüzü çerçeveye hizalayın...");
      setIsCameraActive(false);
      
      // Kamerayı açmayı dene
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsCameraActive(true);
          }
          startScanning(); // Kamera açılsa da açılmasa da taramayı başlat
        })
        .catch((err) => {
          console.log("Kamera açılamadı (Simülasyon Modu):", err);
          // Kamera açılmasa bile "Siyah Ekran" üzerinden taramayı başlat
          startScanning(); 
        });

    } else {
        // Modal kapandığında kamerayı durdur
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [isOpen]);

  const startScanning = () => {
    // Biraz bekle (1 sn), sonra tarama başlasın
    setTimeout(() => {
        setScanStatus('scanning');
        setMessage("Biyometrik tarama yapılıyor...");

        // 3 saniye tarıyor gibi yap, sonra onayla
        setTimeout(() => {
            setScanStatus('verified');
            setMessage(`Doğrulandı: ${studentName}`);
            
            // 1.5 saniye sonra başarı fonksiyonunu çalıştır
            setTimeout(() => {
                onSuccess();
            }, 1500);
        }, 3000);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999}}>
      <div className="modal-content" style={{
          maxWidth: '400px', 
          textAlign: 'center', 
          background: '#1a1a1a', 
          color: 'white', 
          border: '1px solid #333',
          padding: '20px'
      }}>
        
        <h3 style={{marginBottom: '15px'}}>🔐 Yüz Doğrulama</h3>
        
        <div style={{
            position: 'relative', 
            width: '100%', 
            height: '300px', 
            backgroundColor: '#000', // Kamera açılmazsa siyah fon görünür
            borderRadius: '10px', 
            overflow: 'hidden', 
            margin: '0 auto',
            border: '1px solid #444'
        }}>
            {/* Kamera Görüntüsü (Varsa) */}
            <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline
                style={{
                    width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)',
                    display: isCameraActive ? 'block' : 'none' 
                }} 
            />
            
            {/* Kamera Yoksa Siyah Ekranda Avatar Göster (Daha şık durur) */}
            {!isCameraActive && (
                <div style={{
                    width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', 
                    flexDirection:'column', color:'#555'
                }}>
                    <span style={{fontSize:'4rem'}}>👤</span>
                    <span style={{fontSize:'0.8rem', marginTop:'10px'}}>Kamera Simülasyonu</span>
                </div>
            )}

            {/* --- EFEKTLER --- */}

            {/* 1. Tarama Çizgisi (Yeşil Lazer) */}
            {scanStatus === 'scanning' && (
                <div className="scan-line"></div>
            )}

            {/* 2. Yüz Çerçevesi */}
            <div style={{
                position: 'absolute', top: '15%', left: '20%', width: '60%', height: '70%', 
                border: scanStatus === 'verified' ? '4px solid #4caf50' : '2px dashed rgba(255,255,255,0.6)', 
                borderRadius: '20px', transition: 'all 0.3s',
                boxShadow: scanStatus === 'verified' ? '0 0 20px #4caf50' : 'none'
            }}></div>
            
            {/* 3. Başarılı İkonu */}
            {scanStatus === 'verified' && (
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    fontSize: '5rem', textShadow: '0 0 20px rgba(0,0,0,0.8)'
                }}>
                    ✅
                </div>
            )}
        </div>

        <p style={{
            marginTop: '20px', 
            fontSize: '1.1rem', 
            fontWeight: 'bold',
            color: scanStatus === 'verified' ? '#4caf50' : '#ccc',
            transition: 'color 0.3s'
        }}>
            {message}
        </p>

        <button 
            onClick={onClose} 
            style={{
                marginTop: '15px', padding: '10px 25px', background: 'transparent', 
                border: '1px solid #555', color: '#888', borderRadius: '30px', cursor: 'pointer'
            }}>
            İptal
        </button>
      </div>

      <style>{`
        .scan-line {
            position: absolute;
            width: 100%;
            height: 3px;
            background: #00ff00;
            box-shadow: 0 0 15px #00ff00;
            top: 0;
            left: 0;
            animation: scanAnim 2s infinite linear;
            z-index: 10;
        }
        @keyframes scanAnim {
            0% { top: 0%; opacity: 0; }
            15% { opacity: 1; }
            85% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
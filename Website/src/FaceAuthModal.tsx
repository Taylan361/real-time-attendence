import React, { useEffect, useRef, useState } from 'react';
import './Dashboard.css';

interface FaceAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  studentName: string;
  studentId?: string; // Dashboard'dan gelen ID'yi buraya ekledik
}

export const FaceAuthModal: React.FC<FaceAuthModalProps> = ({ 
  isOpen, onClose, onSuccess, studentName, studentId 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Durumlar: idle (boşta), scanning (sunucuya soruyor), verified (başarılı), error (hata)
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'verified' | 'error'>('idle');
  const [message, setMessage] = useState("Kamera başlatılıyor...");
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setScanStatus('idle');
      setMessage("Lütfen kameraya bakın ve taramayı başlatın...");
      setIsCameraActive(false);
      
      // Kamerayı başlat
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsCameraActive(true);
          }
        })
        .catch((err) => {
          console.error("Kamera hatası:", err);
          setMessage("Kamera bulunamadı! Lütfen izinleri kontrol edin.");
        });

    } else {
        // Modal kapanınca kamerayı durdur
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [isOpen]);

  // GERÇEK YÜZ TANIMA FONKSİYONU
  const captureAndVerify = async () => {
    if (!videoRef.current || !isCameraActive) return;
    if (!studentId) {
        setScanStatus('error');
        setMessage("Hata: Öğrenci ID bulunamadı.");
        return;
    }

    setScanStatus('scanning');
    setMessage("Yüz verisi işleniyor...");

    try {
        // 1. Videodan o anki kareyi yakala (Canvas kullanarak)
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            // Resmi Base64 formatına çevir
            const imageSrc = canvas.toDataURL('image/jpeg');

            // 2. Python Backend'e (app.py) gönder
            // NOT: Eğer telefondan deniyorsan 'localhost' yerine bilgisayarın IP adresini yaz (örn: 192.168.1.35)
            const response = await fetch('http://localhost:5001/detect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageSrc })
            });

            const data = await response.json();

            // 3. Sonucu Kontrol Et
            if (data.status === 'success') {
                if (data.studentId === studentId) {
                    setScanStatus('verified');
                    setMessage(`Doğrulandı: ${studentName}`);
                    
                    // 1.5 saniye sonra yoklamayı işle
                    setTimeout(() => onSuccess(), 1500);
                } else {
                    setScanStatus('error');
                    setMessage(`❌ Eşleşme Hatası! (Algılanan: ${data.studentId})`);
                }
            } else {
                setScanStatus('error');
                setMessage("❌ Yüz tanınamadı veya kayıtlı değil.");
            }
        }
    } catch (error) {
        console.error("API Hatası:", error);
        setScanStatus('error');
        setMessage("⚠️ Sunucuya bağlanılamadı (app.py açık mı?)");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999}}>
      <div className="modal-content" style={{
          maxWidth: '400px', textAlign: 'center', background: '#1a1a1a', 
          color: 'white', border: '1px solid #333', padding: '20px'
      }}>
        
        <h3 style={{marginBottom: '15px'}}>🔐 Biyometrik Doğrulama</h3>
        
        <div style={{
            position: 'relative', width: '100%', height: '300px', backgroundColor: '#000',
            borderRadius: '10px', overflow: 'hidden', margin: '0 auto', border: '1px solid #444'
        }}>
            {/* Video Elementi */}
            <video 
                ref={videoRef} autoPlay muted playsInline
                style={{
                    width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)',
                    display: isCameraActive ? 'block' : 'none' 
                }} 
            />
            
            {!isCameraActive && (
                <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#666'}}>
                    Kamera Bekleniyor...
                </div>
            )}

            {/* Efektler */}
            {scanStatus === 'scanning' && <div className="scan-line"></div>}

            <div style={{
                position: 'absolute', top: '15%', left: '20%', width: '60%', height: '70%', 
                border: scanStatus === 'verified' ? '4px solid #4caf50' : 
                        scanStatus === 'error' ? '4px solid #d32f2f' : '2px dashed rgba(255,255,255,0.6)', 
                borderRadius: '20px', transition: 'all 0.3s',
                boxShadow: scanStatus === 'verified' ? '0 0 20px #4caf50' : 'none'
            }}></div>
            
            {scanStatus === 'verified' && (
                <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '5rem'}}>✅</div>
            )}
        </div>

        <p style={{
            marginTop: '20px', fontSize: '1.1rem', fontWeight: 'bold',
            color: scanStatus === 'verified' ? '#4caf50' : scanStatus === 'error' ? '#d32f2f' : '#ccc'
        }}>
            {message}
        </p>

        <div style={{display:'flex', gap:'10px', justifyContent:'center', marginTop:'15px'}}>
            <button 
                onClick={onClose} 
                style={{
                    padding: '10px 20px', background: 'transparent', 
                    border: '1px solid #555', color: '#888', borderRadius: '30px', cursor: 'pointer'
                }}>
                İptal
            </button>
            
            {/* Taramayı Başlat Butonu (Sadece kamera açıksa ve işlem bitmediyse görünür) */}
            {isCameraActive && scanStatus !== 'verified' && (
                <button 
                    onClick={captureAndVerify}
                    disabled={scanStatus === 'scanning'}
                    style={{
                        padding: '10px 25px', 
                        background: scanStatus === 'scanning' ? '#555' : '#4b2e83', 
                        border: 'none', color: 'white', borderRadius: '30px', 
                        cursor: 'pointer', fontWeight: 'bold'
                    }}>
                    {scanStatus === 'scanning' ? 'Taranıyor...' : 'Yüzü Tara'}
                </button>
            )}
        </div>
      </div>

      <style>{`
        .scan-line {
            position: absolute; width: 100%; height: 3px; background: #00ff00;
            box-shadow: 0 0 15px #00ff00; top: 0; left: 0;
            animation: scanAnim 2s infinite linear; z-index: 10;
        }
        @keyframes scanAnim {
            0% { top: 0%; opacity: 0; }
            50% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

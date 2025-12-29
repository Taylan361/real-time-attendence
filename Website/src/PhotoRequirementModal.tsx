import React, { useState } from 'react';
import { uploadProfileImage } from './DataManager'; // Yolu kendine göre ayarla

interface Props {
  isOpen: boolean;
  studentId: string;
  onSuccess: (url: string) => void;
}

export const PhotoRequirementModal: React.FC<Props> = ({ isOpen, studentId, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Lütfen bir fotoğraf seçin!');
      return;
    }
    if (!studentId) {
        setError('Öğrenci numarası bulunamadı!');
        return;
    }

    setUploading(true);
    
    // DataManager'daki fonksiyonu çağırıyoruz
    const result = await uploadProfileImage(file, studentId);

    if (result.success && result.url) {
        // Başarılı olursa üst bileşene haber ver
        onSuccess(result.url);
    } else {
        setError('Yükleme başarısız oldu. Lütfen tekrar deneyin.');
    }
    setUploading(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 99999, // En üstte dursun
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: 'white', padding: '30px', borderRadius: '15px',
        maxWidth: '450px', textAlign: 'center', borderTop: '10px solid #d32f2f'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '10px' }}>📸</div>
        <h2 style={{ color: '#d32f2f', margin: '0 0 10px 0' }}>Profil Fotoğrafı Zorunlu</h2>
        <p style={{ color: '#555', marginBottom: '20px' }}>
          Sistemi kullanabilmek ve yüz tanıma ile yoklama verebilmek için
          lütfen net bir yüz fotoğrafınızı yükleyin.
        </p>

        <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ width: '100%' }}
          />
        </div>

        {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}

        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{
            backgroundColor: uploading ? '#ccc' : '#d32f2f',
            color: 'white', padding: '12px 30px', border: 'none',
            borderRadius: '30px', fontSize: '1rem', cursor: uploading ? 'wait' : 'pointer',
            fontWeight: 'bold', width: '100%'
          }}
        >
          {uploading ? 'Sisteme Yükleniyor...' : 'Fotoğrafı Kaydet ve Devam Et'}
        </button>
      </div>
    </div>
  );
};

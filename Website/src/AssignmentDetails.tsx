import React from 'react';
import './Dashboard.css'; // Stil dosyan aynı kalsın

interface AssignmentDetailsProps {
  onBack: () => void;
  data: any; // Dashboard'dan gelen seçili ödev verisi
}

export const AssignmentDetails: React.FC<AssignmentDetailsProps> = ({ onBack, data }) => {
  
  if (!data) {
    return <div className="fade-in" style={{padding:'20px'}}>Veri bulunamadı. <button onClick={onBack}>Geri</button></div>;
  }

  return (
    <div className="fade-in">
      {/* Üst Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', marginRight: '10px' }}>
          ← Geri
        </button>
        <h2 style={{ margin: 0 }}>Ödev Detayları</h2>
      </div>

      {/* Detay Kartı */}
      <div className="section-card" style={{maxWidth: '800px', margin: '0 auto'}}>
        <div style={{borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px'}}>
            <span className="course-badge" style={{marginBottom:'10px', display:'inline-block'}}>{data.course}</span>
            <h1 style={{fontSize: '1.8rem', color: '#4b2e83', margin: '5px 0'}}>{data.title}</h1>
            <div style={{color: '#666', fontSize: '0.9rem'}}>Teslim Tarihi: <strong>{data.dueDate}</strong></div>
        </div>

        <div style={{marginBottom: '25px'}}>
            <h4>Açıklama / Yönerge</h4>
            <p style={{lineHeight: '1.6', color: '#333', backgroundColor:'#f9f9f9', padding:'15px', borderRadius:'8px'}}>
                {data.desc || "Eğitmen tarafından ek bir açıklama girilmedi."}
            </p>
        </div>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'30px', borderTop:'1px solid #eee', paddingTop:'20px'}}>
            <div>
                <span style={{display:'block', fontSize:'0.8rem', color:'#888'}}>Durum</span>
                {data.status === 'submitted' ? (
                    <span style={{color:'green', fontWeight:'bold', fontSize:'1.1rem'}}>✅ Teslim Edildi</span>
                ) : data.status === 'graded' ? (
                     <span style={{color:'#4b2e83', fontWeight:'bold', fontSize:'1.1rem'}}>🌟 Notlandırıldı</span>
                ) : (
                    <span style={{color:'#d32f2f', fontWeight:'bold', fontSize:'1.1rem'}}>⏳ Yapılacak</span>
                )}
            </div>

            {/* NOT GÖSTERME KISMI - ÖNEMLİ */}
            {data.points && data.points !== '100 pts' && (
                <div style={{textAlign:'right'}}>
                    <span style={{display:'block', fontSize:'0.8rem', color:'#888'}}>Notunuz</span>
                    <span style={{fontSize:'2rem', fontWeight:'bold', color:'#4b2e83'}}>{data.points}</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
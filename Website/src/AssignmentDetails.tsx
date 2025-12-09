import React, { useState, useRef } from 'react';
import './Dashboard.css';

interface AssignmentDetailsProps {
  onBack: () => void;
}

export const AssignmentDetails: React.FC<AssignmentDetailsProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleZoneClick = () => { fileInputRef.current?.click(); };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    setUploadStatus('uploading');
    setTimeout(() => {
      setUploadStatus('success');
      setTimeout(() => { onBack(); }, 1500);
    }, 2000);
  };

  return (
    <div className="fade-in">
      <button onClick={onBack} className="back-button" style={{marginBottom: '20px'}}>
        ← Back to Assignments
      </button>

      <div className="section-card" style={{maxWidth: '800px', margin: '0 auto'}}>
        <div className="card-header">
          <h2>Testing Problem Set 5</h2>
          <span className="status-badge" style={{background:'#fff7ed', color:'#ea580c', fontSize:'0.9rem'}}>Pending Submission</span>
        </div>
        
        <p className="subtitle">Course: Software Validation and Testing</p>
        
        <div style={{background: '#f8fafc', padding: '20px', borderRadius: '10px', marginBottom: '20px'}}>
          <h4 style={{marginTop:0}}>Assignment Description:</h4>
          <p style={{color:'#555', lineHeight:'1.6'}}>
            Complete problems 1 through 20 from Chapter 5. 
            Document your unit tests with screenshots and upload them as a single PDF file.
            Pay attention to code quality and naming conventions.
          </p>
          <div className="card-meta" style={{marginTop:'15px'}}>
            <span>📅 Due Date: November 17, 2025, 23:59</span>
            <span>🏆 Points: 100</span>
          </div>
        </div>

        {uploadStatus === 'success' ? (
          <div style={{textAlign:'center', padding:'40px', background:'#f0fdf4', borderRadius:'12px', border:'1px solid #bbf7d0'}}>
            <div style={{fontSize:'40px', marginBottom:'10px'}}>🎉</div>
            <h3 style={{color:'#166534', margin:0}}>Assignment Submitted Successfully!</h3>
            <p style={{color:'#15803d'}}>Redirecting...</p>
          </div>
        ) : (
          <>
            <h3 style={{marginBottom:'15px'}}>Upload File</h3>
            <input type="file" ref={fileInputRef} style={{display: 'none'}} onChange={handleFileChange} />

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
                  <span style={{fontSize:'0.8rem', opacity:0.7}}>Click to change</span>
                </>
              ) : (
                <>
                  <span style={{fontSize:'24px'}}>📂</span>
                  <span>Click or Drag to Select File</span>
                </>
              )}
            </div>
            
            <div style={{display:'flex', justifyContent:'flex-end', marginTop:'20px', gap:'10px'}}>
              <button className="secondary-btn" onClick={onBack} disabled={uploadStatus === 'uploading'}>Cancel</button>
              <button 
                className="primary-black-btn" 
                onClick={handleUpload}
                disabled={!selectedFile || uploadStatus === 'uploading'}
                style={{opacity: (!selectedFile || uploadStatus === 'uploading') ? 0.5 : 1}}
              >
                {uploadStatus === 'uploading' ? 'Uploading...' : 'Submit Assignment'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
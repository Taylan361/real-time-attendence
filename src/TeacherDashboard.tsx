.teacher-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f4f7f6;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 15px 25px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.dashboard-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.logout-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}
.logout-btn:hover { background-color: #c0392b; }

.attendance-card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.attendance-table {
  margin-top: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 2fr 1.5fr;
  background: #3498db;
  color: white;
  padding: 15px;
  font-weight: bold;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 2fr 1.5fr;
  padding: 12px 15px;
  border-bottom: 1px solid #f1f1f1;
  align-items: center;
}
.table-row:last-child { border-bottom: none; }
.table-row:hover { background-color: #f9f9f9; }

/* Duruma göre arka plan renklendirmesi (isteğe bağlı) */
.table-row.present { border-left: 4px solid #2ecc71; }
.table-row.absent { border-left: 4px solid #e74c3c; }

.actions { display: flex; gap: 10px; }

.btn {
  padding: 8px 20px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  color: #7f8c8d;
  transition: all 0.2s;
}

.btn.check:hover { background-color: #eafaf1; color: #2ecc71; border-color: #2ecc71; }
.btn.cross:hover { background-color: #fdedec; color: #e74c3c; border-color: #e74c3c; }

/* Aktif (seçili) buton stilleri */
.btn.check.active { background-color: #2ecc71; color: white; border-color: #2ecc71; }
.btn.cross.active { background-color: #e74c3c; color: white; border-color: #e74c3c; }

.save-btn {
  width: 100%;
  margin-top: 20px;
  padding: 15px;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: 0.3s;
}
.save-btn:hover { background-color: #1a252f; }
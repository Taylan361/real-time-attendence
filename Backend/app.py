import os
import json
import firebase_admin
from firebase_admin import credentials, storage
from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import numpy as np
import base64
import io
from PIL import Image

app = Flask(__name__)
CORS(app)

# Firebase Bucket Adı (Senin projenin doğru adı)
BUCKET_NAME = 'maltepe-gyos.firebasestorage.app'

# --- FIREBASE BAĞLANTISI (Render & Local Uyumlu) ---
try:
    # 1. Önce Render'daki gizli Environment Variable'a bakar
    if os.getenv('FIREBASE_CREDENTIALS'):
        print("🔒 Render Environment üzerinden bağlanılıyor...")
        
        # JSON stringini Python sözlüğüne çevir
        service_account_info = json.loads(os.getenv('FIREBASE_CREDENTIALS'))
        
        # Render'da bazen private_key içindeki \n karakterleri bozulur (tek satır olur).
        # Onları gerçek satır sonuna çeviriyoruz:
        if 'private_key' in service_account_info:
             service_account_info['private_key'] = service_account_info['private_key'].replace('\\n', '\n')

        cred = credentials.Certificate(service_account_info)
    
    # 2. Eğer Environment yoksa (Lokalde çalışıyorsan) dosyaya bakar
    else:
        print("📂 Local dosya (serviceAccountKey.json) üzerinden bağlanılıyor...")
        if os.path.exists("serviceAccountKey.json"):
            cred = credentials.Certificate("serviceAccountKey.json")
        else:
            raise FileNotFoundError("serviceAccountKey.json bulunamadı ve Environment Variable yok!")

    # Firebase Başlat
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred, {
            'storageBucket': BUCKET_NAME
        })
    print("✅ Firebase bağlantısı başarılı!")
    
except Exception as e:
    print(f"🔥 KRİTİK FIREBASE BAĞLANTI HATASI: {e}")

# Global Değişkenler (Yüz verilerini RAM'de tutacağız)
known_face_encodings = []
known_face_ids = []

def load_faces_from_firebase():
    """Server açılırken Firebase'deki öğrenci fotolarını indirip öğrenir."""
    print("🔄 Firebase'den yüzler yükleniyor, lütfen bekleyin...")
    
    global known_face_encodings, known_face_ids
    
    try:
        bucket = storage.bucket()
        # Klasördeki dosyaları listele
        print(f"📂 Bucket ({BUCKET_NAME}) taranıyor...")
        blobs = list(bucket.list_blobs(prefix='student_photos/'))
        
        print(f"📊 Toplam {len(blobs)} adet dosya bulundu (Klasör dahil).")

        count = 0
        local_encodings = []
        local_ids = []

        for blob in blobs:
            # Sadece resim dosyalarını al, klasörün kendisini alma
            if (blob.name.endswith(".jpg") or blob.name.endswith(".png")) and blob.name != 'student_photos/':
                try:
                    file_name = blob.name.split('/')[-1]
                    student_id = file_name.split('.')[0]
                    
                    print(f"  ⬇️ İndiriliyor: {file_name} ...")
                    image_bytes = blob.download_as_bytes()
                    
                    print(f"  ⚙️ Yüz işleniyor: {file_name} ...")
                    image = face_recognition.load_image_file(io.BytesIO(image_bytes))
                    encodings = face_recognition.face_encodings(image)
                    
                    if len(encodings) > 0:
                        local_encodings.append(encodings[0])
                        local_ids.append(student_id)
                        count += 1
                        print(f"  ✅ Yüklendi: {student_id}")
                    else:
                        print(f"  ⚠️ UYARI: {file_name} dosyasında yüz bulunamadı.")
                
                except Exception as inner_e:
                    print(f"  ❌ Hata ({blob.name}): {inner_e}")

        # Global listeleri güncelle
        known_face_encodings = local_encodings
        known_face_ids = local_ids
        print(f"🏁 İŞLEM BİTTİ: Toplam {count} öğrenci yüzü hafızaya alındı.")
        
    except Exception as e:
        print(f"🔥 YÜZLERİ YÜKLERKEN HATA OLUŞTU: {e}")

# --- SUNUCU BAŞLARKEN YÜZLERİ YÜKLE ---
# Gunicorn veya Flask run fark etmeksizin çalışması için buraya koyduk
with app.app_context():
    load_faces_from_firebase()

@app.route('/')
def home():
    """Sunucunun durumunu ve hafızadaki öğrenci sayısını gösterir."""
    return f"""
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #2ecc71;">Yüz Tanıma API Çalışıyor! 🚀</h1>
        <p>Bağlı Bucket: <strong>{BUCKET_NAME}</strong></p>
        <p>Hafızadaki Öğrenci Sayısı: <strong style="font-size: 24px;">{len(known_face_ids)}</strong></p>
    </div>
    """

@app.route('/detect', methods=['POST'])
def detect_face():
    """React'ten gelen fotoğrafı analiz eder."""
    data = request.get_json()
    
    if not data or 'image' not in data:
        return jsonify({"status": "fail", "message": "Resim verisi gelmedi"}), 400

    try:
        # 1. Base64 verisini resme çevir
        image_data = data['image'].split(",")[1]
        decoded_image = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(decoded_image))
        image_np = np.array(image)

        # 2. Gelen resimdeki yüzleri bul
        face_locations = face_recognition.face_locations(image_np)
        face_encodings = face_recognition.face_encodings(image_np, face_locations)

        if len(face_encodings) == 0:
            return jsonify({"status": "fail", "message": "Görüntüde yüz bulunamadı. Lütfen ışığı kontrol edin."})

        # --- ÇÖKME KORUMASI ---
        if len(known_face_encodings) == 0:
            print("⚠️ HATA: Sistemde hiç kayıtlı yüz yok!")
            return jsonify({"status": "fail", "message": "Sistem veritabanı boş (0 Öğrenci)."})

        # 3. Karşılaştırma
        unknown_face_encoding = face_encodings[0]
        face_distances = face_recognition.face_distance(known_face_encodings, unknown_face_encoding)
        
        best_match_index = np.argmin(face_distances)
        best_distance = face_distances[best_match_index]
        
        print(f"🔍 En yakın mesafe: {best_distance}")

        # Eşik Değeri (Threshold): 0.6 standarttır.
        # Daha düşük = Daha katı, Daha yüksek = Daha gevşek
        if best_distance < 0.6:
            matched_id = known_face_ids[best_match_index]
            confidence = round((1 - best_distance) * 100, 2)
            print(f"✅ Eşleşme: {matched_id} (Benzerlik: %{confidence})")
            return jsonify({
                "status": "success",
                "studentId": matched_id,
                "confidence": confidence
            })
        else:
            print(f"❌ Tanınamadı. En yakın: {known_face_ids[best_match_index]} ({best_distance})")
            return jsonify({"status": "fail", "message": "Yüz tanınamadı"})

    except Exception as e:
        print(f"Server Hatası: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/refresh', methods=['GET'])
def refresh_faces():
    """Frontend'den tetiklenince yüzleri yeniden yükler."""
    print("🔄 İstek üzerine yüz listesi güncelleniyor...")
    try:
        load_faces_from_firebase() # Var olan fonksiyonu tekrar çağırıyoruz
        return jsonify({
            "status": "success",
            "message": f"Liste güncellendi. Toplam {len(known_face_ids)} kişi hafızada."
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ... if __name__ == '__main__': ...
if __name__ == '__main__':
    # Lokalde çalışırken debug modunu aç
    app.run(host='0.0.0.0', port=5001, debug=True)

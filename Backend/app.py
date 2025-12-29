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
BUCKET_NAME = 'maltepe-gyos.firebasestorage.app'

# Firebase Bağlantısı
try:
    # 1. Önce Render'daki gizli değişkene bakar
    if os.getenv('FIREBASE_CREDENTIALS'):
        print("🔒 Render Environment üzerinden bağlanılıyor...")
        # JSON stringini Python sözlüğüne çevirir
        service_account_info = json.loads(os.getenv('FIREBASE_CREDENTIALS'))
        cred = credentials.Certificate(service_account_info)
    
    # 2. Eğer o yoksa (Lokalde çalışıyorsan) dosyaya bakar
    else:
        print("📂 Local dosya üzerinden bağlanılıyor...")
        cred = credentials.Certificate("serviceAccountKey.json")

    firebase_admin.initialize_app(cred, {
        'storageBucket': BUCKET_NAME
    })
    print("✅ Firebase bağlantısı başarılı!")
except Exception as e:
    print(f"❌ Firebase hatası: {e}")

# Yüz verilerini tutacağımız listeler (Global Değişkenler)
known_face_encodings = []
known_face_ids = []

def load_faces_from_firebase():
    """Server açılırken Firebase'deki öğrenci fotolarını indirip öğrenir."""
    print("🔄 Firebase'den yüzler yükleniyor, lütfen bekleyin...")
    
    global known_face_encodings, known_face_ids
    
    try:
        bucket = storage.bucket()
        # Debug 1: Bakalım bucket'a erişebiliyor mu?
        print(f"📂 Bucket ({BUCKET_NAME}) içindeki dosyalar listeleniyor...")
        blobs = list(bucket.list_blobs(prefix='student_photos/')) # Listeye çevirip sayıyı görelim
        
        print(f"📊 Toplam {len(blobs)} adet dosya bulundu.")

        count = 0
        local_encodings = []
        local_ids = []

        for blob in blobs:
            if (blob.name.endswith(".jpg") or blob.name.endswith(".png")) and blob.name != 'student_photos/':
                try:
                    file_name = blob.name.split('/')[-1]
                    student_id = file_name.split('.')[0]
                    
                    # Debug 2: İndirme başlıyor
                    print(f"  ⬇️ İndiriliyor: {file_name} ...")
                    image_bytes = blob.download_as_bytes()
                    
                    # Debug 3: Yüz okuma başlıyor (En ağır işlem burası)
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

        known_face_encodings = local_encodings
        known_face_ids = local_ids
        print(f"🏁 İŞLEM BİTTİ: Toplam {count} öğrenci yüzü hafızaya alındı.")
        
    except Exception as e:
        print(f"🔥 KRİTİK HATA: Yüzler yüklenirken hata oluştu: {e}")

# --- KRİTİK DÜZELTME BURADA ---
# Gunicorn ile çalışırken de bu fonksiyonun çağrılması ŞART!
# if __name__ kontrolünü kaldırdık.
with app.app_context():
    load_faces_from_firebase()

@app.route('/')
def home():
    return f"<h1>Yüz Tanıma API Çalışıyor! 🚀</h1><p>Hafızadaki Öğrenci Sayısı: {len(known_face_ids)}</p>"

@app.route('/detect', methods=['POST'])
def detect_face():
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
            return jsonify({"status": "fail", "message": "Görüntüde yüz bulunamadı. Işığı kontrol edin."})

        # --- ÇÖKME KORUMASI ---
        # Eğer hafızada hiç öğrenci yoksa argmin yapmaya çalışma!
        if len(known_face_encodings) == 0:
            print("⚠️ HATA: Sistemde hiç kayıtlı yüz yok!")
            return jsonify({"status": "fail", "message": "Sistem veritabanı boş, kimseyle eşleşemiyor."})

        # 3. Karşılaştırma
        unknown_face_encoding = face_encodings[0]
        face_distances = face_recognition.face_distance(known_face_encodings, unknown_face_encoding)
        
        best_match_index = np.argmin(face_distances)
        best_distance = face_distances[best_match_index]
        
        print(f"🔍 En yakın mesafe: {best_distance}")

        # Eşik değeri (0.6)
        if best_distance < 0.6:
            matched_id = known_face_ids[best_match_index]
            confidence = round((1 - best_distance) * 100, 2)
            print(f"✅ Eşleşme: {matched_id} (%{confidence})")
            return jsonify({"status": "success", "studentId": matched_id})
        else:
            return jsonify({"status": "fail", "message": "Tanımsız yüz"})

    except Exception as e:
        print(f"Server Hatası: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

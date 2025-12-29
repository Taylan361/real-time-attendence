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
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred, {
        'storageBucket': BUCKET_NAME
    })
    print("✅ Firebase bağlantısı başarılı!")
except Exception as e:
    print(f"❌ Firebase hatası: {e}")
    print("İPUCU: serviceAccountKey.json dosyasının app.py ile aynı klasörde olduğundan emin ol.")

# Yüz verilerini tutacağımız listeler (RAM'de tutuyoruz, hızlı olsun diye)
known_face_encodings = []
known_face_ids = []

def load_faces_from_firebase():
    """Server açılırken Firebase'deki öğrenci fotolarını indirip öğrenir."""
    print("🔄 Firebase'den yüzler yükleniyor, lütfen bekleyin...")
    
    try:
        bucket = storage.bucket()
        # 'student_photos/' klasöründeki dosyaları listele
        blobs = bucket.list_blobs(prefix='student_photos/')

        count = 0
        for blob in blobs:
            # Klasörün kendisini alma, sadece resimleri al
            if (blob.name.endswith(".jpg") or blob.name.endswith(".png")) and blob.name != 'student_photos/':
                try:
                    # Dosya isminden öğrenci nosunu çıkar (student_photos/220706010.jpg -> 220706010)
                    file_name = blob.name.split('/')[-1]
                    student_id = file_name.split('.')[0]

                    # Resmi RAM'e indir (Diske kaydetmeye gerek yok)
                    image_bytes = blob.download_as_bytes()
                    image = face_recognition.load_image_file(io.BytesIO(image_bytes))
                    
                    # Yüzü kodla (Encoding) - 128 boyutlu vektör çıkarır
                    encodings = face_recognition.face_encodings(image)
                    
                    if len(encodings) > 0:
                        known_face_encodings.append(encodings[0])
                        known_face_ids.append(student_id)
                        count += 1
                        print(f"  -> Yüklendi: {student_id}")
                    else:
                        print(f"  -> UYARI: {file_name} dosyasında yüz bulunamadı.")
                
                except Exception as inner_e:
                    print(f"  -> Hata ({blob.name}): {inner_e}")

        print(f"✅ Toplam {count} öğrenci yüzü hafızaya alındı.")
    except Exception as e:
        print(f"❌ Yüzler yüklenirken hata oluştu: {e}")

# Uygulama başlarken yüzleri yükle
if __name__ != '__main__':
   pass
else:
   load_faces_from_firebase()
@app.route('/')
def home():
    return "<h1>Yüz Tanıma API Çalışıyor! 🚀</h1><p>Bu bir API servisidir. İstekleri /detect adresine POST olarak atmalısın.</p>"
@app.route('/detect', methods=['POST'])
@app.route('/detect', methods=['POST'])
def detect_face():
    data = request.get_json()
    
    if not data or 'image' not in data:
        return jsonify({"status": "fail", "message": "Resim verisi gelmedi"}), 400

    try:
        # Resim işleme kısımları aynı...
        image_data = data['image'].split(",")[1]
        decoded_image = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(decoded_image))
        image_np = np.array(image)

        face_locations = face_recognition.face_locations(image_np)
        face_encodings = face_recognition.face_encodings(image_np, face_locations)

        if len(face_encodings) == 0:
            print("❌ Görüntüde yüz bulunamadı.")
            return jsonify({"status": "fail", "message": "Yüz görülemedi, lütfen ışığı kontrol edin."})

        unknown_face_encoding = face_encodings[0]
        
        # Eğer hiç kayıtlı yüz yoksa hata dön
        if len(known_face_encodings) == 0:
            print("⚠️ Hafızada hiç kayıtlı yüz yok! (Firebase boş veya yüklenmedi)")
            return jsonify({"status": "fail", "message": "Sistemde kayıtlı öğrenci yüzü yok."})

        # Mesafeleri hesapla
        face_distances = face_recognition.face_distance(known_face_encodings, unknown_face_encoding)
        best_match_index = np.argmin(face_distances)
        best_distance = face_distances[best_match_index]

        print(f"🔍 En yakın eşleşme mesafesi: {best_distance}")

        # EŞİK DEĞERİ GÜNCELLEMESİ: 0.5 yerine 0.6 yapıyoruz (Daha esnek olsun)
        if best_distance < 0.6:
            matched_id = known_face_ids[best_match_index]
            confidence = round((1 - best_distance) * 100, 2)
            
            print(f"✅ Eşleşme bulundu: {matched_id} (Benzerlik: %{confidence})")
            
            return jsonify({
                "status": "success",
                "studentId": matched_id
            })
        else:
            print(f"❌ Yüz tanınamadı. En yakın kişi: {known_face_ids[best_match_index]} ama mesafe ({best_distance}) > 0.6")
            return jsonify({"status": "fail", "message": "Yüz tanınamadı"})

    except Exception as e:
        print(f"Server Hatası: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    # 0.0.0.0 yaparak ağdaki diğer cihazların da erişmesine izin veriyoruz
    app.run(host='0.0.0.0', port=5001, debug=True)

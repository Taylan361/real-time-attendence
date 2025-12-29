import requests
import base64
import json

# BURAYA TEST EDECEĞİN RESMİN ADINI YAZ
resim_adi = "220706011.png"

# API Adresi (Senin çalışan portun)
url = "http://127.0.0.1:5001/detect"

try:
    # 1. Resmi aç ve Base64 formatına çevir
    with open(resim_adi, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')

    # 2. React uygulamasının gönderdiği formatı taklit et
    # Senin app.py kodun virgülden sonrasını aldığı için başına fake bir header ekliyoruz
    payload = {
        "image": "data:image/jpeg;base64," + encoded_string
    }

    # 3. İsteği gönder
    print(f"📡 {resim_adi} gönderiliyor...")
    response = requests.post(url, json=payload)

    # 4. Sonucu yazdır
    print("\n--- SONUÇ ---")
    print("Durum Kodu:", response.status_code)
    print("Cevap:", response.json())

except FileNotFoundError:
    print(f"❌ HATA: '{resim_adi}' dosyası bulunamadı. Lütfen klasöre bir resim ekle.")
except Exception as e:
    print(f"❌ HATA: {e}")

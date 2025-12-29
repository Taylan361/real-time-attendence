# Python 3.9 slim (Bu wheel dosyası 3.9 ile uyumludur)
FROM python:3.9-slim

# Çalışma klasörü
WORKDIR /app

# Gerekli sistem araçlarını yükle (wget'e gerek kalmadı)
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Dosyaları kopyala
COPY . .

# 1. ADIM: Dlib'i doğrudan çalışan URL üzerinden kur
# Bu link (ibraym reposu) şu an aktif ve Linux için derlenmiş dosyayı içeriyor.
RUN pip install https://github.com/ibraym/dlib-wheels/raw/main/dlib-19.22.99-cp39-cp39-linux_x86_64.whl

# 2. ADIM: face-recognition kur
RUN pip install face_recognition

# 3. ADIM: Diğer gereksinimleri kur
RUN pip install --no-cache-dir -r requirements.txt

# Portu aç
EXPOSE 5000

# Başlat
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]

# Python 3.9 slim
FROM python:3.9-slim

# Çalışma klasörü
WORKDIR /app

# Gerekli sistem kütüphaneleri
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Dosyaları kopyala
COPY . .

# pip güncelle
RUN pip install --upgrade pip

# 1. dlib-bin kur (hazır derlenmiş - RAM tüketmez)
RUN pip install dlib-bin

# 2. face_recognition'ı dlib bağımlılığı olmadan kur
RUN pip install --no-deps face_recognition

# 3. face_recognition'ın diğer bağımlılıklarını kur
RUN pip install numpy Pillow click face_recognition_models

# 4. Diğer gereksinimleri kur
RUN pip install --no-cache-dir -r requirements.txt

# Portu aç
EXPOSE 5000

# Başlat
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]

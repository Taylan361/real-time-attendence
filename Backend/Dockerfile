# Python 3.9 slim sürümü (Hafif ve hızlı)
FROM python:3.9-slim

# Çalışma klasörünü ayarla
WORKDIR /app

# Gerekli araçları yükle
# DÜZELTME: 'libgl1-mesa-glx' yerine 'libgl1' yazdık.
# Ayrıca 'build-essential' ekledik (g++, make vb. hepsini içerir).
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Dosyaları kopyala
COPY . .

# Python kütüphanelerini yükle (Bu aşama biraz uzun sürebilir)
RUN pip install --no-cache-dir -r requirements.txt

# Portu aç
EXPOSE 5000

# Uygulamayı başlat
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]

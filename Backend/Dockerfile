# Python 3.9 slim kullanıyoruz (dlib wheel dosyası buna uygun)
FROM python:3.9-slim

# Çalışma klasörü
WORKDIR /app

# Gerekli sistem araçlarını yükle
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libgl1 \
    libglib2.0-0 \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Dosyaları kopyala
COPY . .

# 1. ADIM: Dlib'i yeni ve çalışan bir kaynaktan indir
# Önceki link ölmüş, bu link (OguzhanErturk reposu) aktif çalışıyor.
RUN wget https://github.com/OguzhanErturk/dlib-wheels/raw/master/dlib-19.22.99-cp39-cp39-linux_x86_64.whl

# 2. ADIM: İndirilen dosyayı kur
RUN pip install dlib-19.22.99-cp39-cp39-linux_x86_64.whl

# 3. ADIM: Artık face-recognition kurabiliriz
RUN pip install face_recognition

# 4. ADIM: Diğer gereksinimleri kur
RUN pip install --no-cache-dir -r requirements.txt

# İndirdiğimiz kurulum dosyasını temizle
RUN rm dlib-19.22.99-cp39-cp39-linux_x86_64.whl

# Portu aç
EXPOSE 5000

# Başlat
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]

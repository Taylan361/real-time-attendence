# Python 3.9 kullanıyoruz (face_recognition ile en uyumlu sürüm)
FROM python:3.9-slim

# Çalışma klasörünü ayarla
WORKDIR /app

# Gerekli sistem araçlarını yükle (dlib ve opencv için şart)
RUN apt-get update && apt-get install -y \
    cmake \
    g++ \
    make \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Dosyaları kopyala
COPY . .

# Python kütüphanelerini yükle
RUN pip install --no-cache-dir -r requirements.txt

# Portu aç (Render 10000 portunu sever ama biz dinamik kullanacağız)
EXPOSE 5000

# Uygulamayı başlat (Gunicorn kullanarak)
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]

# Python 3.9 slim
FROM python:3.9-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN pip install --upgrade pip

# dlib-bin kullan (önceden derlenmiş)
RUN pip install dlib-bin

# face_recognition'ı dlib bağımlılığı olmadan kur
RUN pip install face_recognition --no-deps
RUN pip install numpy pillow click

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]

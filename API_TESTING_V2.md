# 📡 Digital IoT Education API v2.0 - Testing Guide

> **Base URL:** `http://localhost:3000`  
> **Format:** JSON  
> **Ganti `{userId}` dengan ID user kamu, contoh: `user123`**

---

## 🗂️ API Structure

```
/api
├── /control          ← Kontrol aktuator/output
│   ├── /led          ← LED (ON/OFF)
│   ├── /servo        ← Servo Motor (0-180°)
│   ├── /buzzer       ← Buzzer (ON/OFF)
│   ├── /relay        ← Relay (ON/OFF)
│   ├── /rgb-led      ← RGB LED (r,g,b: 0-255)
│   ├── /motor-dc     ← Motor DC (speed + direction)
│   └── /lcd          ← LCD 16x2 (text + line)
├── /monitoring       ← Monitoring sensor/input
│   ├── /dht          ← Suhu & Kelembapan
│   ├── /ldr          ← Intensitas Cahaya
│   ├── /ultrasonic   ← Jarak (cm)
│   ├── /soil-moisture← Kelembapan Tanah
│   ├── /gas          ← Gas Sensor (MQ-2/MQ-135)
│   ├── /pir          ← Deteksi Gerakan
│   ├── /rain         ← Deteksi Hujan
│   └── /custom       ← Sensor Custom (bebas!)
├── /status           ← Status Gabungan
│   ├── /all          ← Semua data
│   ├── /control      ← Semua kontrol
│   └── /monitoring   ← Semua sensor
└── /universal        ← Universal device control
```

---

## 🔍 API Discovery

### Lihat Semua Kategori
```
GET /api
```

### Lihat Endpoints per Kategori
```
GET /api/control
GET /api/monitoring
GET /api/status
```

---

## 🎮 CONTROL - Kontrol Aktuator

### 1. LED (ON/OFF)

**Set LED:**
```bash
curl -X POST http://localhost:3000/api/control/led/user123 \
  -H "Content-Type: application/json" \
  -d '{"status": "ON"}'
```

**Get LED:**
```bash
curl http://localhost:3000/api/control/led/user123
```

**Response:**
```json
{ "userId": "user123", "device": "led", "status": "ON" }
```

---

### 2. Servo Motor (0-180°)

**Set Servo:**
```bash
curl -X POST http://localhost:3000/api/control/servo/user123 \
  -H "Content-Type: application/json" \
  -d '{"position": 90}'
```

**Get Servo:**
```bash
curl http://localhost:3000/api/control/servo/user123
```

**Response:**
```json
{ "userId": "user123", "device": "servo", "position": 90 }
```

---

### 3. Buzzer (ON/OFF)

**Set Buzzer:**
```bash
curl -X POST http://localhost:3000/api/control/buzzer/user123 \
  -H "Content-Type: application/json" \
  -d '{"status": "ON"}'
```

**Get Buzzer:**
```bash
curl http://localhost:3000/api/control/buzzer/user123
```

---

### 4. Relay (ON/OFF)

> Relay digunakan untuk mengontrol perangkat listrik AC (lampu, kipas, pompa air)

**Set Relay:**
```bash
curl -X POST http://localhost:3000/api/control/relay/user123 \
  -H "Content-Type: application/json" \
  -d '{"status": "ON"}'
```

**Get Relay:**
```bash
curl http://localhost:3000/api/control/relay/user123
```

---

### 5. RGB LED (Warna Custom r,g,b: 0-255)

**Set RGB LED:**
```bash
curl -X POST http://localhost:3000/api/control/rgb-led/user123 \
  -H "Content-Type: application/json" \
  -d '{"r": 255, "g": 0, "b": 128}'
```

**Get RGB LED:**
```bash
curl http://localhost:3000/api/control/rgb-led/user123
```

**Response:**
```json
{ "userId": "user123", "device": "rgb-led", "color": { "r": 255, "g": 0, "b": 128 } }
```

---

### 6. Motor DC (Speed + Direction)

> Speed: 0-255, Direction: CW (clockwise) / CCW (counter-clockwise)

**Set Motor DC:**
```bash
curl -X POST http://localhost:3000/api/control/motor-dc/user123 \
  -H "Content-Type: application/json" \
  -d '{"speed": 200, "direction": "CW"}'
```

**Get Motor DC:**
```bash
curl http://localhost:3000/api/control/motor-dc/user123
```

**Response:**
```json
{ "userId": "user123", "device": "motor-dc", "speed": 200, "direction": "CW" }
```

---

### 7. LCD Display 16x2 (Text + Line)

> Text maksimal 16 karakter, line: 1 atau 2

**Set LCD:**
```bash
curl -X POST http://localhost:3000/api/control/lcd/user123 \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello World!", "line": 1}'
```

**Get LCD:**
```bash
curl http://localhost:3000/api/control/lcd/user123
```

---

## 📊 MONITORING - Monitoring Sensor

### 1. DHT - Suhu & Kelembapan

**Kirim Data DHT:**
```bash
curl -X POST http://localhost:3000/api/monitoring/dht/user123 \
  -H "Content-Type: application/json" \
  -d '{"temperature": 28.5, "humidity": 65}'
```

**Ambil Data DHT:**
```bash
curl http://localhost:3000/api/monitoring/dht/user123
```

**Response:**
```json
{ "userId": "user123", "sensor": "dht", "temperature": 28.5, "humidity": 65, "timestamp": "2026-04-23T12:00:00.000Z" }
```

---

### 2. LDR - Intensitas Cahaya (0-1023)

**Kirim Data LDR:**
```bash
curl -X POST http://localhost:3000/api/monitoring/ldr/user123 \
  -H "Content-Type: application/json" \
  -d '{"intensity": 750}'
```

**Ambil Data LDR:**
```bash
curl http://localhost:3000/api/monitoring/ldr/user123
```

---

### 3. Ultrasonic - Jarak (cm)

> Sensor HC-SR04, mengukur jarak dalam cm

**Kirim Data Ultrasonic:**
```bash
curl -X POST http://localhost:3000/api/monitoring/ultrasonic/user123 \
  -H "Content-Type: application/json" \
  -d '{"distance": 25.4}'
```

**Ambil Data Ultrasonic:**
```bash
curl http://localhost:3000/api/monitoring/ultrasonic/user123
```

**Response:**
```json
{ "userId": "user123", "sensor": "ultrasonic", "distance": 25.4, "unit": "cm", "timestamp": "..." }
```

---

### 4. Soil Moisture - Kelembapan Tanah (0-100%)

> Cocok untuk proyek smart garden / automated watering

**Kirim Data Soil Moisture:**
```bash
curl -X POST http://localhost:3000/api/monitoring/soil-moisture/user123 \
  -H "Content-Type: application/json" \
  -d '{"moisture": 45}'
```

**Ambil Data Soil Moisture:**
```bash
curl http://localhost:3000/api/monitoring/soil-moisture/user123
```

---

### 5. Gas Sensor (MQ-2/MQ-135)

> gasLevel otomatis menentukan detected (true jika > 400)

**Kirim Data Gas:**
```bash
curl -X POST http://localhost:3000/api/monitoring/gas/user123 \
  -H "Content-Type: application/json" \
  -d '{"gasLevel": 350}'
```

**Ambil Data Gas:**
```bash
curl http://localhost:3000/api/monitoring/gas/user123
```

**Response:**
```json
{ "userId": "user123", "sensor": "gas", "gasLevel": 350, "detected": false, "timestamp": "..." }
```

---

### 6. PIR - Deteksi Gerakan

> Otomatis menyimpan lastDetected timestamp saat motion = true

**Kirim Data PIR:**
```bash
curl -X POST http://localhost:3000/api/monitoring/pir/user123 \
  -H "Content-Type: application/json" \
  -d '{"motion": true}'
```

**Ambil Data PIR:**
```bash
curl http://localhost:3000/api/monitoring/pir/user123
```

---

### 7. Rain Sensor - Deteksi Hujan

> rainLevel (0-1023), otomatis set isRaining = true jika < 500

**Kirim Data Rain:**
```bash
curl -X POST http://localhost:3000/api/monitoring/rain/user123 \
  -H "Content-Type: application/json" \
  -d '{"rainLevel": 300}'
```

**Ambil Data Rain:**
```bash
curl http://localhost:3000/api/monitoring/rain/user123
```

**Response:**
```json
{ "userId": "user123", "sensor": "rain", "rainLevel": 300, "isRaining": true, "timestamp": "..." }
```

---

### 8. 🌟 Custom Monitoring (Sensor Bebas!)

> Siswa bisa membuat sensor monitoring sendiri! Kirim data apapun dengan nama sensor bebas.

**Buat Sensor Custom (contoh: sensor UV):**
```bash
curl -X POST http://localhost:3000/api/monitoring/custom/user123/uv-sensor \
  -H "Content-Type: application/json" \
  -d '{"uvIndex": 7, "level": "High", "recommendation": "Pakai sunscreen!"}'
```

**Buat Sensor Custom (contoh: sensor suara):**
```bash
curl -X POST http://localhost:3000/api/monitoring/custom/user123/sound-sensor \
  -H "Content-Type: application/json" \
  -d '{"decibel": 85, "isLoud": true}'
```

**Buat Sensor Custom (contoh: sensor warna TCS3200):**
```bash
curl -X POST http://localhost:3000/api/monitoring/custom/user123/color-sensor \
  -H "Content-Type: application/json" \
  -d '{"red": 180, "green": 50, "blue": 220, "detectedColor": "purple"}'
```

**Ambil Data Sensor Custom Tertentu:**
```bash
curl http://localhost:3000/api/monitoring/custom/user123/uv-sensor
```

**Ambil SEMUA Sensor Custom:**
```bash
curl http://localhost:3000/api/monitoring/custom/user123
```

**Response (semua sensor custom):**
```json
{
  "userId": "user123",
  "totalSensors": 3,
  "sensors": [
    { "sensorName": "uv-sensor", "uvIndex": 7, "level": "High", "timestamp": "..." },
    { "sensorName": "sound-sensor", "decibel": 85, "isLoud": true, "timestamp": "..." },
    { "sensorName": "color-sensor", "red": 180, "green": 50, "blue": 220, "timestamp": "..." }
  ]
}
```

**Hapus Sensor Custom:**
```bash
curl -X DELETE http://localhost:3000/api/monitoring/custom/user123/uv-sensor
```

---

## 📋 STATUS - Status Gabungan

### Semua Data User
```bash
curl http://localhost:3000/api/status/all/user123
```

### Status Semua Device Kontrol
```bash
curl http://localhost:3000/api/status/control/user123
```

**Response:**
```json
{
  "userId": "user123",
  "category": "control",
  "devices": {
    "led": "ON",
    "servo": 90,
    "buzzer": "OFF",
    "relay": "ON",
    "rgb-led": { "r": 255, "g": 0, "b": 128 },
    "motor-dc": { "speed": 200, "direction": "CW" },
    "lcd": { "text": "Hello!", "line": 1 }
  }
}
```

### Status Semua Sensor Monitoring
```bash
curl http://localhost:3000/api/status/monitoring/user123
```

---

## 🔙 Legacy Routes (Backward Compatible)

Route lama masih bisa digunakan:

| Old Route | New Route |
|---|---|
| `POST /api/control-led/:userId` | `POST /api/control/led/:userId` |
| `POST /api/servo/:userId` | `POST /api/control/servo/:userId` |
| `POST /api/control-servo/:userId` | `POST /api/control/servo/:userId` |
| `POST /api/control-buzzer/:userId` | `POST /api/control/buzzer/:userId` |
| `POST /api/monitoring-dht/:userId` | `POST /api/monitoring/dht/:userId` |
| `GET /api/status/:userId` | `GET /api/status/all/:userId` |

---

## 💡 Ide Proyek IoT untuk Siswa

### Proyek Pemula
1. **Lampu Otomatis** - LDR + LED/Relay → Lampu nyala saat gelap
2. **Alarm Suhu** - DHT + Buzzer → Buzzer bunyi jika suhu > 35°C
3. **Pintu Otomatis** - Ultrasonic + Servo → Servo buka jika jarak < 10cm

### Proyek Menengah
4. **Smart Garden** - Soil Moisture + Relay (pompa) → Siram otomatis jika tanah kering
5. **Sistem Keamanan** - PIR + Buzzer + LED → Alarm jika ada gerakan
6. **Lampu RGB Mood** - LDR + RGB LED → Warna berubah sesuai cahaya

### Proyek Lanjutan
7. **Weather Station** - DHT + Rain + LDR → Monitoring cuaca lengkap (pakai custom sensor!)
8. **Smart Home Dashboard** - Semua kontrol + monitoring → Dashboard via /api/status/all
9. **Robot Mobil** - Motor DC + Ultrasonic + Servo → Robot obstacle avoidance
10. **Deteksi Gas & Evakuasi** - Gas Sensor + Buzzer + LCD + Servo (pintu) → Sistem evakuasi otomatis

---

## ⚠️ Error Responses

| Status | Keterangan |
|---|---|
| `400` | Parameter kurang/salah |
| `404` | Data tidak ditemukan |
| `500` | Error server/Firebase |

**Contoh Error:**
```json
{ "message": "userId dan status wajib diisi." }
```
```json
{ "message": "Status harus ON atau OFF." }
```
```json
{ "message": "Speed harus angka antara 0-255." }
```

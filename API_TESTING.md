# Dokumentasi Testing API Backend IoT

Dokumen ini berisi panduan test endpoint API yang saat ini terdaftar di server.

## 1. Persiapan

1. Buka terminal di folder project.
2. Install dependency:

```bash
npm install
```

3. Jalankan server:

```bash
node app.js
```

4. Pastikan server aktif di:

```text
http://localhost:3000
```

## 2. Konvensi Umum Request

- Header JSON untuk request body:

```http
Content-Type: application/json
```

- Base URL:

```text
http://localhost:3000
```

## 3. Daftar Endpoint

### 3.1 Health Check

#### GET /

Deskripsi: Cek apakah backend aktif.

Contoh curl:

```bash
curl -X GET http://localhost:3000/
```

Respon sukses:

```text
Backend IoT Edukasi siap!
```

---

### 3.2 Auth

#### POST /register

Deskripsi: Registrasi user baru ke Firestore.

Body:

```json
{
  "email": "user1@mail.com",
  "password": "123456",
  "name": "User Satu"
}
```

Contoh curl:

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user1@mail.com\",\"password\":\"123456\",\"name\":\"User Satu\"}"
```

Respon sukses (201):

```json
{
  "message": "Registrasi berhasil!",
  "userId": "abc123"
}
```

Kemungkinan error:

- 400: Field wajib kosong.
- 409: Email sudah terdaftar.
- 500: Error server.

#### POST /login

Deskripsi: Login user dan mendapatkan JWT.

Body:

```json
{
  "email": "user1@mail.com",
  "password": "123456"
}
```

Contoh curl:

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user1@mail.com\",\"password\":\"123456\"}"
```

Respon sukses (200):

```json
{
  "message": "Login berhasil.",
  "user": {
    "id": "abc123",
    "email": "user1@mail.com",
    "name": "User Satu",
    "roles": ["user"]
  },
  "token": "jwt-token"
}
```

Kemungkinan error:

- 400: Email/password kosong.
- 401: Password salah.
- 404: User tidak ditemukan.
- 500: Error server.

#### POST /verifyToken

Deskripsi: Verifikasi Firebase ID Token (bukan JWT login custom di endpoint /login).

Body:

```json
{
  "idToken": "firebase-id-token"
}
```

Contoh curl:

```bash
curl -X POST http://localhost:3000/verifyToken \
  -H "Content-Type: application/json" \
  -d "{\"idToken\":\"firebase-id-token\"}"
```

Respon sukses (200):

```json
{
  "message": "Token valid.",
  "uid": "firebase-uid",
  "email": "user1@mail.com"
}
```

Kemungkinan error:

- 400: idToken tidak dikirim.
- 401: Token tidak valid.

---

### 3.3 Kontrol LED

#### POST /api/control-led/{userId}

Deskripsi: Update status LED untuk user tertentu (userId ada di URL).

Body:

```json
{
  "status": "ON"
}
```

Contoh curl:

```bash
curl -X POST http://localhost:3000/api/control-led/user123 \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"ON\"}"
```

Respon sukses (200):

```json
{
  "message": "LED ON untuk fitur control-led milik user user123 berhasil diupdate."
}
```

#### GET /api/control-led/{userId}

Deskripsi: Ambil status LED untuk user tertentu.

Contoh:

```bash
curl -X GET http://localhost:3000/api/control-led/user123
```

Respon sukses (200):

```json
{
  "status": "ON"
}
```

---

### 3.4 Kontrol Servo

#### POST /api/servo/{userId}

Deskripsi: Update posisi servo (userId ada di URL).

Body:

```json
{
  "position": 90
}
```

Contoh curl:

```bash
curl -X POST http://localhost:3000/api/servo/user123 \
  -H "Content-Type: application/json" \
  -d "{\"position\":90}"
```

#### POST /api/control-servo/{userId}

Deskripsi: Alias berbasis nama fitur (konsisten dengan control-led/control-buzzer).

Body:

```json
{
  "position": 90
}
```

Contoh curl:

```bash
curl -X POST http://localhost:3000/api/control-servo/user123 \
  -H "Content-Type: application/json" \
  -d "{\"position\":90}"
```

#### GET /api/servo/{userId}

Deskripsi: Ambil posisi servo user dari path param.

Contoh:

```bash
curl -X GET http://localhost:3000/api/servo/user123
```

Respon sukses (200):

```json
{
  "position": 90
}
```

#### GET /api/control-servo/{userId}

Deskripsi: Alias GET berbasis nama fitur.

Contoh:

```bash
curl -X GET http://localhost:3000/api/control-servo/user123
```

---

### 3.5 Kontrol Buzzer

#### POST /api/control-buzzer/{userId}

Deskripsi: Update status buzzer (userId ada di URL).

Body:

```json
{
  "status": "OFF"
}
```

Contoh curl:

```bash
curl -X POST http://localhost:3000/api/control-buzzer/user123 \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"OFF\"}"
```

Respon sukses (200):

```json
{
  "message": "Buzzer di user user123 berhasil diupdate ke status OFF."
}
```

#### GET /api/control-buzzer/{userId}

Deskripsi: Ambil status buzzer (userId ada di URL).

Contoh:

```bash
curl -X GET http://localhost:3000/api/control-buzzer/user123
```

Respon sukses (200):

```json
{
  "status": "OFF"
}
```

---

### 3.6 Monitoring DHT (Suhu dan Kelembapan)

#### POST /api/monitoring-dht/{userId}

Deskripsi: Simpan data suhu dan kelembapan (userId ada di URL).

Body:

```json
{
  "suhu": 28.5,
  "kelembapan": 70
}
```

Contoh curl:

```bash
curl -X POST http://localhost:3000/api/monitoring-dht/user123 \
  -H "Content-Type: application/json" \
  -d "{\"suhu\":28.5,\"kelembapan\":70}"
```

Respon sukses (200):

```json
{
  "message": "Data DHT user user123 berhasil diupdate.",
  "suhu": 28.5,
  "kelembapan": 70
}
```

#### GET /api/monitoring-dht/{userId}

Deskripsi: Ambil data DHT (userId ada di URL).

Contoh:

```bash
curl -X GET http://localhost:3000/api/monitoring-dht/user123
```

Respon sukses (200):

```json
{
  "suhu": 28.5,
  "kelembapan": 70
}
```

---

### 3.7 Status Gabungan

#### GET /api/status/{userId}

Deskripsi: Ambil status gabungan LED, servo, dan buzzer.

Contoh:

```bash
curl -X GET http://localhost:3000/api/status/user123
```

Respon sukses (200):

```json
{
  "led": "ON",
  "servo": 90,
  "buzzer": "OFF"
}
```

---

### 3.8 Universal Device Control

Catatan: `deviceName` kamu tentukan sendiri dari URL. Contoh: `/api/universal/device/user123/pump` berarti `deviceName = pump`.

#### POST /api/universal/device/{userId}/{deviceName}

Deskripsi: Set value untuk device apa saja (userId dan deviceName ada di URL).

Body:

```json
{
  "value": "ON"
}
```

Contoh curl:

```bash
curl -X POST http://localhost:3000/api/universal/device/user123/pump \
  -H "Content-Type: application/json" \
  -d "{\"value\":\"ON\"}"
```

Respon sukses (200):

```json
{
  "message": "Device pump berhasil diupdate.",
  "userId": "user123",
  "deviceName": "pump",
  "value": "ON"
}
```

---

### 3.9 Custom Gabungan (Judul + Banyak Kontrol)

Gunanya: bikin “judul” custom (mis. `pump`) untuk menyimpan konfigurasi (LED/servo/buzzer/DHT + device lain) di path `custom/...`.

Catatan: Endpoint ini **hanya menyimpan** data custom dan **tidak mengubah** path lain seperti `control-led`, `control-servo`, `control-buzzer`, atau `monitoring-dht`. Untuk mengontrol device beneran, gunakan endpoint kontrol masing-masing.

#### POST /api/universal/custom/{userId}/{title}

Body (semua field opsional, kirim yang mau diubah saja):

```json
{
  "led": "ON",
  "servo": 90,
  "buzzer": "OFF",
  "suhu": 28.5,
  "kelembapan": 70,
  "devices": {
    "pump": "ON",
    "fan": "OFF"
  }
}
```

Contoh curl:

```bash
curl -X POST http://localhost:3000/api/universal/custom/user123/pump \
  -H "Content-Type: application/json" \
  -d "{\"led\":\"ON\",\"servo\":90,\"buzzer\":\"OFF\",\"suhu\":28.5,\"kelembapan\":70,\"devices\":{\"pump\":\"ON\",\"fan\":\"OFF\"}}"
```

Respon sukses (200):

```json
{
  "message": "Custom 'pump' berhasil di-apply.",
  "userId": "user123",
  "title": "pump"
}
```

#### GET /api/universal/custom/{userId}/{title}

Deskripsi: Ambil konfigurasi custom yang terakhir disimpan.

Contoh:

```bash
curl -X GET http://localhost:3000/api/universal/custom/user123/pump
```

#### GET /api/universal/device/{userId}/{deviceName}

Deskripsi: Ambil value device tertentu.

Contoh:

```bash
curl -X GET http://localhost:3000/api/universal/device/user123/pump
```

Respon sukses (200):

```json
{
  "userId": "user123",
  "deviceName": "pump",
  "value": "ON"
}
```

#### GET /api/universal/devices/{userId}

Deskripsi: Ambil semua data devices milik user.

Contoh:

```bash
curl -X GET http://localhost:3000/api/universal/devices/user123
```

Respon sukses (200):

```json
{
  "userId": "user123",
  "devices": {
    "control-led": { "led": "ON" },
    "control-servo": { "servo": 90 },
    "control-buzzer": { "buzzer": "OFF" },
    "monitoring-dht": { "suhu": 28.5, "kelembapan": 70 },
    "pump": { "value": "ON" }
  }
}
```

---

### 3.9 Project/Title Bebas (Key-Value Bebas)

Gunanya: user bikin `title` project bebas, lalu isi datanya bebas (mis. seperti di RTDB: `monitoring-ruangan/value/{co2, kelembapan, led, suhu}`).

#### POST /api/universal/project/{userId}/{title}

Body harus object (key-value). Key apapun boleh.

Contoh body (sesuai contoh struktur yang kamu mau):

```json
{
  "co2": 400,
  "kelembapan": 62,
  "led": "ON",
  "suhu": 27.8
}
```

Contoh curl:

```bash
curl -X POST http://localhost:3000/api/universal/project/user123/monitoring-ruangan \
  -H "Content-Type: application/json" \
  -d "{\"co2\":400,\"kelembapan\":62,\"led\":\"ON\",\"suhu\":27.8}"
```

Hasil di Realtime DB akan masuk ke:

```text
user123/monitoring-ruangan/value/co2
user123/monitoring-ruangan/value/kelembapan
user123/monitoring-ruangan/value/led
user123/monitoring-ruangan/value/suhu
```

#### GET /api/universal/project/{userId}/{title}

Contoh:

```bash
curl -X GET http://localhost:3000/api/universal/project/user123/monitoring-ruangan
```

## 4. Skenario Test End-to-End yang Disarankan

1. Cek server dengan GET /.
2. Register user baru dengan POST /register.
3. Login user dengan POST /login.
4. Uji set/get LED via `/api/control-led/{userId}`.
5. Uji set/get Servo via `/api/servo/{userId}` atau `/api/control-servo/{userId}`.
6. Uji set/get Buzzer via `/api/control-buzzer/{userId}`.
7. Uji set/get DHT via `/api/monitoring-dht/{userId}`.
8. Uji GET status gabungan via `/api/status/{userId}`.
9. Uji universal device POST dan GET via `/api/universal/device/{userId}/{deviceName}`.
10. Uji GET universal devices via `/api/universal/devices/{userId}`.

## 5. Catatan Penting

- Endpoint saat ini belum memakai middleware JWT untuk proteksi route, jadi testing endpoint IoT bisa langsung dipanggil.
- Endpoint /verifyToken memakai Firebase ID Token, berbeda dengan token hasil /login.
- Data tersimpan di Firebase Realtime Database, jadi nilai test terakhir akan menimpa nilai sebelumnya pada path yang sama.

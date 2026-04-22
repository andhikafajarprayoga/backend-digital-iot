const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

console.log('=== LOADING UNIVERSAL DEVICE CONTROL ROUTES ===');

// Middleware debug untuk universal routes
router.use((req, res, next) => {
  console.log(`=== UNIVERSAL MIDDLEWARE === ${req.method} ${req.path}`);
  console.log('Original URL:', req.originalUrl);
  console.log('Base URL:', req.baseUrl);
  next();
});

const isOnOff = (value) => value === 'ON' || value === 'OFF';

const isPlainObject = (value) => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

// Endpoint universal POST versi params (disarankan untuk device): /api/universal/device/:userId/:deviceName
router.post('/device/:userId/:deviceName', async (req, res) => {
  const { userId, deviceName } = req.params;
  const { value } = req.body;
  if (!userId || !deviceName || value === undefined) {
    return res.status(400).json({ message: 'userId, deviceName, dan value wajib diisi.' });
  }
  try {
    await admin.database().ref(`${userId}/${deviceName}/value`).set(value);
    res.status(200).json({
      message: `Device ${deviceName} berhasil diupdate.`,
      userId,
      deviceName,
      value
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update device.', error: error.message });
  }
});

// Endpoint project/title bebas (isi key apa aja) versi params:
// POST /api/universal/project/:userId/:title
// Body harus object, akan disimpan ke path: {userId}/{title}/value/{key}
router.post('/project/:userId/:title', async (req, res) => {
  const { userId, title } = req.params;
  const payload = req.body;

  if (!userId || !title) {
    return res.status(400).json({ message: 'userId dan title wajib diisi.' });
  }
  if (!isPlainObject(payload) || Object.keys(payload).length === 0) {
    return res.status(400).json({ message: 'Body harus object dan tidak boleh kosong.' });
  }

  try {
    const ref = admin.database().ref(`${userId}/${title}/value`);
    await ref.update(payload);
    res.status(200).json({ message: `Project '${title}' berhasil diupdate.`, userId, title });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update project.', error: error.message });
  }
});

// GET /api/universal/project/:userId/:title
router.get('/project/:userId/:title', async (req, res) => {
  const { userId, title } = req.params;
  if (!userId || !title) {
    return res.status(400).json({ message: 'userId dan title wajib diisi.' });
  }
  try {
    const snapshot = await admin.database().ref(`${userId}/${title}/value`).once('value');
    const value = snapshot.val();
    if (!value) {
      return res.status(404).json({ message: 'Project tidak ditemukan.' });
    }
    res.status(200).json({ userId, title, value });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil project.', error: error.message });
  }
});

// Endpoint custom gabungan (sekali request bisa set banyak kontrol) versi params:
// POST /api/universal/custom/:userId/:title
// Body contoh:
// {
//   "led": "ON",
//   "servo": 90,
//   "buzzer": "OFF",
//   "suhu": 28.5,
//   "kelembapan": 70,
//   "devices": { "pump": "ON", "fan": "OFF" }
// }
router.post('/custom/:userId/:title', async (req, res) => {
  const { userId, title } = req.params;
  const { led, servo, buzzer, suhu, kelembapan, devices } = req.body;

  if (!userId || !title) {
    return res.status(400).json({ message: 'userId dan title wajib diisi.' });
  }

  if (led !== undefined && !isOnOff(led)) {
    return res.status(400).json({ message: 'Field led harus ON atau OFF.' });
  }
  if (buzzer !== undefined && !isOnOff(buzzer)) {
    return res.status(400).json({ message: 'Field buzzer harus ON atau OFF.' });
  }
  if (servo !== undefined && (typeof servo !== 'number' || Number.isNaN(servo))) {
    return res.status(400).json({ message: 'Field servo harus number.' });
  }
  const hasAnyDhtField = suhu !== undefined || kelembapan !== undefined;
  if (hasAnyDhtField && (suhu === undefined || kelembapan === undefined)) {
    return res.status(400).json({ message: 'Jika mengirim DHT, suhu dan kelembapan wajib lengkap.' });
  }
  if (devices !== undefined && (typeof devices !== 'object' || devices === null || Array.isArray(devices))) {
    return res.status(400).json({ message: 'Field devices harus object (key-value).' });
  }

  // Simpan konfigurasi custom (judul) agar bisa dibaca ulang.
  // NOTE: Endpoint ini hanya menyimpan ke path custom dan tidak mengubah path lain.
  const customData = {
    title,
    led: led === undefined ? null : led,
    servo: servo === undefined ? null : servo,
    buzzer: buzzer === undefined ? null : buzzer,
    dht: hasAnyDhtField ? { suhu, kelembapan } : null,
    devices: devices || null,
    updatedAt: admin.database.ServerValue.TIMESTAMP,
  };

  try {
    await admin.database().ref(`${userId}/custom/${title}`).set(customData);
    res.status(200).json({ message: `Custom '${title}' berhasil disimpan.`, userId, title });
  } catch (error) {
    res.status(500).json({ message: 'Gagal simpan custom.', error: error.message });
  }
});

// GET /api/universal/custom/:userId/:title
router.get('/custom/:userId/:title', async (req, res) => {
  const { userId, title } = req.params;
  if (!userId || !title) {
    return res.status(400).json({ message: 'userId dan title wajib diisi.' });
  }
  try {
    const snapshot = await admin.database().ref(`${userId}/custom/${title}`).once('value');
    const data = snapshot.val();
    if (!data) {
      return res.status(404).json({ message: 'Custom tidak ditemukan.' });
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil custom.', error: error.message });
  }
});

// Endpoint universal GET versi params (disarankan untuk device): /api/universal/device/:userId/:deviceName
router.get('/device/:userId/:deviceName', async (req, res) => {
  const { userId, deviceName } = req.params;
  if (!userId || !deviceName) {
    return res.status(400).json({ message: 'userId dan deviceName wajib diisi.' });
  }
  try {
    const snapshot = await admin.database().ref(`${userId}/${deviceName}/value`).once('value');
    const value = snapshot.val();
    if (value === null || value === undefined) {
      return res.status(404).json({ message: 'Data tidak ditemukan.' });
    }
    res.status(200).json({ userId, deviceName, value });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data.', error: error.message });
  }
});

// Endpoint GET devices versi params (disarankan untuk device): /api/universal/devices/:userId
router.get('/devices/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'userId wajib diisi.' });
  }
  try {
    const snapshot = await admin.database().ref(`${userId}`).once('value');
    const data = snapshot.val();
    if (!data) {
      return res.status(404).json({ message: 'Data tidak ditemukan.' });
    }
    res.status(200).json({ userId, devices: data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data.', error: error.message });
  }
});

console.log('=== UNIVERSAL ROUTES REGISTERED ===');
module.exports = router;
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// GET /api/monitoring/soil-moisture - Info cara penggunaan endpoint Soil Moisture
router.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.status(200).json({
    sensor: 'soil-moisture',
    category: 'monitoring',
    description: 'Monitoring Soil Moisture — Kelembapan Tanah (0-100%)',
    usage: {
      post: {
        method: 'POST',
        path: '/api/monitoring/soil-moisture/{userId}',
        url: `${baseUrl}/api/monitoring/soil-moisture/{userId}`,
        description: 'Kirim data sensor soil moisture — ESP32 POST data ke database',
        body: { moisture: '0-100 (persen)' },
      },
      get: {
        method: 'GET',
        path: '/api/monitoring/soil-moisture/{userId}',
        url: `${baseUrl}/api/monitoring/soil-moisture/{userId}`,
        description: 'Ambil data soil moisture terkini dari database — untuk UI tampilkan',
      },
    },
    for_esp32: {
      description: 'ESP32 POST data sensor ke endpoint ini secara berkala',
      url: `${baseUrl}/api/monitoring/soil-moisture/{userId}`,
      method: 'POST',
      body: { moisture: 45 },
    },
    for_ui: {
      description: 'UI GET endpoint ini untuk tampilkan data sensor terkini',
      get_url: `${baseUrl}/api/monitoring/soil-moisture/{userId}`,
    },
  });
});

// POST /api/monitoring/soil-moisture/:userId - Kirim data kelembapan tanah
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { moisture } = req.body;
  if (!userId || moisture === undefined) {
    return res.status(400).json({ message: 'userId dan moisture wajib diisi.' });
  }
  const val = Number(moisture);
  if (isNaN(val) || val < 0 || val > 100) {
    return res.status(400).json({ message: 'Moisture harus angka antara 0-100 (persen).' });
  }
  try {
    const data = { moisture: val, unit: '%', timestamp: new Date().toISOString() };
    await admin.database().ref(`${userId}/monitoring/soil-moisture`).set(data);
    res.status(200).json({ message: 'Data soil moisture berhasil diupdate.', userId, sensor: 'soil-moisture', ...data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update soil moisture.', error: error.message });
  }
});

// GET /api/monitoring/soil-moisture/:userId - Ambil data kelembapan tanah
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'userId wajib diisi.' });
  try {
    const snapshot = await admin.database().ref(`${userId}/monitoring/soil-moisture`).once('value');
    const data = snapshot.val();
    if (!data) return res.status(404).json({ message: 'Data soil moisture tidak ditemukan.' });
    res.status(200).json({ userId, sensor: 'soil-moisture', ...data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data soil moisture.', error: error.message });
  }
});

module.exports = router;

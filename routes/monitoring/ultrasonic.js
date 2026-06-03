const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// GET /api/monitoring/ultrasonic - Info cara penggunaan endpoint Ultrasonic
router.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.status(200).json({
    sensor: 'ultrasonic',
    category: 'monitoring',
    description: 'Monitoring Ultrasonic — Jarak (cm)',
    usage: {
      post: {
        method: 'POST',
        path: '/api/monitoring/ultrasonic/{userId}',
        url: `${baseUrl}/api/monitoring/ultrasonic/{userId}`,
        description: 'Kirim data sensor ultrasonic — ESP32 POST data ke database',
        body: { distance: 'number (cm)' },
      },
      get: {
        method: 'GET',
        path: '/api/monitoring/ultrasonic/{userId}',
        url: `${baseUrl}/api/monitoring/ultrasonic/{userId}`,
        description: 'Ambil data ultrasonic terkini dari database — untuk UI tampilkan',
      },
    },
    for_esp32: {
      description: 'ESP32 POST data sensor ke endpoint ini secara berkala',
      url: `${baseUrl}/api/monitoring/ultrasonic/{userId}`,
      method: 'POST',
      body: { distance: 25.4 },
    },
    for_ui: {
      description: 'UI GET endpoint ini untuk tampilkan data sensor terkini',
      get_url: `${baseUrl}/api/monitoring/ultrasonic/{userId}`,
    },
  });
});

// POST /api/monitoring/ultrasonic/:userId - Kirim data ultrasonic (jarak)
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { distance } = req.body;
  if (!userId || distance === undefined) {
    return res.status(400).json({ message: 'userId dan distance wajib diisi.' });
  }
  const val = Number(distance);
  if (isNaN(val) || val < 0) {
    return res.status(400).json({ message: 'Distance harus angka positif (dalam cm).' });
  }
  try {
    const data = { distance: val, unit: 'cm', timestamp: new Date().toISOString() };
    await admin.database().ref(`${userId}/monitoring/ultrasonic`).set(data);
    res.status(200).json({ message: 'Data ultrasonic berhasil diupdate.', userId, sensor: 'ultrasonic', ...data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update ultrasonic.', error: error.message });
  }
});

// GET /api/monitoring/ultrasonic/:userId - Ambil data ultrasonic
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'userId wajib diisi.' });
  try {
    const snapshot = await admin.database().ref(`${userId}/monitoring/ultrasonic`).once('value');
    const data = snapshot.val();
    if (!data) return res.status(404).json({ message: 'Data ultrasonic tidak ditemukan.' });
    res.status(200).json({ userId, sensor: 'ultrasonic', ...data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data ultrasonic.', error: error.message });
  }
});

module.exports = router;

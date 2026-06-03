const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// GET /api/monitoring/ldr - Info cara penggunaan endpoint LDR
router.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.status(200).json({
    sensor: 'ldr',
    category: 'monitoring',
    description: 'Monitoring LDR — Intensitas Cahaya (0-1023)',
    usage: {
      post: {
        method: 'POST',
        path: '/api/monitoring/ldr/{userId}',
        url: `${baseUrl}/api/monitoring/ldr/{userId}`,
        description: 'Kirim data sensor LDR — ESP32 POST data ke database',
        body: { intensity: '0-1023' },
      },
      get: {
        method: 'GET',
        path: '/api/monitoring/ldr/{userId}',
        url: `${baseUrl}/api/monitoring/ldr/{userId}`,
        description: 'Ambil data LDR terkini dari database — untuk UI tampilkan',
      },
    },
    for_esp32: {
      description: 'ESP32 POST data sensor ke endpoint ini secara berkala',
      url: `${baseUrl}/api/monitoring/ldr/{userId}`,
      method: 'POST',
      body: { intensity: 750 },
    },
    for_ui: {
      description: 'UI GET endpoint ini untuk tampilkan data sensor terkini',
      get_url: `${baseUrl}/api/monitoring/ldr/{userId}`,
    },
  });
});

// POST /api/monitoring/ldr/:userId - Kirim data LDR (cahaya)
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { intensity } = req.body;
  if (!userId || intensity === undefined) {
    return res.status(400).json({ message: 'userId dan intensity wajib diisi.' });
  }
  const val = Number(intensity);
  if (isNaN(val) || val < 0 || val > 1023) {
    return res.status(400).json({ message: 'Intensity harus angka antara 0-1023.' });
  }
  try {
    const data = { intensity: val, timestamp: new Date().toISOString() };
    await admin.database().ref(`${userId}/monitoring/ldr`).set(data);
    res.status(200).json({ message: 'Data LDR berhasil diupdate.', userId, sensor: 'ldr', ...data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update LDR.', error: error.message });
  }
});

// GET /api/monitoring/ldr/:userId - Ambil data LDR
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'userId wajib diisi.' });
  try {
    const snapshot = await admin.database().ref(`${userId}/monitoring/ldr`).once('value');
    const data = snapshot.val();
    if (!data) return res.status(404).json({ message: 'Data LDR tidak ditemukan.' });
    res.status(200).json({ userId, sensor: 'ldr', ...data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data LDR.', error: error.message });
  }
});

module.exports = router;

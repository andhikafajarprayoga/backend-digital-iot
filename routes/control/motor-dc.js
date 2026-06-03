const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const isValidSpeed = (speed) => { const s = Number(speed); return !isNaN(s) && s >= 0 && s <= 255; };
const isValidDirection = (dir) => dir === 'CW' || dir === 'CCW';

// GET /api/control/motor-dc - Info cara penggunaan endpoint Motor DC
router.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.status(200).json({
    device: 'motor-dc',
    category: 'control',
    description: 'Kontrol Motor DC (speed + direction)',
    usage: {
      post: {
        method: 'POST',
        path: '/api/control/motor-dc/{userId}',
        url: `${baseUrl}/api/control/motor-dc/{userId}`,
        description: 'Set speed & direction motor — UI kirim perintah, ESP32 baca nanti',
        body: { speed: '0-255', direction: 'CW | CCW' },
      },
      get: {
        method: 'GET',
        path: '/api/control/motor-dc/{userId}',
        url: `${baseUrl}/api/control/motor-dc/{userId}`,
        description: 'Ambil status motor DC terkini dari database',
      },
    },
    for_esp32: {
      description: 'ESP32 polling GET endpoint ini setiap 1-5 detik untuk baca perintah terbaru',
      url: `${baseUrl}/api/control/motor-dc/{userId}`,
      method: 'GET',
    },
    for_ui: {
      description: 'UI POST untuk kirim perintah speed/direction, GET untuk tampilkan status terkini',
      post_url: `${baseUrl}/api/control/motor-dc/{userId}`,
      get_url: `${baseUrl}/api/control/motor-dc/{userId}`,
    },
  });
});

// POST /api/control/motor-dc/:userId - Set motor DC speed & direction
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { speed, direction } = req.body;
  if (!userId || speed === undefined || !direction) {
    return res.status(400).json({ message: 'userId, speed, dan direction wajib diisi.' });
  }
  if (!isValidSpeed(speed)) return res.status(400).json({ message: 'Speed harus angka antara 0-255.' });
  if (!isValidDirection(direction)) return res.status(400).json({ message: 'Direction harus CW atau CCW.' });
  try {
    const motorData = { speed: Number(speed), direction };
    await admin.database().ref(`${userId}/control/motor-dc`).set(motorData);
    res.status(200).json({ message: 'Motor DC berhasil diupdate.', userId, device: 'motor-dc', ...motorData });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update motor DC.', error: error.message });
  }
});

// GET /api/control/motor-dc/:userId - Get motor DC status
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'userId wajib diisi.' });
  try {
    const snapshot = await admin.database().ref(`${userId}/control/motor-dc`).once('value');
    const data = snapshot.val();
    if (!data) return res.status(404).json({ message: 'Data motor DC tidak ditemukan.' });
    res.status(200).json({ userId, device: 'motor-dc', ...data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data motor DC.', error: error.message });
  }
});

module.exports = router;

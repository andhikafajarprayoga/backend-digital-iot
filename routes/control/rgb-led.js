const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const isValidColor = (value) => {
  const num = Number(value);
  return !isNaN(num) && num >= 0 && num <= 255;
};

// GET /api/control/rgb-led - Info cara penggunaan endpoint RGB LED
router.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.status(200).json({
    device: 'rgb-led',
    category: 'control',
    description: 'Kontrol RGB LED (warna custom r, g, b: 0-255)',
    usage: {
      post: {
        method: 'POST',
        path: '/api/control/rgb-led/{userId}',
        url: `${baseUrl}/api/control/rgb-led/{userId}`,
        description: 'Set warna RGB LED — UI kirim perintah, ESP32 baca nanti',
        body: { r: '0-255', g: '0-255', b: '0-255' },
      },
      get: {
        method: 'GET',
        path: '/api/control/rgb-led/{userId}',
        url: `${baseUrl}/api/control/rgb-led/{userId}`,
        description: 'Ambil warna RGB LED terkini dari database',
      },
    },
    for_esp32: {
      description: 'ESP32 polling GET endpoint ini setiap 1-5 detik untuk baca warna terbaru',
      url: `${baseUrl}/api/control/rgb-led/{userId}`,
      method: 'GET',
    },
    for_ui: {
      description: 'UI POST untuk kirim warna, GET untuk tampilkan warna terkini',
      post_url: `${baseUrl}/api/control/rgb-led/{userId}`,
      get_url: `${baseUrl}/api/control/rgb-led/{userId}`,
    },
  });
});

// POST /api/control/rgb-led/:userId - Set RGB LED color
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { r, g, b } = req.body;
  if (!userId || r === undefined || g === undefined || b === undefined) {
    return res.status(400).json({ message: 'userId, r, g, dan b wajib diisi.' });
  }
  if (!isValidColor(r) || !isValidColor(g) || !isValidColor(b)) {
    return res.status(400).json({ message: 'Nilai r, g, b harus angka antara 0-255.' });
  }
  try {
    const colorData = { r: Number(r), g: Number(g), b: Number(b) };
    await admin.database().ref(`${userId}/control/rgb-led`).set(colorData);
    res.status(200).json({ message: 'RGB LED berhasil diupdate.', userId, device: 'rgb-led', color: colorData });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update RGB LED.', error: error.message });
  }
});

// GET /api/control/rgb-led/:userId - Get RGB LED color
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'userId wajib diisi.' });
  try {
    const snapshot = await admin.database().ref(`${userId}/control/rgb-led`).once('value');
    const color = snapshot.val();
    if (color === null) return res.status(404).json({ message: 'Data RGB LED tidak ditemukan.' });
    res.status(200).json({ userId, device: 'rgb-led', color });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data RGB LED.', error: error.message });
  }
});

module.exports = router;

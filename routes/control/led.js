const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const isValidStatus = (status) => status === 'ON' || status === 'OFF';

// GET /api/control/led - Info cara penggunaan endpoint LED
router.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.status(200).json({
    device: 'led',
    category: 'control',
    description: 'Kontrol LED (ON/OFF)',
    usage: {
      post: {
        method: 'POST',
        path: '/api/control/led/{userId}',
        url: `${baseUrl}/api/control/led/{userId}`,
        description: 'Set status LED — UI kirim perintah, ESP32 baca nanti',
        body: { status: 'ON | OFF' },
      },
      get: {
        method: 'GET',
        path: '/api/control/led/{userId}',
        url: `${baseUrl}/api/control/led/{userId}`,
        description: 'Ambil status LED terkini dari database',
      },
    },
    for_esp32: {
      description: 'ESP32 polling GET endpoint ini setiap 1-5 detik untuk baca perintah terbaru',
      url: `${baseUrl}/api/control/led/{userId}`,
      method: 'GET',
    },
    for_ui: {
      description: 'UI POST untuk kirim perintah, GET untuk tampilkan status terkini',
      post_url: `${baseUrl}/api/control/led/{userId}`,
      get_url: `${baseUrl}/api/control/led/{userId}`,
    },
  });
});

// POST /api/control/led/:userId - Set LED status (ON/OFF)
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;
  if (!userId || !status) {
    return res.status(400).json({ message: 'userId dan status wajib diisi.' });
  }
  if (!isValidStatus(status)) {
    return res.status(400).json({ message: 'Status harus ON atau OFF.' });
  }
  try {
    await admin.database().ref(`${userId}/control-led/led`).set(status);
    res.status(200).json({
      message: `LED berhasil diupdate ke ${status}.`,
      userId,
      device: 'led',
      status
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update LED.', error: error.message });
  }
});

// GET /api/control/led/:userId - Get LED status
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'userId wajib diisi.' });
  }
  try {
    const snapshot = await admin.database().ref(`${userId}/control-led/led`).once('value');
    const status = snapshot.val();
    if (status === null) {
      return res.status(404).json({ message: 'Data LED tidak ditemukan.' });
    }
    res.status(200).json({ userId, device: 'led', status });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data LED.', error: error.message });
  }
});

module.exports = router;

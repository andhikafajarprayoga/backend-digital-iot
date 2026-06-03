const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const isValidStatus = (status) => status === 'ON' || status === 'OFF';

// GET /api/control/buzzer - Info cara penggunaan endpoint Buzzer
router.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.status(200).json({
    device: 'buzzer',
    category: 'control',
    description: 'Kontrol Buzzer (ON/OFF)',
    usage: {
      post: {
        method: 'POST',
        path: '/api/control/buzzer/{userId}',
        url: `${baseUrl}/api/control/buzzer/{userId}`,
        description: 'Set status buzzer — UI kirim perintah, ESP32 baca nanti',
        body: { status: 'ON | OFF' },
      },
      get: {
        method: 'GET',
        path: '/api/control/buzzer/{userId}',
        url: `${baseUrl}/api/control/buzzer/{userId}`,
        description: 'Ambil status buzzer terkini dari database',
      },
    },
    for_esp32: {
      description: 'ESP32 polling GET endpoint ini setiap 1-5 detik untuk baca perintah terbaru',
      url: `${baseUrl}/api/control/buzzer/{userId}`,
      method: 'GET',
    },
    for_ui: {
      description: 'UI POST untuk kirim perintah, GET untuk tampilkan status terkini',
      post_url: `${baseUrl}/api/control/buzzer/{userId}`,
      get_url: `${baseUrl}/api/control/buzzer/{userId}`,
    },
  });
});

// POST /api/control/buzzer/:userId - Set buzzer status (ON/OFF)
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
    await admin.database().ref(`${userId}/control-buzzer/buzzer`).set(status);
    res.status(200).json({
      message: `Buzzer berhasil diupdate ke ${status}.`,
      userId,
      device: 'buzzer',
      status
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update buzzer.', error: error.message });
  }
});

// GET /api/control/buzzer/:userId - Get buzzer status
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'userId wajib diisi.' });
  }
  try {
    const snapshot = await admin.database().ref(`${userId}/control-buzzer/buzzer`).once('value');
    const status = snapshot.val();
    if (status === null) {
      return res.status(404).json({ message: 'Data buzzer tidak ditemukan.' });
    }
    res.status(200).json({ userId, device: 'buzzer', status });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data buzzer.', error: error.message });
  }
});

module.exports = router;

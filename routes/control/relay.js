const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const isValidStatus = (status) => status === 'ON' || status === 'OFF';

// GET /api/control/relay - Info cara penggunaan endpoint Relay
router.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.status(200).json({
    device: 'relay',
    category: 'control',
    description: 'Kontrol Relay (ON/OFF) — untuk perangkat listrik AC (lampu, kipas, pompa air)',
    usage: {
      post: {
        method: 'POST',
        path: '/api/control/relay/{userId}',
        url: `${baseUrl}/api/control/relay/{userId}`,
        description: 'Set status relay — UI kirim perintah, ESP32 baca nanti',
        body: { status: 'ON | OFF' },
      },
      get: {
        method: 'GET',
        path: '/api/control/relay/{userId}',
        url: `${baseUrl}/api/control/relay/{userId}`,
        description: 'Ambil status relay terkini dari database',
      },
    },
    for_esp32: {
      description: 'ESP32 polling GET endpoint ini setiap 1-5 detik untuk baca perintah terbaru',
      url: `${baseUrl}/api/control/relay/{userId}`,
      method: 'GET',
    },
    for_ui: {
      description: 'UI POST untuk kirim perintah, GET untuk tampilkan status terkini',
      post_url: `${baseUrl}/api/control/relay/{userId}`,
      get_url: `${baseUrl}/api/control/relay/{userId}`,
    },
  });
});

// POST /api/control/relay/:userId - Set relay status (ON/OFF)
// Relay digunakan untuk mengontrol perangkat listrik AC (lampu, kipas, pompa air, dll)
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
    await admin.database().ref(`${userId}/control/relay`).set(status);
    res.status(200).json({
      message: `Relay berhasil diupdate ke ${status}.`,
      userId,
      device: 'relay',
      status
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update relay.', error: error.message });
  }
});

// GET /api/control/relay/:userId - Get relay status
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'userId wajib diisi.' });
  }
  try {
    const snapshot = await admin.database().ref(`${userId}/control/relay`).once('value');
    const status = snapshot.val();
    if (status === null) {
      return res.status(404).json({ message: 'Data relay tidak ditemukan.' });
    }
    res.status(200).json({ userId, device: 'relay', status });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data relay.', error: error.message });
  }
});

module.exports = router;

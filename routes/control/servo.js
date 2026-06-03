const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const getServoRef = (userId) => admin.database().ref(`${userId}/control-servo/servo`);

const isValidPosition = (position) => {
  const pos = Number(position);
  return !isNaN(pos) && pos >= 0 && pos <= 180;
};

// GET /api/control/servo - Info cara penggunaan endpoint Servo
router.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.status(200).json({
    device: 'servo',
    category: 'control',
    description: 'Kontrol Servo Motor (0-180 derajat)',
    usage: {
      post: {
        method: 'POST',
        path: '/api/control/servo/{userId}',
        url: `${baseUrl}/api/control/servo/{userId}`,
        description: 'Set posisi servo — UI kirim perintah, ESP32 baca nanti',
        body: { position: '0-180 (derajat)' },
      },
      get: {
        method: 'GET',
        path: '/api/control/servo/{userId}',
        url: `${baseUrl}/api/control/servo/{userId}`,
        description: 'Ambil posisi servo terkini dari database',
      },
    },
    for_esp32: {
      description: 'ESP32 polling GET endpoint ini setiap 1-5 detik untuk baca posisi terbaru',
      url: `${baseUrl}/api/control/servo/{userId}`,
      method: 'GET',
    },
    for_ui: {
      description: 'UI POST untuk kirim perintah posisi, GET untuk tampilkan posisi terkini',
      post_url: `${baseUrl}/api/control/servo/{userId}`,
      get_url: `${baseUrl}/api/control/servo/{userId}`,
    },
  });
});

// POST /api/control/servo/:userId - Set servo position (0-180)
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { position } = req.body;
  if (position === undefined || !userId) {
    return res.status(400).json({ message: 'userId dan position wajib diisi.' });
  }
  if (!isValidPosition(position)) {
    return res.status(400).json({ message: 'Position harus angka antara 0-180.' });
  }
  try {
    await getServoRef(userId).set(Number(position));
    res.status(200).json({
      message: `Servo berhasil diupdate ke posisi ${position}.`,
      userId,
      device: 'servo',
      position: Number(position)
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update servo.', error: error.message });
  }
});

// GET /api/control/servo/:userId - Get servo position
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'userId wajib diisi.' });
  }
  try {
    const snapshot = await getServoRef(userId).once('value');
    const position = snapshot.val();
    if (position === null) {
      return res.status(404).json({ message: 'Data servo tidak ditemukan.' });
    }
    res.status(200).json({ userId, device: 'servo', position });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data servo.', error: error.message });
  }
});

module.exports = router;

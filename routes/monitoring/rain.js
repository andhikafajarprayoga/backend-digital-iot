const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// POST /api/monitoring/rain/:userId - Kirim data rain sensor
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { rainLevel } = req.body;
  if (!userId || rainLevel === undefined) {
    return res.status(400).json({ message: 'userId dan rainLevel wajib diisi.' });
  }
  const val = Number(rainLevel);
  if (isNaN(val) || val < 0 || val > 1023) {
    return res.status(400).json({ message: 'rainLevel harus angka antara 0-1023.' });
  }
  try {
    const data = {
      rainLevel: val,
      isRaining: val < 500,
      timestamp: new Date().toISOString()
    };
    await admin.database().ref(`${userId}/monitoring/rain`).set(data);
    res.status(200).json({ message: 'Data rain sensor berhasil diupdate.', userId, sensor: 'rain', ...data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update rain sensor.', error: error.message });
  }
});

// GET /api/monitoring/rain/:userId - Ambil data rain sensor
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'userId wajib diisi.' });
  try {
    const snapshot = await admin.database().ref(`${userId}/monitoring/rain`).once('value');
    const data = snapshot.val();
    if (!data) return res.status(404).json({ message: 'Data rain sensor tidak ditemukan.' });
    res.status(200).json({ userId, sensor: 'rain', ...data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data rain sensor.', error: error.message });
  }
});

module.exports = router;

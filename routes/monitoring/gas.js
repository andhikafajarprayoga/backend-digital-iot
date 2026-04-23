const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// POST /api/monitoring/gas/:userId - Kirim data gas sensor (MQ-2/MQ-135)
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { gasLevel, detected } = req.body;
  if (!userId || gasLevel === undefined) {
    return res.status(400).json({ message: 'userId dan gasLevel wajib diisi.' });
  }
  try {
    const data = {
      gasLevel: Number(gasLevel),
      detected: detected !== undefined ? Boolean(detected) : Number(gasLevel) > 400,
      timestamp: new Date().toISOString()
    };
    await admin.database().ref(`${userId}/monitoring/gas`).set(data);
    res.status(200).json({ message: 'Data gas sensor berhasil diupdate.', userId, sensor: 'gas', ...data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update gas sensor.', error: error.message });
  }
});

// GET /api/monitoring/gas/:userId - Ambil data gas sensor
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'userId wajib diisi.' });
  try {
    const snapshot = await admin.database().ref(`${userId}/monitoring/gas`).once('value');
    const data = snapshot.val();
    if (!data) return res.status(404).json({ message: 'Data gas sensor tidak ditemukan.' });
    res.status(200).json({ userId, sensor: 'gas', ...data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data gas sensor.', error: error.message });
  }
});

module.exports = router;

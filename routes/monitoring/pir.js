const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// POST /api/monitoring/pir/:userId - Kirim data PIR motion sensor
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { motion } = req.body;
  if (!userId || motion === undefined) {
    return res.status(400).json({ message: 'userId dan motion wajib diisi.' });
  }
  try {
    const data = {
      motion: Boolean(motion),
      lastDetected: Boolean(motion) ? new Date().toISOString() : null,
      timestamp: new Date().toISOString()
    };
    await admin.database().ref(`${userId}/monitoring/pir`).set(data);
    res.status(200).json({ message: 'Data PIR berhasil diupdate.', userId, sensor: 'pir', ...data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update PIR.', error: error.message });
  }
});

// GET /api/monitoring/pir/:userId - Ambil data PIR
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'userId wajib diisi.' });
  try {
    const snapshot = await admin.database().ref(`${userId}/monitoring/pir`).once('value');
    const data = snapshot.val();
    if (!data) return res.status(404).json({ message: 'Data PIR tidak ditemukan.' });
    res.status(200).json({ userId, sensor: 'pir', ...data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data PIR.', error: error.message });
  }
});

module.exports = router;

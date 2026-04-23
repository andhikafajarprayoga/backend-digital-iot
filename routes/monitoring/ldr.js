const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

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

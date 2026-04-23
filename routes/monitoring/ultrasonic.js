const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// POST /api/monitoring/ultrasonic/:userId - Kirim data ultrasonic (jarak)
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { distance } = req.body;
  if (!userId || distance === undefined) {
    return res.status(400).json({ message: 'userId dan distance wajib diisi.' });
  }
  const val = Number(distance);
  if (isNaN(val) || val < 0) {
    return res.status(400).json({ message: 'Distance harus angka positif (dalam cm).' });
  }
  try {
    const data = { distance: val, unit: 'cm', timestamp: new Date().toISOString() };
    await admin.database().ref(`${userId}/monitoring/ultrasonic`).set(data);
    res.status(200).json({ message: 'Data ultrasonic berhasil diupdate.', userId, sensor: 'ultrasonic', ...data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update ultrasonic.', error: error.message });
  }
});

// GET /api/monitoring/ultrasonic/:userId - Ambil data ultrasonic
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'userId wajib diisi.' });
  try {
    const snapshot = await admin.database().ref(`${userId}/monitoring/ultrasonic`).once('value');
    const data = snapshot.val();
    if (!data) return res.status(404).json({ message: 'Data ultrasonic tidak ditemukan.' });
    res.status(200).json({ userId, sensor: 'ultrasonic', ...data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data ultrasonic.', error: error.message });
  }
});

module.exports = router;

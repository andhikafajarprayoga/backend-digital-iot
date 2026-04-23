const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// POST /api/monitoring/dht/:userId - Kirim data DHT (suhu & kelembapan)
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { temperature, humidity } = req.body;
  if (!userId || temperature === undefined || humidity === undefined) {
    return res.status(400).json({ message: 'userId, temperature, dan humidity wajib diisi.' });
  }
  try {
    const data = { temperature: Number(temperature), humidity: Number(humidity), timestamp: new Date().toISOString() };
    await admin.database().ref(`${userId}/monitoring-dht`).set(data);
    res.status(200).json({ message: 'Data DHT berhasil diupdate.', userId, sensor: 'dht', ...data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update DHT.', error: error.message });
  }
});

// GET /api/monitoring/dht/:userId - Ambil data DHT
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'userId wajib diisi.' });
  try {
    const snapshot = await admin.database().ref(`${userId}/monitoring-dht`).once('value');
    const data = snapshot.val();
    if (!data) return res.status(404).json({ message: 'Data DHT tidak ditemukan.' });
    res.status(200).json({ userId, sensor: 'dht', ...data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data DHT.', error: error.message });
  }
});

module.exports = router;

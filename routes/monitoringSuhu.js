const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Endpoint versi params (disarankan untuk device): /api/monitoring-dht/:userId
router.post('/monitoring-dht/:userId', async (req, res) => {
  const { userId } = req.params;
  const { suhu, kelembapan } = req.body;
  if (!userId || suhu === undefined || kelembapan === undefined) {
    return res.status(400).json({ message: 'userId, suhu, dan kelembapan wajib diisi.' });
  }
  try {
    await admin.database().ref(`${userId}/monitoring-dht`).set({ suhu, kelembapan });
    res.status(200).json({ message: `Data DHT user ${userId} berhasil diupdate.`, suhu, kelembapan });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update DHT.', error: error.message });
  }
});

// Endpoint GET versi params (disarankan untuk device): /api/monitoring-dht/:userId
router.get('/monitoring-dht/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'userId wajib diisi.' });
  }
  try {
    const snapshot = await admin.database().ref(`${userId}/monitoring-dht`).once('value');
    const data = snapshot.val();
    if (!data) {
      return res.status(404).json({ message: 'Data tidak ditemukan.' });
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data.', error: error.message });
  }
});

module.exports = router;

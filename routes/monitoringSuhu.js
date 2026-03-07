const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Endpoint POST untuk update suhu
// Endpoint POST untuk update suhu dan kelembapan
router.post('/dht', async (req, res) => {
  const { suhu, kelembapan, userId } = req.body;
  if (suhu === undefined || kelembapan === undefined || !userId) {
    return res.status(400).json({ message: 'Suhu, kelembapan, dan userId wajib diisi.' });
  }
  try {
    await admin.database().ref(`${userId}/monitoring-dht`).set({ suhu, kelembapan });
    res.status(200).json({ message: `Data DHT user ${userId} berhasil diupdate.`, suhu, kelembapan });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update DHT.', error: error.message });
  }
});

// Endpoint GET untuk baca suhu
// Endpoint GET untuk baca suhu dan kelembapan
router.get('/dht', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ message: 'userId wajib diisi.' });
  }
  try {
    const ref = admin.database().ref(`${userId}/monitoring-dht`);
    const snapshot = await ref.once('value');
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

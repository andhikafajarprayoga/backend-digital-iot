const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Endpoint LED ON/OFF
router.post('/led', async (req, res) => {
  const { status, featureId, userId } = req.body;
  if (!status || !featureId || !userId) {
    return res.status(400).json({ message: 'Status, featureId, dan userId wajib diisi.' });
  }
  if (status !== 'ON' && status !== 'OFF') {
    return res.status(400).json({ message: 'Status harus ON atau OFF.' });
  }
  try {
    // Update status LED di Realtime Database dengan path unik
    await admin.database().ref(`${userId}/${featureId}/led`).set(status);
    res.status(200).json({ message: `LED ${status} untuk fitur ${featureId} milik user ${userId} berhasil diupdate.` });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update LED.', error: error.message });
  }
});

module.exports = router;


// Endpoint GET status fitur (misal LED)
router.get('/:userId/:feature', async (req, res) => {
  const { userId, feature } = req.params;
  try {
    // Ambil status dari Realtime Database
    const ref = admin.database().ref(`${userId}/${feature}/led`);
    const snapshot = await ref.once('value');
    const status = snapshot.val();
    if (status === null) {
      return res.status(404).json({ message: 'Data tidak ditemukan.' });
    }
    res.status(200).json({ status });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data.', error: error.message });
  }
});

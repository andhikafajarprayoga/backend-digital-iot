const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Endpoint kontrol buzzer (POST)
router.post('/buzzer', async (req, res) => {
  const { status, userId } = req.body;
  if (!status || !userId) {
    return res.status(400).json({ message: 'Status dan userId wajib diisi.' });
  }
  if (status !== 'ON' && status !== 'OFF') {
    return res.status(400).json({ message: 'Status harus ON atau OFF.' });
  }
  try {
    // Update status buzzer di Realtime Database dengan turunan
    await admin.database().ref(`${userId}/control-buzzer/buzzer`).set(status);
    res.status(200).json({ message: `Buzzer di user ${userId} berhasil diupdate ke status ${status}.` });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update buzzer.', error: error.message });
  }
});

module.exports = router;

// Endpoint GET status buzzer via query parameter (debug)
router.get('/buzzer', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ message: 'userId wajib diisi.' });
  }
  try {
    const ref = admin.database().ref(`${userId}/control-buzzer/buzzer`);
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

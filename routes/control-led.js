const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const isValidLedStatus = (status) => status === 'ON' || status === 'OFF';

// Endpoint versi params (disarankan untuk device): /api/control-led/:userId
router.post('/control-led/:userId', async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;
  if (!userId || !status) {
    return res.status(400).json({ message: 'userId dan status wajib diisi.' });
  }
  if (!isValidLedStatus(status)) {
    return res.status(400).json({ message: 'Status harus ON atau OFF.' });
  }
  try {
    await admin.database().ref(`${userId}/control-led/led`).set(status);
    res.status(200).json({ message: `LED ${status} untuk fitur control-led milik user ${userId} berhasil diupdate.` });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update LED.', error: error.message });
  }
});

// Endpoint GET versi params (disarankan untuk device): /api/control-led/:userId
router.get('/control-led/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'userId wajib diisi.' });
  }
  try {
    const snapshot = await admin.database().ref(`${userId}/control-led/led`).once('value');
    const status = snapshot.val();
    if (status === null) {
      return res.status(404).json({ message: 'Data tidak ditemukan.' });
    }
    res.status(200).json({ status });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data.', error: error.message });
  }
});

module.exports = router;

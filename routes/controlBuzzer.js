const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const isValidBuzzerStatus = (status) => status === 'ON' || status === 'OFF';

// Endpoint versi params (disarankan untuk device): /api/control-buzzer/:userId
router.post('/control-buzzer/:userId', async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;
  if (!userId || !status) {
    return res.status(400).json({ message: 'userId dan status wajib diisi.' });
  }
  if (!isValidBuzzerStatus(status)) {
    return res.status(400).json({ message: 'Status harus ON atau OFF.' });
  }
  try {
    await admin.database().ref(`${userId}/control-buzzer/buzzer`).set(status);
    res.status(200).json({ message: `Buzzer di user ${userId} berhasil diupdate ke status ${status}.` });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update buzzer.', error: error.message });
  }
});

// Endpoint GET versi params (disarankan untuk device): /api/control-buzzer/:userId
router.get('/control-buzzer/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'userId wajib diisi.' });
  }
  try {
    const snapshot = await admin.database().ref(`${userId}/control-buzzer/buzzer`).once('value');
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

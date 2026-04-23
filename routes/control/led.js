const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const isValidStatus = (status) => status === 'ON' || status === 'OFF';

// POST /api/control/led/:userId - Set LED status (ON/OFF)
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;
  if (!userId || !status) {
    return res.status(400).json({ message: 'userId dan status wajib diisi.' });
  }
  if (!isValidStatus(status)) {
    return res.status(400).json({ message: 'Status harus ON atau OFF.' });
  }
  try {
    await admin.database().ref(`${userId}/control-led/led`).set(status);
    res.status(200).json({
      message: `LED berhasil diupdate ke ${status}.`,
      userId,
      device: 'led',
      status
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update LED.', error: error.message });
  }
});

// GET /api/control/led/:userId - Get LED status
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'userId wajib diisi.' });
  }
  try {
    const snapshot = await admin.database().ref(`${userId}/control-led/led`).once('value');
    const status = snapshot.val();
    if (status === null) {
      return res.status(404).json({ message: 'Data LED tidak ditemukan.' });
    }
    res.status(200).json({ userId, device: 'led', status });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data LED.', error: error.message });
  }
});

module.exports = router;

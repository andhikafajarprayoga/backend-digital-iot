const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const isValidStatus = (status) => status === 'ON' || status === 'OFF';

// POST /api/control/relay/:userId - Set relay status (ON/OFF)
// Relay digunakan untuk mengontrol perangkat listrik AC (lampu, kipas, pompa air, dll)
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
    await admin.database().ref(`${userId}/control/relay`).set(status);
    res.status(200).json({
      message: `Relay berhasil diupdate ke ${status}.`,
      userId,
      device: 'relay',
      status
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update relay.', error: error.message });
  }
});

// GET /api/control/relay/:userId - Get relay status
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'userId wajib diisi.' });
  }
  try {
    const snapshot = await admin.database().ref(`${userId}/control/relay`).once('value');
    const status = snapshot.val();
    if (status === null) {
      return res.status(404).json({ message: 'Data relay tidak ditemukan.' });
    }
    res.status(200).json({ userId, device: 'relay', status });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data relay.', error: error.message });
  }
});

module.exports = router;

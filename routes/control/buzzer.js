const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const isValidStatus = (status) => status === 'ON' || status === 'OFF';

// POST /api/control/buzzer/:userId - Set buzzer status (ON/OFF)
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
    await admin.database().ref(`${userId}/control-buzzer/buzzer`).set(status);
    res.status(200).json({
      message: `Buzzer berhasil diupdate ke ${status}.`,
      userId,
      device: 'buzzer',
      status
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update buzzer.', error: error.message });
  }
});

// GET /api/control/buzzer/:userId - Get buzzer status
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'userId wajib diisi.' });
  }
  try {
    const snapshot = await admin.database().ref(`${userId}/control-buzzer/buzzer`).once('value');
    const status = snapshot.val();
    if (status === null) {
      return res.status(404).json({ message: 'Data buzzer tidak ditemukan.' });
    }
    res.status(200).json({ userId, device: 'buzzer', status });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data buzzer.', error: error.message });
  }
});

module.exports = router;

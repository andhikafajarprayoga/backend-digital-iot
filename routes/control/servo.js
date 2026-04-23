const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const getServoRef = (userId) => admin.database().ref(`${userId}/control-servo/servo`);

const isValidPosition = (position) => {
  const pos = Number(position);
  return !isNaN(pos) && pos >= 0 && pos <= 180;
};

// POST /api/control/servo/:userId - Set servo position (0-180)
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { position } = req.body;
  if (position === undefined || !userId) {
    return res.status(400).json({ message: 'userId dan position wajib diisi.' });
  }
  if (!isValidPosition(position)) {
    return res.status(400).json({ message: 'Position harus angka antara 0-180.' });
  }
  try {
    await getServoRef(userId).set(Number(position));
    res.status(200).json({
      message: `Servo berhasil diupdate ke posisi ${position}.`,
      userId,
      device: 'servo',
      position: Number(position)
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update servo.', error: error.message });
  }
});

// GET /api/control/servo/:userId - Get servo position
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'userId wajib diisi.' });
  }
  try {
    const snapshot = await getServoRef(userId).once('value');
    const position = snapshot.val();
    if (position === null) {
      return res.status(404).json({ message: 'Data servo tidak ditemukan.' });
    }
    res.status(200).json({ userId, device: 'servo', position });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data servo.', error: error.message });
  }
});

module.exports = router;

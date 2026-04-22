const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const readCombinedStatus = async (userId) => {
  const ledRef = admin.database().ref(`${userId}/control-led/led`);
  const servoRef = admin.database().ref(`${userId}/control-servo/servo`);
  const buzzerRef = admin.database().ref(`${userId}/control-buzzer/buzzer`);

  const [ledSnap, servoSnap, buzzerSnap] = await Promise.all([
    ledRef.once('value'),
    servoRef.once('value'),
    buzzerRef.once('value')
  ]);

  return {
    led: ledSnap.val(),
    servo: servoSnap.val(),
    buzzer: buzzerSnap.val(),
  };
};

// Endpoint versi params (disarankan untuk device): /api/status/:userId
router.get('/status/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'userId wajib diisi.' });
  }
  try {
    const combined = await readCombinedStatus(userId);
    res.status(200).json(combined);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil status gabungan.', error: error.message });
  }
});

module.exports = router;

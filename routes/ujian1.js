const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Endpoint GET status gabungan semua fitur
router.get('/status', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ message: 'userId wajib diisi.' });
  }
  try {
    const ledRef = admin.database().ref(`${userId}/control-led/led`);
    const servoRef = admin.database().ref(`${userId}/control-servo/servo`);
    const buzzerRef = admin.database().ref(`${userId}/control-buzzer/buzzer`);

    const [ledSnap, servoSnap, buzzerSnap] = await Promise.all([
      ledRef.once('value'),
      servoRef.once('value'),
      buzzerRef.once('value')
    ]);

    const led = ledSnap.val();
    const servo = servoSnap.val();
    const buzzer = buzzerSnap.val();

    res.status(200).json({ led, servo, buzzer });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil status gabungan.', error: error.message });
  }
});

module.exports = router;

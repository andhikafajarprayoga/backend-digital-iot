const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Endpoint kontrol servo (POST)
router.post('/servo', async (req, res) => {
  const { position, userId } = req.body;
  if (position === undefined || !userId) {
    return res.status(400).json({ message: 'Position dan userId wajib diisi.' });
  }
  try {
    // Update posisi servo di Realtime Database
    await admin.database().ref(`${userId}/control-servo/servo`).set(position);
    res.status(200).json({ message: `Servo di user ${userId} berhasil diupdate ke posisi ${position}.` });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update servo.', error: error.message });
  }
});


// Endpoint GET posisi servo via query parameter (debug)
router.get('/servo', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ message: 'userId wajib diisi.' });
  }
  console.log('GET servo request for userId (query):', userId);
  try {
    const path = `${userId}/control-servo/servo`;
    console.log('Database path (query):', path);
    const ref = admin.database().ref(path);
    const snapshot = await ref.once('value');
    const position = snapshot.val();
    console.log('Data from database (query):', position);
    if (position === null) {
      return res.status(404).json({ message: 'Data tidak ditemukan.' });
    }
    res.status(200).json({ position });
  } catch (error) {
    console.error('Error (query):', error);
    res.status(500).json({ message: 'Gagal mengambil data.', error: error.message });
  }
});

module.exports = router;

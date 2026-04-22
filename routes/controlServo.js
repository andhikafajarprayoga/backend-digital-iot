const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const getServoRef = (userId) => admin.database().ref(`${userId}/control-servo/servo`);

// Endpoint kontrol servo (POST) versi path param: /api/servo/:userId
router.post('/servo/:userId', async (req, res) => {
  const { userId } = req.params;
  const { position } = req.body;
  if (position === undefined || !userId) {
    return res.status(400).json({ message: 'Position dan userId wajib diisi.' });
  }
  try {
    await getServoRef(userId).set(position);
    res.status(200).json({ message: `Servo di user ${userId} berhasil diupdate ke posisi ${position}.` });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update servo.', error: error.message });
  }
});

// Endpoint kontrol servo (POST) alias berbasis fitur: /api/control-servo/:userId
router.post('/control-servo/:userId', async (req, res) => {
  const { userId } = req.params;
  const { position } = req.body;
  if (position === undefined || !userId) {
    return res.status(400).json({ message: 'Position dan userId wajib diisi.' });
  }
  try {
    await getServoRef(userId).set(position);
    res.status(200).json({ message: `Servo di user ${userId} berhasil diupdate ke posisi ${position}.` });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update servo.', error: error.message });
  }
});

// Endpoint GET posisi servo versi path param: /api/servo/:userId
router.get('/servo/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'userId wajib diisi.' });
  }
  try {
    const snapshot = await getServoRef(userId).once('value');
    const position = snapshot.val();
    if (position === null) {
      return res.status(404).json({ message: 'Data tidak ditemukan.' });
    }
    res.status(200).json({ position });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data.', error: error.message });
  }
});

// Endpoint GET posisi servo alias berbasis fitur: /api/control-servo/:userId
router.get('/control-servo/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'userId wajib diisi.' });
  }
  try {
    const snapshot = await getServoRef(userId).once('value');
    const position = snapshot.val();
    if (position === null) {
      return res.status(404).json({ message: 'Data tidak ditemukan.' });
    }
    res.status(200).json({ position });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data.', error: error.message });
  }
});

module.exports = router;

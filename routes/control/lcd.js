const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// POST /api/control/lcd/:userId - Set LCD display text
// Body: { "text": "Hello World", "line": 1 } (line 1 or 2 for 16x2 LCD)
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { text, line } = req.body;
  if (!userId || text === undefined) {
    return res.status(400).json({ message: 'userId dan text wajib diisi.' });
  }
  const lineNum = line || 1;
  if (lineNum !== 1 && lineNum !== 2) {
    return res.status(400).json({ message: 'Line harus 1 atau 2 (untuk LCD 16x2).' });
  }
  if (text.length > 16) {
    return res.status(400).json({ message: 'Text maksimal 16 karakter untuk LCD 16x2.' });
  }
  try {
    const lcdData = { text, line: lineNum };
    await admin.database().ref(`${userId}/control/lcd`).set(lcdData);
    res.status(200).json({ message: 'LCD berhasil diupdate.', userId, device: 'lcd', ...lcdData });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update LCD.', error: error.message });
  }
});

// GET /api/control/lcd/:userId - Get LCD display data
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'userId wajib diisi.' });
  try {
    const snapshot = await admin.database().ref(`${userId}/control/lcd`).once('value');
    const data = snapshot.val();
    if (!data) return res.status(404).json({ message: 'Data LCD tidak ditemukan.' });
    res.status(200).json({ userId, device: 'lcd', ...data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data LCD.', error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// POST /api/monitoring/custom/:userId/:sensorName - Kirim data sensor custom
// Siswa bisa membuat sensor monitoring sendiri dengan nama dan data bebas!
// Body bisa berisi key-value apapun, contoh: { "value": 42, "label": "Intensitas UV" }
router.post('/:userId/:sensorName', async (req, res) => {
  const { userId, sensorName } = req.params;
  const sensorData = req.body;
  if (!userId || !sensorName) {
    return res.status(400).json({ message: 'userId dan sensorName wajib diisi.' });
  }
  if (!sensorData || Object.keys(sensorData).length === 0) {
    return res.status(400).json({ message: 'Body tidak boleh kosong. Kirim data sensor dalam format JSON.' });
  }
  // Validasi nama sensor (hanya huruf, angka, dan dash)
  if (!/^[a-zA-Z0-9-_]+$/.test(sensorName)) {
    return res.status(400).json({ message: 'sensorName hanya boleh mengandung huruf, angka, dash (-), dan underscore (_).' });
  }
  try {
    const data = { ...sensorData, sensorName, timestamp: new Date().toISOString() };
    await admin.database().ref(`${userId}/monitoring/custom/${sensorName}`).set(data);
    res.status(200).json({ message: `Data sensor custom "${sensorName}" berhasil diupdate.`, userId, sensor: sensorName, data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update sensor custom.', error: error.message });
  }
});

// GET /api/monitoring/custom/:userId/:sensorName - Ambil data sensor custom tertentu
router.get('/:userId/:sensorName', async (req, res) => {
  const { userId, sensorName } = req.params;
  if (!userId || !sensorName) {
    return res.status(400).json({ message: 'userId dan sensorName wajib diisi.' });
  }
  try {
    const snapshot = await admin.database().ref(`${userId}/monitoring/custom/${sensorName}`).once('value');
    const data = snapshot.val();
    if (!data) return res.status(404).json({ message: `Data sensor custom "${sensorName}" tidak ditemukan.` });
    res.status(200).json({ userId, sensor: sensorName, ...data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data sensor custom.', error: error.message });
  }
});

// GET /api/monitoring/custom/:userId - Ambil SEMUA sensor custom milik user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'userId wajib diisi.' });
  try {
    const snapshot = await admin.database().ref(`${userId}/monitoring/custom`).once('value');
    const data = snapshot.val();
    if (!data) return res.status(404).json({ message: 'Belum ada sensor custom.' });
    const sensors = Object.keys(data).map(key => ({ sensorName: key, ...data[key] }));
    res.status(200).json({ userId, totalSensors: sensors.length, sensors });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data sensor custom.', error: error.message });
  }
});

// DELETE /api/monitoring/custom/:userId/:sensorName - Hapus sensor custom
router.delete('/:userId/:sensorName', async (req, res) => {
  const { userId, sensorName } = req.params;
  if (!userId || !sensorName) {
    return res.status(400).json({ message: 'userId dan sensorName wajib diisi.' });
  }
  try {
    await admin.database().ref(`${userId}/monitoring/custom/${sensorName}`).remove();
    res.status(200).json({ message: `Sensor custom "${sensorName}" berhasil dihapus.`, userId, sensor: sensorName });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus sensor custom.', error: error.message });
  }
});

module.exports = router;

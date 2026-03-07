const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

console.log('=== LOADING UNIVERSAL DEVICE CONTROL ROUTES ===');

// Middleware debug untuk universal routes
router.use((req, res, next) => {
  console.log(`=== UNIVERSAL MIDDLEWARE === ${req.method} ${req.path}`);
  console.log('Original URL:', req.originalUrl);
  console.log('Base URL:', req.baseUrl);
  next();
});

// Endpoint universal POST untuk set value device apapun
router.post('/device', async (req, res) => {
  const { userId, deviceName, value } = req.body;
  if (!userId || !deviceName || value === undefined) {
    return res.status(400).json({ message: 'userId, deviceName, dan value wajib diisi.' });
  }
  try {
    // Set value ke path universal: userId/deviceName/value
    await admin.database().ref(`${userId}/${deviceName}/value`).set(value);
    res.status(200).json({ 
      message: `Device ${deviceName} berhasil diupdate.`, 
      userId, 
      deviceName, 
      value 
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update device.', error: error.message });
  }
});

// Endpoint universal GET untuk baca value device apapun
router.get('/device', async (req, res) => {
  console.log('=== GET HANDLER CALLED ===');
  console.log('=== DEBUG GET UNIVERSAL DEVICE ===');
  console.log('Raw query:', req.query);
  
  const { userId, deviceName } = req.query;
  console.log('Parsed userId:', userId);
  console.log('Parsed deviceName:', deviceName);
  
  if (!userId || !deviceName) {
    console.log('Missing required parameters');
    return res.status(400).json({ message: 'userId dan deviceName wajib diisi.' });
  }
  try {
    const path = `${userId}/${deviceName}/value`;
    console.log('GET universal device path:', path);
    
    const ref = admin.database().ref(path);
    console.log('Firebase ref created for path:', path);
    
    const snapshot = await ref.once('value');
    console.log('Snapshot exists:', snapshot.exists());
    
    const value = snapshot.val();
    console.log('GET universal device value:', value);
    console.log('Value type:', typeof value);
    console.log('Value is null?', value === null);
    console.log('Value is undefined?', value === undefined);
    
    if (value === null || value === undefined) {
      console.log('Returning 404 - Data not found');
      return res.status(404).json({ message: 'Data tidak ditemukan.' });
    }
    
    console.log('Returning success with value');
    res.status(200).json({ userId, deviceName, value });
  } catch (error) {
    console.error('Error in GET universal device:', error);
    res.status(500).json({ message: 'Gagal mengambil data.', error: error.message });
  }
});

// Endpoint untuk get semua devices milik user
router.get('/devices', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ message: 'userId wajib diisi.' });
  }
  try {
    const ref = admin.database().ref(`${userId}`);
    const snapshot = await ref.once('value');
    const data = snapshot.val();
    if (!data) {
      return res.status(404).json({ message: 'Data tidak ditemukan.' });
    }
    res.status(200).json({ userId, devices: data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data.', error: error.message });
  }
});

console.log('=== UNIVERSAL ROUTES REGISTERED ===');
module.exports = router;
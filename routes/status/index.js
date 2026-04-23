const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// GET /api/status/all/:userId - Ambil semua status (control + monitoring)
router.get('/all/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'userId wajib diisi.' });
  try {
    const snapshot = await admin.database().ref(`${userId}`).once('value');
    const data = snapshot.val();
    if (!data) return res.status(404).json({ message: 'Data user tidak ditemukan.' });
    res.status(200).json({ userId, ...data });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil status.', error: error.message });
  }
});

// GET /api/status/control/:userId - Ambil semua status kontrol devices
router.get('/control/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'userId wajib diisi.' });
  try {
    const [ledSnap, servoSnap, buzzerSnap, relaySnap, rgbSnap, motorSnap, lcdSnap] = await Promise.all([
      admin.database().ref(`${userId}/control-led/led`).once('value'),
      admin.database().ref(`${userId}/control-servo/servo`).once('value'),
      admin.database().ref(`${userId}/control-buzzer/buzzer`).once('value'),
      admin.database().ref(`${userId}/control/relay`).once('value'),
      admin.database().ref(`${userId}/control/rgb-led`).once('value'),
      admin.database().ref(`${userId}/control/motor-dc`).once('value'),
      admin.database().ref(`${userId}/control/lcd`).once('value'),
    ]);
    res.status(200).json({
      userId,
      category: 'control',
      devices: {
        led: ledSnap.val(),
        servo: servoSnap.val(),
        buzzer: buzzerSnap.val(),
        relay: relaySnap.val(),
        'rgb-led': rgbSnap.val(),
        'motor-dc': motorSnap.val(),
        lcd: lcdSnap.val(),
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil status kontrol.', error: error.message });
  }
});

// GET /api/status/monitoring/:userId - Ambil semua status monitoring sensors
router.get('/monitoring/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'userId wajib diisi.' });
  try {
    const [dhtSnap, ldrSnap, ultraSnap, soilSnap, gasSnap, pirSnap, rainSnap, customSnap] = await Promise.all([
      admin.database().ref(`${userId}/monitoring-dht`).once('value'),
      admin.database().ref(`${userId}/monitoring/ldr`).once('value'),
      admin.database().ref(`${userId}/monitoring/ultrasonic`).once('value'),
      admin.database().ref(`${userId}/monitoring/soil-moisture`).once('value'),
      admin.database().ref(`${userId}/monitoring/gas`).once('value'),
      admin.database().ref(`${userId}/monitoring/pir`).once('value'),
      admin.database().ref(`${userId}/monitoring/rain`).once('value'),
      admin.database().ref(`${userId}/monitoring/custom`).once('value'),
    ]);
    res.status(200).json({
      userId,
      category: 'monitoring',
      sensors: {
        dht: dhtSnap.val(),
        ldr: ldrSnap.val(),
        ultrasonic: ultraSnap.val(),
        'soil-moisture': soilSnap.val(),
        gas: gasSnap.val(),
        pir: pirSnap.val(),
        rain: rainSnap.val(),
        custom: customSnap.val(),
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil status monitoring.', error: error.message });
  }
});

// GET /api/status - List semua status endpoints
router.get('/', (req, res) => {
  res.status(200).json({
    category: 'status',
    description: 'Kategori untuk melihat status gabungan semua device/sensor',
    endpoints: [
      { path: '/api/status/all/:userId', methods: ['GET'], description: 'Semua data user (control + monitoring)' },
      { path: '/api/status/control/:userId', methods: ['GET'], description: 'Status semua device kontrol' },
      { path: '/api/status/monitoring/:userId', methods: ['GET'], description: 'Status semua sensor monitoring' },
    ]
  });
});

module.exports = router;

const express = require('express');
const router = express.Router();

// Import semua sub-routes kontrol
const ledRoutes = require('./led');
const servoRoutes = require('./servo');
const buzzerRoutes = require('./buzzer');
const relayRoutes = require('./relay');
const rgbLedRoutes = require('./rgb-led');
const motorDcRoutes = require('./motor-dc');
const lcdRoutes = require('./lcd');

// Mount sub-routes dengan slug masing-masing
router.use('/led', ledRoutes);
router.use('/servo', servoRoutes);
router.use('/buzzer', buzzerRoutes);
router.use('/relay', relayRoutes);
router.use('/rgb-led', rgbLedRoutes);
router.use('/motor-dc', motorDcRoutes);
router.use('/lcd', lcdRoutes);

// GET /api/control - List semua control endpoints yang tersedia
router.get('/', (req, res) => {
  res.status(200).json({
    category: 'control',
    description: 'Kategori untuk mengontrol aktuator/perangkat output IoT',
    endpoints: [
      { device: 'led', path: '/api/control/led/:userId', methods: ['GET', 'POST'], description: 'Kontrol LED (ON/OFF)' },
      { device: 'servo', path: '/api/control/servo/:userId', methods: ['GET', 'POST'], description: 'Kontrol Servo Motor (0-180 derajat)' },
      { device: 'buzzer', path: '/api/control/buzzer/:userId', methods: ['GET', 'POST'], description: 'Kontrol Buzzer (ON/OFF)' },
      { device: 'relay', path: '/api/control/relay/:userId', methods: ['GET', 'POST'], description: 'Kontrol Relay (ON/OFF)' },
      { device: 'rgb-led', path: '/api/control/rgb-led/:userId', methods: ['GET', 'POST'], description: 'Kontrol RGB LED (r, g, b: 0-255)' },
      { device: 'motor-dc', path: '/api/control/motor-dc/:userId', methods: ['GET', 'POST'], description: 'Kontrol Motor DC (speed: 0-255, direction: CW/CCW)' },
      { device: 'lcd', path: '/api/control/lcd/:userId', methods: ['GET', 'POST'], description: 'Kontrol LCD 16x2 (text, line)' },
    ]
  });
});

module.exports = router;

const express = require('express');
const router = express.Router();

// Import semua sub-routes monitoring
const dhtRoutes = require('./dht');
const ldrRoutes = require('./ldr');
const ultrasonicRoutes = require('./ultrasonic');
const soilMoistureRoutes = require('./soil-moisture');
const gasRoutes = require('./gas');
const pirRoutes = require('./pir');
const rainRoutes = require('./rain');
const customRoutes = require('./custom');

// Mount sub-routes dengan slug masing-masing
router.use('/dht', dhtRoutes);
router.use('/ldr', ldrRoutes);
router.use('/ultrasonic', ultrasonicRoutes);
router.use('/soil-moisture', soilMoistureRoutes);
router.use('/gas', gasRoutes);
router.use('/pir', pirRoutes);
router.use('/rain', rainRoutes);
router.use('/custom', customRoutes);

// GET /api/monitoring - List semua monitoring endpoints yang tersedia
router.get('/', (req, res) => {
  res.status(200).json({
    category: 'monitoring',
    description: 'Kategori untuk monitoring data sensor IoT',
    endpoints: [
      { sensor: 'dht', path: '/api/monitoring/dht/:userId', methods: ['GET', 'POST'], description: 'Monitoring DHT - Suhu & Kelembapan' },
      { sensor: 'ldr', path: '/api/monitoring/ldr/:userId', methods: ['GET', 'POST'], description: 'Monitoring LDR - Intensitas Cahaya (0-1023)' },
      { sensor: 'ultrasonic', path: '/api/monitoring/ultrasonic/:userId', methods: ['GET', 'POST'], description: 'Monitoring Ultrasonic - Jarak (cm)' },
      { sensor: 'soil-moisture', path: '/api/monitoring/soil-moisture/:userId', methods: ['GET', 'POST'], description: 'Monitoring Soil Moisture - Kelembapan Tanah (0-100%)' },
      { sensor: 'gas', path: '/api/monitoring/gas/:userId', methods: ['GET', 'POST'], description: 'Monitoring Gas Sensor (MQ-2/MQ-135)' },
      { sensor: 'pir', path: '/api/monitoring/pir/:userId', methods: ['GET', 'POST'], description: 'Monitoring PIR - Deteksi Gerakan' },
      { sensor: 'rain', path: '/api/monitoring/rain/:userId', methods: ['GET', 'POST'], description: 'Monitoring Rain Sensor - Deteksi Hujan' },
      { sensor: 'custom', path: '/api/monitoring/custom/:userId/:sensorName', methods: ['GET', 'POST', 'DELETE'], description: 'Custom Monitoring - Sensor buatan siswa (bebas!)' },
      { sensor: 'custom-all', path: '/api/monitoring/custom/:userId', methods: ['GET'], description: 'Lihat semua sensor custom milik user' },
    ]
  });
});

module.exports = router;

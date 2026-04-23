const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

// Inisialisasi Firebase Admin SDK
const serviceAccount = require('./config/digiiot-ebd39-firebase-adminsdk-fbsvc-1ddb3d5cd3.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://digiiot-ebd39-default-rtdb.asia-southeast1.firebasedatabase.app'
});

const app = express();
app.use(bodyParser.json());

// Middleware untuk log semua request
app.use((req, res, next) => {
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
	console.log('Query params:', req.query);
	console.log('Body:', req.body);
	console.log('Route matching for:', req.url);
	next();
});

// Contoh endpoint root
app.get('/', (req, res) => {
	res.send('Backend IoT Edukasi siap!');
});

// Server listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server berjalan di port ${PORT}`);
});



// Import routes
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

// Mount universal routes FIRST before other /api routes 
const universalRoutes = require('./routes/universal/deviceControl');
console.log('Mounting universal routes at /api/universal...');
app.use('/api/universal', universalRoutes);
console.log('Universal routes mounted successfully!');

// ============================================
// NEW: Nested Category Routes (recommended)
// ============================================
// /api/control/led/:userId, /api/control/servo/:userId, etc.
const controlRoutes = require('./routes/control');
app.use('/api/control', controlRoutes);

// /api/monitoring/dht/:userId, /api/monitoring/ldr/:userId, etc.
const monitoringRoutes = require('./routes/monitoring');
app.use('/api/monitoring', monitoringRoutes);

// /api/status/all/:userId, /api/status/control/:userId, etc.
const statusCategoryRoutes = require('./routes/status');
app.use('/api/status', statusCategoryRoutes);

// ============================================
// LEGACY: Old flat routes (backward compatible)
// ============================================
const deviceRoutes = require('./routes/control-led');
app.use('/api', deviceRoutes);

const servoRoutes = require('./routes/controlServo');
app.use('/api', servoRoutes);

const buzzerRoutes = require('./routes/controlBuzzer');
app.use('/api', buzzerRoutes);

const statusRoutes = require('./routes/ujian1');
app.use('/api', statusRoutes);

const monitoringSuhuRoutes = require('./routes/monitoringSuhu');
app.use('/api', monitoringSuhuRoutes);

// ============================================
// API Discovery: GET /api - List all categories
// ============================================
app.get('/api', (req, res) => {
	res.status(200).json({
		name: 'Digital IoT Education API',
		version: '2.0',
		categories: [
			{ category: 'control', path: '/api/control', description: 'Kontrol aktuator (LED, Servo, Buzzer, Relay, RGB LED, Motor DC, LCD)' },
			{ category: 'monitoring', path: '/api/monitoring', description: 'Monitoring sensor (DHT, LDR, Ultrasonic, Soil Moisture, Gas, PIR, Rain, Custom)' },
			{ category: 'status', path: '/api/status', description: 'Status gabungan semua device & sensor' },
			{ category: 'universal', path: '/api/universal', description: 'Universal device control' },
		],
		legacy: {
			note: 'Route lama masih aktif untuk backward compatibility',
			routes: ['/api/control-led/:userId', '/api/servo/:userId', '/api/control-buzzer/:userId', '/api/monitoring-dht/:userId', '/api/status/:userId']
		}
	});
});

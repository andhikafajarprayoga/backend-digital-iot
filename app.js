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

const deviceRoutes = require('./routes/control-led');
app.use('/api', deviceRoutes);

const servoRoutes = require('./routes/controlServo');
app.use('/api', servoRoutes);

const buzzerRoutes = require('./routes/controlBuzzer');
app.use('/api', buzzerRoutes);

const statusRoutes = require('./routes/ujian1');
app.use('/api', statusRoutes);

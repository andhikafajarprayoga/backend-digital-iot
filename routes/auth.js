const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const jwt = require('jsonwebtoken');
const db = admin.firestore();
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey'; // Ganti dengan secret yang aman di production

// Endpoint register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, dan nama wajib diisi.' });
  }
  try {
    // Cek apakah email sudah terdaftar
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (!userSnapshot.empty) {
      return res.status(409).json({ message: 'Email sudah terdaftar.' });
    }
    // Simpan user baru
    const newUser = {
      email,
      password, // Untuk demo, password disimpan plain. Production: hash password!
      name,
      roles: ['user'],
      createdAt: new Date().toISOString(),
    };
    const userRef = await db.collection('users').add(newUser);
    res.status(201).json({ message: 'Registrasi berhasil!', userId: userRef.id });
  } catch (error) {
    res.status(500).json({ message: 'Registrasi gagal.', error: error.message });
  }
});

// Endpoint login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi.' });
  }
  try {
    // Cari user di Firestore
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }
    const userData = userSnapshot.docs[0].data();
    const userId = userSnapshot.docs[0].id;
    // Cek password (production: hash & compare!)
    if (userData.password !== password) {
      return res.status(401).json({ message: 'Password salah.' });
    }
    // Generate JWT
    const token = jwt.sign({
      userId,
      email: userData.email,
      name: userData.name,
      roles: userData.roles,
    }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({
      message: 'Login berhasil.',
      user: {
        id: userId,
        email: userData.email,
        name: userData.name,
        roles: userData.roles,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Login gagal.', error: error.message });
  }
});

module.exports = router;


// Endpoint verifikasi token ID Firebase
router.post('/verifyToken', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ message: 'Token ID wajib dikirim.' });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    res.status(200).json({ message: 'Token valid.', uid: decodedToken.uid, email: decodedToken.email });
  } catch (error) {
    res.status(401).json({ message: 'Token tidak valid.', error: error.message });
  }
});

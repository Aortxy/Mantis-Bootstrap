const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Custom routing for clean URLs (placed before express.static to avoid directory collisions)
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/manage-servers', (req, res) => res.sendFile(path.join(__dirname, 'public', 'manage-servers.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/pterodactyl', require('./src/routes/pterodactyl'));
app.use('/api/payment', require('./src/routes/payment'));
app.use('/api/stats', require('./src/routes/stats'));
app.use('/api/admin', require('./src/routes/admin'));

// Fallback for SPA (if not caught by above)
app.get(/^(?!\/api).+/, (req, res) => {
  if (req.url.startsWith('/api/')) return res.status(404).json({ message: 'API Route not found' });
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

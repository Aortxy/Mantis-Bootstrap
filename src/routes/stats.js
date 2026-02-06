const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const Server = require('../models/Server');
const { DEMO_USER } = require('../controllers/authController');

router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const totalServers = await Server.countDocuments({ ownerId: userId });

    let user;
    if (userId === DEMO_USER._id) {
      user = DEMO_USER;
    } else {
      user = await User.findById(userId);
    }

    // For admin, show global stats
    let globalStats = {};
    if (req.user.role === 'admin') {
      globalStats.totalResellers = await User.countDocuments({ role: 'reseller' });
      globalStats.totalServersAll = await Server.countDocuments();
    }

    res.json({
      totalServers,
      balance: user.balance,
      role: user.role,
      ...globalStats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

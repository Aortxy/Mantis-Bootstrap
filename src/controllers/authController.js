const User = require('../models/User');
const jwt = require('jsonwebtoken');

const DEMO_USER = {
  _id: '65c2a5e5e4b0a1a1a1a1a1a1',
  username: 'demo',
  password: 'demo',
  email: 'demo@example.com',
  role: 'reseller',
  balance: 50000
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    // Check for Static Demo User
    if (username === DEMO_USER.username && password === DEMO_USER.password) {
      const token = jwt.sign(
        { userId: DEMO_USER._id, role: DEMO_USER.role, username: DEMO_USER.username, email: DEMO_USER.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({ token, user: { username: DEMO_USER.username, role: DEMO_USER.role, balance: DEMO_USER.balance } });
    }

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { username: user.username, role: user.role, balance: user.balance } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMe = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (userId === DEMO_USER._id) {
            const { password, ...userData } = DEMO_USER;
            return res.json(userData);
        }
        const user = await User.findById(userId).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = { login, getMe, DEMO_USER };

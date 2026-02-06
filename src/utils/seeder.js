const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin', // The User model has a pre-save hook to hash this
        role: 'admin',
        balance: 1000000
      });
      await admin.save();
      console.log('Admin user seeded successfully');
    } else {
      console.log('Admin user already exists. Skipping seeding.');
    }
  } catch (err) {
    console.error('Error seeding admin user:', err);
  }
};

module.exports = seedAdmin;

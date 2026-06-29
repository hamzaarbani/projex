const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'hamzaarbani80@gmail.com' });
    if (existingAdmin) {
      // Update to admin if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('Existing user promoted to admin');
      } else {
        console.log('Admin already exists');
      }
    } else {
      // Create new admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('arbani32', salt);
      const admin = new User({
        name: 'Admin',
        email: 'hamzaarbani80@gmail.com',
        password: hashedPassword,
        role: 'admin',
      });
      await admin.save();
      console.log('Admin user created with email hamzaarbani80@gmail.com and password arbani32');
    }

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedAdmin();
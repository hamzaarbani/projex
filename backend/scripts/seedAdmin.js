const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'hamzaarbani80@gmail.com';
    const password = 'arbani32';

    let user = await User.findOne({ email });
    if (user) {
      // ✅ Set password and SAVE – triggers pre('save') hook
      user.password = password;
      await user.save();
      console.log('✅ Admin password updated (hashed)!');
    } else {
      // ✅ Create – triggers pre('save') hook automatically
      await User.create({
        name: 'Admin',
        email,
        password,
        role: 'admin',
      });
      console.log('✅ Admin user created (hashed)!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedAdmin();

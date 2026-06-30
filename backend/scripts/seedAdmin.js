const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'hamzaarbani80@gmail.com';
    const password = 'arbani32';

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Admin user not found – creating new...');
      await User.create({
        name: 'Admin',
        email,
        password,
        role: 'admin',
      });
      console.log('✅ Admin user created with hashed password!');
    } else {
      // ✅ Force update the password – triggers pre('save') hook
      user.password = password;
      await user.save();
      console.log('✅ Admin password overwritten and hashed!');
    }

    console.log('🔑 Login with:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedAdmin();

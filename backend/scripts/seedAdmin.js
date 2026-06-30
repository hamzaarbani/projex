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
      // ✅ FORCE update the password – this triggers pre('save') hook
      console.log('✅ Admin found – overwriting password...');
      user.password = password;
      await user.save();
      console.log('✅ Admin password overwritten and hashed!');
    }

    console.log('\n🔑 Login with:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedAdmin();

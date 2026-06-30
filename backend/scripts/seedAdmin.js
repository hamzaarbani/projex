const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'hamzaarbani80@gmail.com';
    const password = 'arbani32';

    // Find existing user
    let user = await User.findOne({ email });
    if (user) {
      // Set password – this will trigger the pre‑save hook
      user.password = password;
      await user.save();
      console.log('✅ Admin password updated!');
    } else {
      // Create new user – this triggers the pre‑save hook
      await User.create({
        name: 'Admin',
        email,
        password,
        role: 'admin',
      });
      console.log('✅ Admin user created!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedAdmin();

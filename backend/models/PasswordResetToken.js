const mongoose = require('mongoose');

const PasswordResetTokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, default: () => Date.now() + 3600000 }, // 1 hour
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PasswordResetToken', PasswordResetTokenSchema);
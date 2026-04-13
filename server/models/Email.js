const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emailAddress: { type: String, required: true },
  description: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Email', emailSchema);

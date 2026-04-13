const mongoose = require('mongoose');

const toolSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toolName: { type: String, required: true },
  emails: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Email' }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  renewalDate: { type: Date, required: true },
  notes: { type: String },
  notifiedExpireSoon: { type: Boolean, default: false },
  notifiedExpired: { type: Boolean, default: false },
  notifiedRenewal: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Tool', toolSchema);

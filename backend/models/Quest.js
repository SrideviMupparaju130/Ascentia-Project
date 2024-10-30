const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  name: { type: String, required: true },
  xp: { type: Number, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Quest', questSchema);

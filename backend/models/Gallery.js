const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    category: { type: String, trim: true, default: 'General' },
    description: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gallery', gallerySchema);


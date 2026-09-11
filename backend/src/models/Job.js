const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  id:          { type: String, required: true, unique: true, index: true },
  title:       { type: String, required: true },
  company:     { type: String, default: '' },
  type:        { type: String, default: 'job' },
  skills:      { type: [String], default: [] },
  location:    { type: String, default: '' },
  salary:      { type: String, default: '' },
  posted_by:   { type: String, required: true },
  description: { type: String, default: '' },
  posted_at:   { type: Date, default: Date.now },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

module.exports = mongoose.model('Job', jobSchema);

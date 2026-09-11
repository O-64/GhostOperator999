const mongoose = require('mongoose');

const copilotMessageSchema = new mongoose.Schema({
  id:                { type: String, required: true, unique: true, index: true },
  recruiter_id:      { type: String, required: true },
  role:              { type: String, enum: ['user', 'assistant'], required: true },
  content:           { type: String, required: true },
  candidate_results: { type: mongoose.Schema.Types.Mixed, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

module.exports = mongoose.model('CopilotMessage', copilotMessageSchema);

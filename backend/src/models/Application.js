const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  id:                   { type: String, required: true, unique: true, index: true },
  candidate_id:         { type: String, required: true },
  recruiter_id:         { type: String, required: true },
  job_id:               { type: String, default: null },
  stage:                { type: String, default: 'Discovered' },
  notes:                { type: String, default: null },
  match_score:          { type: Number, default: null },
  outreach_sent:        { type: Boolean, default: false },
  scheduled_interview:  { type: String, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

module.exports = mongoose.model('Application', applicationSchema);

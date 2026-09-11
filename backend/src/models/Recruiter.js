const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
  id:                  { type: String, required: true, unique: true, index: true },
  name:                { type: String, required: true },
  email:               { type: String, required: true, unique: true, lowercase: true },
  password_hash:       { type: String, required: true },
  company:             { type: String, required: true },
  title:               { type: String, required: true },
  industry:            { type: String, default: null },
  team_size:           { type: String, default: null },
  website:             { type: String, default: null },
  headquarters:        { type: String, default: null },
  company_description: { type: String, default: null },
  logo_url:            { type: String, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

module.exports = mongoose.model('Recruiter', recruiterSchema);

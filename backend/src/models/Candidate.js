const mongoose = require('mongoose');

const profileViewSchema = new mongoose.Schema({
  recruiterId: { type: String },
  recruiterName: { type: String },
  company: { type: String },
  viewedAt: { type: String },
}, { _id: false });

const skillLevelSchema = new mongoose.Schema({
  skill: { type: String },
  level: { type: String },
}, { _id: false });

const candidateSchema = new mongoose.Schema({
  id:                 { type: String, required: true, unique: true, index: true },
  name:               { type: String, required: true },
  email:              { type: String, required: true, unique: true, lowercase: true },
  mobile:             { type: String, default: '' },
  password_hash:      { type: String, required: true },
  experience_type:    { type: String, enum: ['fresher', 'experienced'], default: 'fresher' },
  previous_company:   { type: String, default: null },
  current_company:    { type: String, default: null },
  reason_for_change:  { type: String, default: null },
  post:               { type: String, default: null },
  skills:             { type: [String], default: [] },
  project_ppts:       { type: [String], default: [] },
  certificates:       { type: [String], default: [] },
  hackathons:         { type: [String], default: [] },
  skill_levels:       { type: [skillLevelSchema], default: [] },
  recommendations:    { type: [String], default: [] },
  profile_views:      { type: [profileViewSchema], default: [] },
  profile_completion: { type: Number, default: 20 },
  score:              { type: Number, default: 0 },
  coding_test_score:  { type: Number, default: null },
  agent_analysis_done:{ type: Boolean, default: false },
  verified_badge:     { type: Boolean, default: false },
  rank:               { type: Number, default: null },
  resume_name:        { type: String, default: null },
  github_url:         { type: String, default: null },
  leetcode_url:       { type: String, default: null },
  linkedin_url:       { type: String, default: null },
  about:              { type: String, default: null },
  college:            { type: String, default: null },
  university:         { type: String, default: null },
  location:           { type: String, default: null },
  avatar:             { type: String, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

module.exports = mongoose.model('Candidate', candidateSchema);

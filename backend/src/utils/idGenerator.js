const { v4: uuidv4 } = require('uuid');

/** Generate a candidate ID like "ALEX#4729" */
function generateCandidateId(name = '') {
  const prefix = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 4)
    .padEnd(4, 'X');
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}#${num}`;
}

/** Generate a recruiter ID like "REC#9901" */
function generateRecruiterId() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `REC#${num}`;
}

/** Generate a short job/application ID using uuid prefix */
function generateShortId(prefix = 'id') {
  return `${prefix}-${uuidv4().slice(0, 8)}`;
}

module.exports = { generateCandidateId, generateRecruiterId, generateShortId };

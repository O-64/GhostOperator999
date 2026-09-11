const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/** Hash a plain-text password */
function hashPassword(plain) {
  return bcrypt.hashSync(plain, SALT_ROUNDS);
}

/** Verify a plain-text password against a bcrypt hash */
function verifyPassword(plain, hash) {
  return bcrypt.compareSync(plain, hash);
}

/** Create a signed JWT token */
function createAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/** Decode and verify a JWT token. Returns payload or null. */
function decodeAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = { hashPassword, verifyPassword, createAccessToken, decodeAccessToken };

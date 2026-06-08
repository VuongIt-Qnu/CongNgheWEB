const { getDb } = require('../database/db');

async function createResetToken(userId, tokenHash, expiresAt) {
  const db = getDb();
  await db.run('DELETE FROM password_resets WHERE user_id = ? AND used_at IS NULL', userId);
  const result = await db.run(
    'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    userId,
    tokenHash,
    expiresAt
  );
  return result.lastID;
}

async function findValidToken(tokenHash) {
  const db = getDb();
  return db.get(
    `SELECT * FROM password_resets
     WHERE token_hash = ?
       AND datetime(expires_at) > datetime('now')
       AND used_at IS NULL`,
    tokenHash
  );
}

async function markTokenUsed(id) {
  const db = getDb();
  return db.run(
    `UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE id = ?`,
    id
  );
}

async function deleteExpiredTokens() {
  const db = getDb();
  return db.run(
    `DELETE FROM password_resets
     WHERE datetime(expires_at) <= datetime('now')
        OR used_at IS NOT NULL`
  );
}

module.exports = {
  createResetToken,
  findValidToken,
  markTokenUsed,
  deleteExpiredTokens,
};

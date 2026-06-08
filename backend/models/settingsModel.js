const { getDb } = require('../database/db');

async function getAllSettings() {
  const db = getDb();
  const rows = await db.all(`SELECT key, value FROM hotel_settings`);
  const out = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

async function setMany(patch) {
  const db = getDb();
  if (!patch || typeof patch !== 'object') return getAllSettings();
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || key === '') continue;
    await db.run(
      'INSERT OR REPLACE INTO hotel_settings (key, value) VALUES (?, ?)',
      key,
      String(value)
    );
  }
  return getAllSettings();
}

module.exports = { getAllSettings, setMany };

const settingsModel = require('../models/settingsModel');

async function getSettings(req, res, next) {
  try {
    const settings = await settingsModel.getAllSettings();
    res.json(settings);
  } catch (e) {
    next(e);
  }
}

async function updateSettings(req, res, next) {
  try {
    const merged = await settingsModel.setMany(req.body || {});
    res.json(merged);
  } catch (e) {
    next(e);
  }
}

module.exports = { getSettings, updateSettings };

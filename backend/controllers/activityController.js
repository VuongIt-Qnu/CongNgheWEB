const activityModel = require('../models/activityModel');

async function listActivityFeed(req, res, next) {
  try {
    const { page = 1, limit = 25 } = req.query;
    const result = await activityModel.listActivityPaged({ page, limit });
    res.json(result);
  } catch (e) {
    next(e);
  }
}

module.exports = { listActivityFeed };

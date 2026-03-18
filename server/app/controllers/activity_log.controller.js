const { ActivityLog } = require('../models');
const { Op } = require('sequelize');

// GET /activity-logs — List with pagination, filters
exports.findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Build filter
    const where = {};
    if (req.query.action) where.action = req.query.action;
    if (req.query.role) where.role = req.query.role;
    if (req.query.entity) where.entity = req.query.entity;
    if (req.query.search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${req.query.search}%` } },
        { email: { [Op.iLike]: `%${req.query.search}%` } },
        { details: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }
    if (req.query.from || req.query.to) {
      where.created_at = {};
      if (req.query.from) where.created_at[Op.gte] = new Date(req.query.from);
      if (req.query.to) where.created_at[Op.lte] = new Date(req.query.to + 'T23:59:59');
    }

    const { count, rows } = await ActivityLog.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    res.json({
      data: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /activity-logs/stats — Summary counts
exports.stats = async (req, res) => {
  try {
    const total = await ActivityLog.count();
    const logins = await ActivityLog.count({ where: { action: 'LOGIN' } });
    const creates = await ActivityLog.count({ where: { action: 'CREATE' } });
    const updates = await ActivityLog.count({ where: { action: 'UPDATE' } });
    const deletes = await ActivityLog.count({ where: { action: 'DELETE' } });

    res.json({ total, logins, creates, updates, deletes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

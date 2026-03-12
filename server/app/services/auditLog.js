/**
 * Audit Logger Service
 * Call auditLog.log() from any controller to record an activity.
 * Works with or without an authenticated request.
 */
const logger = require('../lib/logger');

let ActivityLog = null; // Lazy-loaded to avoid circular dependency

const getModel = () => {
  if (!ActivityLog) {
    const db = require('../models');
    ActivityLog = db.ActivityLog;
  }
  return ActivityLog;
};

/**
 * @param {Object} opts
 * @param {Object} [opts.req]        - Express request (auto-extracts user & IP)
 * @param {string} opts.action       - LOGIN | LOGOUT | CREATE | UPDATE | DELETE | VIEW
 * @param {string} [opts.entity]     - e.g. 'student', 'classroom', 'timetable'
 * @param {number} [opts.entity_id]  - ID of the affected record
 * @param {string} [opts.details]    - Human-readable description
 * @param {Object} [opts.user]       - Manual user override {user_id, username, email, user_type}
 */
const log = async (opts) => {
  try {
    const Model = getModel();
    if (!Model) return;

    const user = opts.user || opts.req?.user || {};
    const ip = opts.req?.ip || opts.req?.headers?.['x-forwarded-for'] || opts.req?.connection?.remoteAddress || null;

    await Model.create({
      user_id:    user.user_id || user.id || null,
      username:   user.username || null,
      email:      user.email || null,
      role:       user.user_type || user.role || null,
      action:     opts.action,
      entity:     opts.entity || null,
      entity_id:  opts.entity_id || null,
      details:    opts.details || null,
      ip_address: ip,
    });
  } catch (err) {
    // Never let audit logging crash the main request
    logger.error('Audit log write failed:', err.message);
  }
};

module.exports = { log };

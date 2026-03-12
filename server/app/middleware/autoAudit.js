/**
 * Auto-Audit Middleware
 * Attach to any route group to automatically log POST/PUT/DELETE requests.
 * Must be placed AFTER the authenticate middleware so req.user is available.
 */
const auditLog = require('../services/auditLog');

const METHOD_ACTION = {
  POST:   'CREATE',
  PUT:    'UPDATE',
  PATCH:  'UPDATE',
  DELETE: 'DELETE',
};

const autoAudit = (entityName) => {
  return (req, res, next) => {
    const action = METHOD_ACTION[req.method];
    if (!action) return next(); // Skip GET/HEAD/OPTIONS

    // Hook into res.json to capture the response and log after success
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Only log if the response is successful (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entityId = req.params.id || body?.id || body?.data?.id || null;
        const details = `${req.user?.username || 'unknown'} ${action.toLowerCase()}d ${entityName}${entityId ? ` #${entityId}` : ''} — ${req.method} ${req.originalUrl}`;
        
        auditLog.log({
          req,
          action,
          entity: entityName,
          entity_id: entityId ? Number(entityId) : null,
          details,
        });
      }
      return originalJson(body);
    };

    next();
  };
};

module.exports = autoAudit;

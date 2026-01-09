const AdminLog = require('../models/AdminLog');

/**
 * Logs an administrative action to the database.
 * 
 * @param {string} adminId - ID of the admin performing the action
 * @param {string} action - Action type (e.g., 'UPDATE_ROLE')
 * @param {string} target - ID or description of the target entity
 * @param {object} details - Additional metadata about the change
 * @param {object} req - Express request object (optional, for IP)
 */
const logAdminAction = async (adminId, action, target, details = {}, req = null) => {
    try {
        const ip = req ? (req.headers['x-forwarded-for'] || req.connection.remoteAddress) : null;

        const log = new AdminLog({
            admin: adminId,
            action,
            target,
            details,
            ip
        });

        await log.save();
        console.log(`[Admin Log] ${action} on ${target} by ${adminId}`);
    } catch (err) {
        console.error('Failed to save admin log:', err);
        // Do not throw error to prevent blocking main flow
    }
};

module.exports = logAdminAction;

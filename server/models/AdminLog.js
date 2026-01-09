const mongoose = require('mongoose');

const AdminLogSchema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        uppercase: true // e.g., 'PROMOTE_USER', 'DELETE_COURSE'
    },
    target: {
        type: String, // Can be an ObjectId string or description
        required: true
    },
    details: {
        type: Object, // Flexible field for any extra data (e.g., oldRole, newRole)
        default: {}
    },
    ip: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('AdminLog', AdminLogSchema);

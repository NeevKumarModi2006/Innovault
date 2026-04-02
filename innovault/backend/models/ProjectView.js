const mongoose = require('mongoose');

const projectViewSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    viewerIdentifier: {
        type: String, // Handles both User IDs (logged-in) and IP addresses (guests)
        required: true
    },
    viewedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a single user/IP can only increment the view once per project
projectViewSchema.index({ projectId: 1, viewerIdentifier: 1 }, { unique: true });

module.exports = mongoose.model('ProjectView', projectViewSchema);

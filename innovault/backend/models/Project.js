const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    shortDescription: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    detailedDescription: {
        type: String, // Markdown supported
        required: true
    },
    techStack: [{
        type: String,
        trim: true
    }],
    logoUrl: {
        type: String,
        default: 'default-logo.png'
    },
    deploymentLink: {
        type: String,
        required: true,
        trim: true
    },
    sourceLink: {
        type: String,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'archived'],
        default: 'active'
    },
    // Metrics
    views: {
        type: Number,
        default: 0
    },
    bookmarksCount: {
        type: Number,
        default: 0
    },
    // Cached Ratings (Updated via hook or cron)
    averageRating: {
        type: Number,
        default: 0
    },
    verifiedRating: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for search
projectSchema.index({ title: 'text', shortDescription: 'text', detailedDescription: 'text' });


module.exports = mongoose.model('Project', projectSchema);

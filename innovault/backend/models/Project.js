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
    // Cached Ratings (updated via aggregation on review post)
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

// Full-text search index
projectSchema.index({ title: 'text', shortDescription: 'text', detailedDescription: 'text' });

// Compound indexes for all sort + filter patterns used in GET /projects
projectSchema.index({ status: 1, createdAt: -1 });       // default sort
projectSchema.index({ status: 1, averageRating: -1 });   // sort=rating
projectSchema.index({ status: 1, views: -1 });           // sort=views
projectSchema.index({ techStack: 1 });                    // techStack filter

module.exports = mongoose.model('Project', projectSchema);


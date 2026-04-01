const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 500
    },
    pros: {
        type: String,
        trim: true,
        maxlength: 500
    },
    cons: {
        type: String,
        trim: true,
        maxlength: 500
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    updatedAt: {
        type: Date
    },
    isVerifiedRating: {
        type: Boolean,
        default: false,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure one review per user per project
reviewSchema.index({ user: 1, project: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);

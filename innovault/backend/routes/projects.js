const router = require('express').Router();
const mongoose = require('mongoose');
const Project = require('../models/Project');
const User = require('../models/User');
const Review = require('../models/Review');
const verify = require('../middleware/verifyToken');

// GET All Projects — Paginated, Filtered, Sorted
router.get('/', async (req, res) => {
    try {
        const { search, techStack, sort, page = 1, limit = 20 } = req.query;
        let query = { status: 'active' };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { shortDescription: { $regex: search, $options: 'i' } },
                { techStack: { $regex: search, $options: 'i' } }
            ];
        }

        if (techStack) {
            const regexTags = techStack.split(',').map(t => new RegExp('^' + t.trim() + '$', 'i'));
            query.techStack = { $in: regexTags };
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'rating') sortOption = { averageRating: -1 };
        if (sort === 'views') sortOption = { views: -1 };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Project.countDocuments(query);

        // Projection: omit large detailedDescription field on list view
        const projects = await Project.find(query)
            .select('-detailedDescription')
            .populate('owner', 'username role profilePicture')
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            projects,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET Single Project (full fields)
router.get('/:id', async (req, res) => {
    try {
        // Simply fetch the project without incrementing to prevent +2 dev mode bug
        const project = await Project.findById(req.params.id)
            .populate('owner', 'username role profilePicture bio');

        if (!project) return res.status(404).json({ message: 'Project not found' });

        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT Increment View
router.put('/:id/view', async (req, res) => {
    try {
        await Project.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const upload = require('../middleware/upload');
const rateLimit = require('express-rate-limit');

// Strict Rate Limiting: Max 20 submits/edits per day per IP
const projectSubmitLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, default: false },
    message: { message: 'Daily limit of 20 project submissions/edits reached. Please try again tomorrow.' }
});

// POST Create Project (Verified Only)
router.post('/', verify, projectSubmitLimiter, upload.single('logo'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user.role !== 'VERIFIED' && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Only verified NITW users can post projects.' });
        }

        // Parse techStack if it came as a comma-separated string from FormData
        let parsedTechStack = req.body.techStack;
        if (typeof parsedTechStack === 'string') {
            parsedTechStack = parsedTechStack.split(',').map(t => t.trim()).filter(t => t);
        }

        const project = new Project({
            ...req.body,
            techStack: parsedTechStack,
            owner: req.user._id,
            logoUrl: req.file ? req.file.filename : 'default-logo.png'
        });

        const savedProject = await project.save();
        res.json(savedProject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT Edit Project
router.put('/:id', verify, projectSubmitLimiter, upload.single('logo'), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found.' });

        // Verify Owner
        if (project.owner.toString() !== req.user._id) {
            return res.status(403).json({ message: 'You are not authorized to edit this project.' });
        }

        // Parse techStack
        let parsedTechStack = req.body.techStack;
        if (typeof parsedTechStack === 'string') {
            parsedTechStack = parsedTechStack.split(',').map(t => t.trim()).filter(t => t);
        }

        const updatedData = {
            ...req.body,
            techStack: parsedTechStack || project.techStack
        };

        if (req.file) {
            updatedData.logoUrl = req.file.filename;
        }

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: updatedData },
            { new: true }
        );

        res.json(updatedProject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE Project
router.delete('/:id', verify, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found.' });

        if (project.owner.toString() !== req.user._id) {
            return res.status(403).json({ message: 'You are not authorized to delete this project.' });
        }

        await Project.findByIdAndDelete(req.params.id);
        // Ideally we would also clean up Reviews, but deleting the project acts as a soft-cascade for UI since reviews query by projectId
        res.json({ message: 'Project deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST/PUT Review (Upsert Dual Tier Logic)
router.post('/:id/reviews', verify, async (req, res) => {
    try {
        const { rating, comment, pros, cons } = req.body;
        const projectId = req.params.id;
        const userId = req.user._id;

        const user = await User.findById(userId);
        const projectRecord = await Project.findById(projectId);

        if (!projectRecord) return res.status(404).json({ message: 'Project not found.' });
        if (projectRecord.owner.toString() === userId.toString()) {
            return res.status(403).json({ message: "You cannot review your own project." });
        }

        const isVerifiedRating = user.role === 'VERIFIED';

        let review = await Review.findOne({ user: userId, project: projectId });
        if (review) {
            // Update existing review
            review.rating = rating;
            review.comment = comment;
            review.pros = pros;
            review.cons = cons;
            review.isEdited = true;
            review.updatedAt = Date.now();
            await review.save();
        } else {
            // Create new review
            review = new Review({
                user: userId,
                project: projectId,
                rating,
                comment,
                pros,
                cons,
                isVerifiedRating
            });
            await review.save();
        }

        // Recalculate Project Ratings (Aggregation)
        const stats = await Review.aggregate([
            { $match: { project: review.project } },
            {
                $group: {
                    _id: '$project',
                    avgRating: { $avg: '$rating' },
                    avgVerifiedRating: {
                        $avg: {
                            $cond: [{ $eq: ['$isVerifiedRating', true] }, '$rating', null]
                        }
                    }
                }
            }
        ]);

        if (stats.length > 0) {
            await Project.findByIdAndUpdate(projectId, {
                averageRating: stats[0].avgRating || 0,
                verifiedRating: stats[0].avgVerifiedRating || 0
            });
        }

        res.json(review);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE Review
router.delete('/:id/reviews', verify, async (req, res) => {
    try {
        const projectId = req.params.id;
        const userId = req.user._id;

        const deletedReview = await Review.findOneAndDelete({ user: userId, project: projectId });
        if (!deletedReview) return res.status(404).json({ message: 'Review not found.' });

        // Recalculate Project Ratings (Aggregation)
        const stats = await Review.aggregate([
            { $match: { project: new mongoose.Types.ObjectId(projectId) } },
            {
                $group: {
                    _id: '$project',
                    avgRating: { $avg: '$rating' },
                    avgVerifiedRating: {
                        $avg: {
                            $cond: [{ $eq: ['$isVerifiedRating', true] }, '$rating', null]
                        }
                    }
                }
            }
        ]);

        if (stats.length > 0) {
            await Project.findByIdAndUpdate(projectId, {
                averageRating: stats[0].avgRating || 0,
                verifiedRating: stats[0].avgVerifiedRating || 0
            });
        } else {
            // Reset if no reviews left
            await Project.findByIdAndUpdate(projectId, {
                averageRating: 0,
                verifiedRating: 0
            });
        }

        res.json({ message: 'Review deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET Bookmarked Projects
router.get('/bookmarked/me', verify, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'bookmarks',
            populate: { path: 'owner', select: 'username role profilePicture' }
        });
        res.json(user.bookmarks || []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET my review for a Project
router.get('/:id/my-review', verify, async (req, res) => {
    try {
        const review = await Review.findOne({ project: req.params.id, user: req.user._id })
            .populate('user', 'username role profilePicture');
        res.json(review);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET Reviews for a Project
router.get('/:id/reviews', async (req, res) => {
    try {
        const { page = 1, limit = 20, sort, filter } = req.query;
        const projectId = req.params.id;
        let query = { project: projectId };

        if (filter === 'verifiedOnly') {
            query.isVerifiedRating = true;
        } else if (filter && filter.startsWith('rating-')) {
            query.rating = parseInt(filter.split('-')[1]);
        }

        // Sort option defaults to Highest Rating then Newest as per user instructions
        let sortOption = { rating: -1, createdAt: -1 };
        if (sort === 'lowest') sortOption = { rating: 1, createdAt: -1 };
        if (sort === 'recent') sortOption = { createdAt: -1 };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Review.countDocuments({ project: projectId });
        const filteredTotal = await Review.countDocuments(query);

        const reviews = await Review.find(query)
            .populate('user', 'username role profilePicture')
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        // Background aggregation for overall project stats regardless of filter
        const statsAggregation = await Review.aggregate([
            { $match: { project: new mongoose.Types.ObjectId(projectId) } },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    totalVerified: { $sum: { $cond: [{ $eq: ['$isVerifiedRating', true] }, 1, 0] } },
                    avgRating: { $avg: '$rating' },
                    avgVerified: { $avg: { $cond: [{ $eq: ['$isVerifiedRating', true] }, '$rating', null] } },
                    star5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                    star4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                    star3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                    star2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                    star1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
                }
            }
        ]);

        const stats = statsAggregation.length > 0 ? statsAggregation[0] : {
            totalReviews: 0, totalVerified: 0, avgRating: 0, avgVerified: 0,
            star5: 0, star4: 0, star3: 0, star2: 0, star1: 0
        };

        res.json({
            reviews,
            stats,
            pagination: {
                total,
                filteredTotal,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(filteredTotal / parseInt(limit))
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Toggle Bookmark
router.put('/:id/bookmark', verify, async (req, res) => {
    try {
        const projectId = req.params.id;
        const userId = req.user._id;

        const user = await User.findById(userId);
        const index = user.bookmarks.indexOf(projectId);

        if (index === -1) {
            user.bookmarks.push(projectId);
            await Project.findByIdAndUpdate(projectId, { $inc: { bookmarksCount: 1 } });
        } else {
            user.bookmarks.splice(index, 1);
            await Project.findByIdAndUpdate(projectId, { $inc: { bookmarksCount: -1 } });
        }

        await user.save();
        res.json(user.bookmarks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

const router = require('express').Router();
const Project = require('../models/Project');
const User = require('../models/User');
const Review = require('../models/Review');
const verify = require('../middleware/verifyToken');

// GET All Projects (Search & Filter)
router.get('/', async (req, res) => {
    try {
        const { search, techStack, sort } = req.query;
        let query = { status: 'active' };

        if (search) {
            query.$text = { $search: search };
        }

        if (techStack) {
            query.techStack = { $in: techStack.split(',') };
        }

        let sortOption = { createdAt: -1 }; // Default: Newest
        if (sort === 'rating') sortOption = { averageRating: -1 };
        if (sort === 'views') sortOption = { views: -1 };

        const projects = await Project.find(query)
            .populate('owner', 'username role profilePicture')
            .sort(sortOption);

        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET Single Project
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('owner', 'username role profilePicture bio');
        
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Increment Views (Basic implementation)
        project.views += 1;
        await project.save();

        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const upload = require('../middleware/upload');

// POST Create Project (Verified Only)
router.post('/', verify, upload.single('logo'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user.role !== 'VERIFIED' && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Only verified NITW users can post projects.' });
        }

        const project = new Project({
            ...req.body,
            owner: req.user._id,
            logoUrl: req.file ? req.file.filename : 'default-logo.png'
        });

        const savedProject = await project.save();
        res.json(savedProject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST Review (Dual Tier Logic)
router.post('/:id/reviews', verify, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const projectId = req.params.id;
        const userId = req.user._id;

        // Check if user already reviewed
        const existingReview = await Review.findOne({ user: userId, project: projectId });
        if (existingReview) return res.status(400).json({ message: 'You have already reviewed this project.' });

        // Get User Role for Dual Rating
        const user = await User.findById(userId);
        const isVerifiedRating = user.role === 'VERIFIED';

        const review = new Review({
            user: userId,
            project: projectId,
            rating,
            comment,
            isVerifiedRating
        });

        await review.save();

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

// GET Reviews for a Project
router.get('/:id/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ project: req.params.id })
            .populate('user', 'username role profilePicture')
            .sort({ createdAt: -1 });
        res.json(reviews);
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
            // Add bookmark
            user.bookmarks.push(projectId);
            await Project.findByIdAndUpdate(projectId, { $inc: { bookmarksCount: 1 } });
        } else {
            // Remove bookmark
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

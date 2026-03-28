const router = require('express').Router();
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
            query.techStack = { $in: techStack.split(',').map(t => t.trim()) };
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
        // Atomic view increment — no full document read+write
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        ).populate('owner', 'username role profilePicture bio');

        if (!project) return res.status(404).json({ message: 'Project not found' });

        res.json(project);
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

// POST Review (Dual Tier Logic)
router.post('/:id/reviews', verify, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const projectId = req.params.id;
        const userId = req.user._id;

        const existingReview = await Review.findOne({ user: userId, project: projectId });
        if (existingReview) return res.status(400).json({ message: 'You have already reviewed this project.' });

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

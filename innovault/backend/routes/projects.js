const router = require('express').Router();
const Project = require('../models/Project');
const verify = require('../middleware/auth');

// Get All Projects for User
router.get('/', verify, async (req, res) => {
    try {
        const projects = await Project.find({ owner: req.user._id }).sort({ updatedAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create New Project
router.post('/', verify, async (req, res) => {
    const project = new Project({
        title: req.body.title,
        description: req.body.description,
        type: req.body.type,
        owner: req.user._id
    });

    try {
        const savedProject = await project.save();
        res.json(savedProject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete Project
router.delete('/:id', verify, async (req, res) => {
    try {
        // Ensure user owns the project
        const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

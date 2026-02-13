const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Subject = require('../models/Subject');
const { isAuthenticated } = require('../middleware/auth');

// Get all tasks for logged-in user
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.session.userId })
            .populate('subjectId', 'name color')
            .sort({ date: -1, createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get today's tasks
router.get('/today', isAuthenticated, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const tasks = await Task.find({
            userId: req.session.userId,
            date: { $gte: today, $lt: tomorrow }
        }).populate('subjectId', 'name color');

        // Calculate progress
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.completed).length;
        const totalHours = tasks.reduce((sum, t) => sum + t.duration, 0);
        const completedHours = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.duration, 0);
        const remainingHours = totalHours - completedHours;

        res.json({
            tasks,
            stats: {
                totalTasks,
                completedTasks,
                totalHours: totalHours.toFixed(1),
                completedHours: completedHours.toFixed(1),
                remainingHours: remainingHours.toFixed(1),
                completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new task
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { subjectId, title, date, duration } = req.body;

        const task = new Task({
            userId: req.session.userId,
            subjectId,
            title,
            date,
            duration
        });

        await task.save();
        await task.populate('subjectId', 'name color');
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update task (mark as complete/incomplete)
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const { completed } = req.body;

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.session.userId },
            {
                completed,
                completedAt: completed ? new Date() : null
            },
            { new: true }
        ).populate('subjectId', 'name color');

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete task
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            userId: req.session.userId
        });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

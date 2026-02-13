const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { isAuthenticated } = require('../middleware/auth');

// Get all subjects for logged-in user
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const subjects = await Subject.find({ userId: req.session.userId }).sort({ createdAt: -1 });
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new subject
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { name, dailyTargetHours, examDate, color } = req.body;

        const subject = new Subject({
            userId: req.session.userId,
            name,
            dailyTargetHours,
            examDate,
            color: color || '#6366f1'
        });

        await subject.save();
        res.status(201).json(subject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update subject
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const { name, dailyTargetHours, examDate, color } = req.body;

        const subject = await Subject.findOneAndUpdate(
            { _id: req.params.id, userId: req.session.userId },
            { name, dailyTargetHours, examDate, color },
            { new: true, runValidators: true }
        );

        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.json(subject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete subject
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const subject = await Subject.findOneAndDelete({
            _id: req.params.id,
            userId: req.session.userId
        });

        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get AI study time suggestions
router.get('/ai-suggestions', isAuthenticated, async (req, res) => {
    try {
        const subjects = await Subject.find({ userId: req.session.userId });

        if (subjects.length === 0) {
            return res.json({ suggestions: [], message: 'Add subjects to get AI suggestions' });
        }

        const suggestions = subjects.map(subject => {
            const today = new Date();
            const examDate = new Date(subject.examDate);
            const daysUntilExam = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));

            let suggestion = '';
            let recommendedHours = subject.dailyTargetHours;

            if (daysUntilExam < 0) {
                suggestion = 'Exam has passed. Consider updating the exam date.';
            } else if (daysUntilExam <= 7) {
                recommendedHours = Math.min(subject.dailyTargetHours * 1.5, 8);
                suggestion = `⚠️ Only ${daysUntilExam} days left! Increase study time to ${recommendedHours.toFixed(1)} hours/day. Focus on revision and practice tests.`;
            } else if (daysUntilExam <= 14) {
                recommendedHours = Math.min(subject.dailyTargetHours * 1.2, 6);
                suggestion = `📚 ${daysUntilExam} days remaining. Suggested ${recommendedHours.toFixed(1)} hours/day. Start intensive revision.`;
            } else if (daysUntilExam <= 30) {
                suggestion = `✅ ${daysUntilExam} days to prepare. Current target of ${subject.dailyTargetHours} hours/day is good. Maintain consistency.`;
            } else {
                suggestion = `📖 ${daysUntilExam} days available. ${subject.dailyTargetHours} hours/day is perfect for steady progress.`;
            }

            return {
                subjectId: subject._id,
                subjectName: subject.name,
                daysUntilExam,
                currentTarget: subject.dailyTargetHours,
                recommendedHours: recommendedHours.toFixed(1),
                suggestion
            };
        });

        res.json({ suggestions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

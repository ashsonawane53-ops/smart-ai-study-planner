const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const { isAuthenticated } = require('../middleware/auth');

// Generate Questions Route
router.post('/generate-questions', isAuthenticated, async (req, res) => {
    try {
        const { subject, topic, count, difficulty } = req.body;
        const academicLevel = req.session.academicLevel || 'Class 10';

        if (!subject || !topic) {
            return res.status(400).json({ error: 'Subject and topic are required' });
        }

        const questions = await aiService.generateQuestions(subject, topic, count, difficulty, academicLevel);
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate Study Plan Route
router.post('/generate-plan', isAuthenticated, async (req, res) => {
    try {
        const { subjects, availableHours, examDate } = req.body;
        const academicLevel = req.session.academicLevel || 'Class 10';

        if (!subjects || !subjects.length || !availableHours) {
            return res.status(400).json({ error: 'Subjects and available hours are required' });
        }

        const plan = await aiService.generateStudyPlan(subjects, availableHours, examDate, academicLevel);
        res.json(plan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

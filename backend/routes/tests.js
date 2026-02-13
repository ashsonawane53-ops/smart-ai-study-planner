const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const Subject = require('../models/Subject');
const { isAuthenticated } = require('../middleware/auth');

// Create new test
router.post('/create', isAuthenticated, async (req, res) => {
    try {
        const { subjectId, title, questions } = req.body;

        const test = new Test({
            userId: req.session.userId,
            subjectId,
            title,
            questions: questions.map(q => ({
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                userAnswer: null
            })),
            totalQuestions: questions.length
        });

        await test.save();

        // Return test without correct answers for taking the test
        const testForUser = {
            ...test.toObject(),
            questions: test.questions.map(q => ({
                _id: q._id,
                question: q.question,
                options: q.options
            }))
        };

        res.status(201).json(testForUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit test answers
router.post('/submit', isAuthenticated, async (req, res) => {
    try {
        const { testId, answers } = req.body;

        const test = await Test.findOne({
            _id: testId,
            userId: req.session.userId
        });

        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }

        if (test.completed) {
            return res.status(400).json({ error: 'Test already submitted' });
        }

        // Update user answers and calculate score
        let score = 0;
        test.questions.forEach((question, index) => {
            question.userAnswer = answers[index];
            if (question.userAnswer === question.correctAnswer) {
                score++;
            }
        });

        test.score = score;
        test.completed = true;
        test.completedAt = new Date();

        await test.save();
        await test.populate('subjectId', 'name');

        res.json({
            test,
            score,
            totalQuestions: test.totalQuestions,
            percentage: Math.round((score / test.totalQuestions) * 100)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get test history
router.get('/history', isAuthenticated, async (req, res) => {
    try {
        const tests = await Test.find({
            userId: req.session.userId,
            completed: true
        })
            .populate('subjectId', 'name color')
            .sort({ completedAt: -1 });

        res.json(tests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get tests for a specific subject
router.get('/subject/:subjectId', isAuthenticated, async (req, res) => {
    try {
        const tests = await Test.find({
            userId: req.session.userId,
            subjectId: req.params.subjectId
        }).sort({ createdAt: -1 });

        res.json(tests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

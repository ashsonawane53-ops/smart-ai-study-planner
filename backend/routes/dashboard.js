const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Test = require('../models/Test');
const Subject = require('../models/Subject');
const Revision = require('../models/Revision');
const { isAuthenticated } = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;

        // Get total study hours (from completed tasks)
        const completedTasks = await Task.find({ userId, completed: true });
        const totalStudyHours = completedTasks.reduce((sum, task) => sum + task.duration, 0);

        // Get today's tasks for completion percentage
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayTasks = await Task.find({
            userId,
            date: { $gte: today, $lt: tomorrow }
        });

        const todayCompletedTasks = todayTasks.filter(t => t.completed).length;
        const todayCompletionPercentage = todayTasks.length > 0
            ? Math.round((todayCompletedTasks / todayTasks.length) * 100)
            : 0;

        // Get upcoming tasks (next 7 days)
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const upcomingTasks = await Task.find({
            userId,
            date: { $gte: tomorrow, $lt: nextWeek },
            completed: false
        })
            .populate('subjectId', 'name color')
            .sort({ date: 1 })
            .limit(5);

        // Get test performance (last 10 tests)
        const recentTests = await Test.find({
            userId,
            completed: true
        })
            .populate('subjectId', 'name color')
            .sort({ completedAt: -1 })
            .limit(10);

        const testPerformance = recentTests.map(test => ({
            subject: test.subjectId.name,
            score: test.score,
            total: test.totalQuestions,
            percentage: Math.round((test.score / test.totalQuestions) * 100),
            date: test.completedAt
        }));

        const averageTestScore = recentTests.length > 0
            ? Math.round(
                recentTests.reduce((sum, test) =>
                    sum + (test.score / test.totalQuestions) * 100, 0
                ) / recentTests.length
            )
            : 0;

        // Get pending revisions
        const pendingRevisions = await Revision.find({
            userId,
            completed: false,
            nextRevisionDate: { $lte: new Date() }
        })
            .populate('subjectId', 'name color')
            .sort({ nextRevisionDate: 1 })
            .limit(5);

        // Get subject-wise study hours (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentCompletedTasks = await Task.find({
            userId,
            completed: true,
            completedAt: { $gte: thirtyDaysAgo }
        }).populate('subjectId', 'name color');

        const subjectWiseHours = {};
        recentCompletedTasks.forEach(task => {
            const subjectName = task.subjectId.name;
            if (!subjectWiseHours[subjectName]) {
                subjectWiseHours[subjectName] = {
                    name: subjectName,
                    hours: 0,
                    color: task.subjectId.color
                };
            }
            subjectWiseHours[subjectName].hours += task.duration;
        });

        const subjectStats = Object.values(subjectWiseHours).map(s => ({
            ...s,
            hours: parseFloat(s.hours.toFixed(1))
        }));

        res.json({
            totalStudyHours: totalStudyHours.toFixed(1),
            todayCompletionPercentage,
            todayTasks: {
                total: todayTasks.length,
                completed: todayCompletedTasks
            },
            upcomingTasks,
            testPerformance,
            averageTestScore,
            pendingRevisions: pendingRevisions.length,
            pendingRevisionsList: pendingRevisions,
            subjectStats
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

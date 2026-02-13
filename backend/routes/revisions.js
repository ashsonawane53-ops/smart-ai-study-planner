const express = require('express');
const router = express.Router();
const Revision = require('../models/Revision');
const { isAuthenticated } = require('../middleware/auth');

// Create new revision entry
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { subjectId, topic, studyDate } = req.body;

        const studyDateObj = new Date(studyDate);
        const nextRevisionDate = new Date(studyDateObj);
        nextRevisionDate.setDate(nextRevisionDate.getDate() + 3); // 3-day spaced repetition

        const revision = new Revision({
            userId: req.session.userId,
            subjectId,
            topic,
            studyDate: studyDateObj,
            nextRevisionDate
        });

        await revision.save();
        await revision.populate('subjectId', 'name color');
        res.status(201).json(revision);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get pending revisions (due today or overdue)
router.get('/pending', isAuthenticated, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const pendingRevisions = await Revision.find({
            userId: req.session.userId,
            completed: false,
            nextRevisionDate: { $lte: today }
        })
            .populate('subjectId', 'name color')
            .sort({ nextRevisionDate: 1 });

        res.json(pendingRevisions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark revision as complete
router.put('/:id/complete', isAuthenticated, async (req, res) => {
    try {
        const revision = await Revision.findOne({
            _id: req.params.id,
            userId: req.session.userId
        });

        if (!revision) {
            return res.status(404).json({ error: 'Revision not found' });
        }

        // Mark as complete and schedule next revision (7 days later for second revision)
        revision.completed = true;
        revision.completedAt = new Date();
        revision.revisionCount += 1;

        // Create next revision entry
        const nextRevisionDate = new Date();
        nextRevisionDate.setDate(nextRevisionDate.getDate() + 7);

        const nextRevision = new Revision({
            userId: req.session.userId,
            subjectId: revision.subjectId,
            topic: revision.topic,
            studyDate: revision.nextRevisionDate,
            nextRevisionDate,
            revisionCount: revision.revisionCount
        });

        await revision.save();
        await nextRevision.save();
        await nextRevision.populate('subjectId', 'name color');

        res.json({
            message: 'Revision completed',
            completedRevision: revision,
            nextRevision
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all revisions
router.get('/all', isAuthenticated, async (req, res) => {
    try {
        const revisions = await Revision.find({ userId: req.session.userId })
            .populate('subjectId', 'name color')
            .sort({ nextRevisionDate: 1 });

        res.json(revisions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

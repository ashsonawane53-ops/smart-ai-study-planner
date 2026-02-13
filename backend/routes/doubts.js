const express = require('express');
const router = express.Router();
const Doubt = require('../models/Doubt');
const { isAuthenticated } = require('../middleware/auth');

// AI-based doubt solver (mock implementation)
const generateAIResponse = (question) => {
    // Simple keyword-based response system
    const lowerQuestion = question.toLowerCase();

    // Math-related
    if (lowerQuestion.includes('derivative') || lowerQuestion.includes('differentiation')) {
        return "To find the derivative, use the power rule: d/dx(x^n) = n*x^(n-1). For example, the derivative of x² is 2x. For more complex functions, apply the chain rule, product rule, or quotient rule as needed.";
    }

    if (lowerQuestion.includes('integration') || lowerQuestion.includes('integral')) {
        return "Integration is the reverse of differentiation. The basic rule is ∫x^n dx = (x^(n+1))/(n+1) + C, where C is the constant of integration. Remember to add the constant C for indefinite integrals.";
    }

    // Physics-related
    if (lowerQuestion.includes('newton') || lowerQuestion.includes('force')) {
        return "Newton's laws of motion: 1) An object remains at rest or in uniform motion unless acted upon by a force. 2) F = ma (Force equals mass times acceleration). 3) For every action, there's an equal and opposite reaction.";
    }

    if (lowerQuestion.includes('energy') || lowerQuestion.includes('kinetic')) {
        return "Kinetic Energy (KE) = ½mv², where m is mass and v is velocity. Potential Energy (PE) = mgh, where g is gravitational acceleration and h is height. Total mechanical energy is conserved in the absence of friction.";
    }

    // Chemistry-related
    if (lowerQuestion.includes('periodic table') || lowerQuestion.includes('element')) {
        return "The periodic table organizes elements by atomic number. Elements in the same group (column) have similar chemical properties. The table is divided into metals, non-metals, and metalloids.";
    }

    if (lowerQuestion.includes('acid') || lowerQuestion.includes('base') || lowerQuestion.includes('ph')) {
        return "pH measures acidity/basicity on a scale of 0-14. pH < 7 is acidic, pH = 7 is neutral, pH > 7 is basic. Acids donate H+ ions, bases accept H+ ions. Common acids: HCl, H₂SO₄. Common bases: NaOH, KOH.";
    }

    // Programming-related
    if (lowerQuestion.includes('loop') || lowerQuestion.includes('iteration')) {
        return "Loops allow repeated execution of code. For loop: used when you know the number of iterations. While loop: used when the condition is checked before execution. Do-while: condition checked after execution. Choose based on your specific needs.";
    }

    if (lowerQuestion.includes('array') || lowerQuestion.includes('list')) {
        return "Arrays/Lists store multiple values in a single variable. Access elements using index (starting from 0). Common operations: add, remove, search, sort. Time complexity varies by operation and data structure.";
    }

    // General study tips
    if (lowerQuestion.includes('how to study') || lowerQuestion.includes('study tips')) {
        return "Effective study tips: 1) Use active recall instead of passive reading. 2) Practice spaced repetition. 3) Take regular breaks (Pomodoro technique). 4) Teach concepts to others. 5) Create mind maps. 6) Practice with past papers.";
    }

    // Default response
    return `Great question! Here's what I understand: ${question.substring(0, 50)}... 

To help you better, I suggest:
1. Break down the problem into smaller parts
2. Review the fundamental concepts related to this topic
3. Look for similar solved examples in your textbook
4. Practice related problems to strengthen understanding

If you need more specific help, try rephrasing your question with more context about what you're struggling with.`;
};

// Ask a doubt
router.post('/ask', isAuthenticated, async (req, res) => {
    try {
        const { question, subjectId } = req.body;

        if (!question || question.trim().length === 0) {
            return res.status(400).json({ error: 'Question cannot be empty' });
        }

        // Generate AI response
        const aiResponse = generateAIResponse(question);

        const doubt = new Doubt({
            userId: req.session.userId,
            subjectId: subjectId || null,
            question,
            aiResponse
        });

        await doubt.save();
        if (subjectId) {
            await doubt.populate('subjectId', 'name');
        }

        res.status(201).json(doubt);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get doubt history
router.get('/history', isAuthenticated, async (req, res) => {
    try {
        const doubts = await Doubt.find({ userId: req.session.userId })
            .populate('subjectId', 'name color')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(doubts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark doubt as helpful/not helpful
router.put('/:id/feedback', isAuthenticated, async (req, res) => {
    try {
        const { helpful } = req.body;

        const doubt = await Doubt.findOneAndUpdate(
            { _id: req.params.id, userId: req.session.userId },
            { helpful },
            { new: true }
        );

        if (!doubt) {
            return res.status(404).json({ error: 'Doubt not found' });
        }

        res.json(doubt);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

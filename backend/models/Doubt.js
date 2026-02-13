const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    },
    question: {
        type: String,
        required: true,
        trim: true
    },
    aiResponse: {
        type: String,
        required: true
    },
    helpful: {
        type: Boolean,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Doubt', doubtSchema);

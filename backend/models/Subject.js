const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    dailyTargetHours: {
        type: Number,
        required: true,
        min: 0.5,
        max: 12
    },
    examDate: {
        type: Date,
        required: true
    },
    color: {
        type: String,
        default: '#6366f1'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);

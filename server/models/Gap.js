const mongoose = require('mongoose');

const gapSchema = new mongoose.Schema({
    userId: {
        type: "String",
        required: true
    },
    question: String,
    response: String,
    confidence: Number,
    sources: [
        {
            title: String,
            folder: String,
            score: Number
        }
    ],
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gap', gapSchema);

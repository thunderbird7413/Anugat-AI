const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    userId: {
        type: "String",
        required: true
    },
    question: { type: String, required: true },
    response: { type: String, required: true },
    confidence: { type: Number },
    sources: [
        {
            title: String,
            folder: String,
            score: Number
        }
    ],
    timestamp: { type: Date, default: Date.now }
})

module.exports = mongoose.model("Chat", chatSchema);
// server/controllers/chatController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Content = require('../models/Content');
const Chat = require("../models/Chat");
const Gap = require("../models/Gap");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const MODEL_CONFIG = {
  EMBEDDING: "models/embedding-001", // fallback to stable model
  GENERATION: {
    DEFAULT: "gemini-1.5-pro",
    FALLBACK: "gemini-1.5-flash"
  },
  CONTEXT_LIMIT: 128000 // Tokens for 1.5-pro
};

// Enhanced similarity calculation with normalization
function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    console.error('Invalid embeddings:', { a, b });
    return 0;
  }

  const dotProduct = a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  return magnitudeA && magnitudeB
    ? Math.max(-1, Math.min(1, dotProduct / (magnitudeA * magnitudeB)))
    : 0;
}

async function getTextEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_CONFIG.EMBEDDING });
    const result = await model.embedContent({
      content: {
        parts: [{ text: text.slice(0, 2048) }]
      }
    });
    // console.log("result", result);
    return result.embedding.values;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    throw new Error('Failed to process question');
  }
}

exports.generateResponse = async (req, res) => {
  try {
    const { question } = req.body;
    // console.log(question);
    if (!question || typeof question !== 'string' || question.length > 500) {
      return res.status(400).json({ error: 'Invalid question format' });
    }

    const userId = req.user.id;
    // console.log("userId", userId);

    const questionEmbedding = await getTextEmbedding(question);
    const relevantContent = await Content.aggregate([
      {
        $vectorSearch: {
          queryVector: questionEmbedding,
          path: "embeddings",
          numCandidates: 150,
          limit: 5,
          index: "contentSemanticIndex",
          filter: { owner: userId }
        }
      },
      {
        $project: {
          title: 1,
          content: 1,
          folder: 1,
          similarity: {
            $meta: "vectorSearchScore"
          }
        }
      }
    ]).exec();
    // console.log("relevantContent", relevantContent);

    const context = relevantContent
      .filter(item => item.similarity > 0.45)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map(c => `[Source: ${c.title}]
    ${c.content}`)
      .join('\n\n');

    const generationModelName = context.length > 10000
      ? MODEL_CONFIG.GENERATION.DEFAULT
      : MODEL_CONFIG.GENERATION.FALLBACK;

    const model = genAI.getGenerativeModel({
      model: generationModelName,
      generationConfig: {
        temperature: 0.3,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024
      }
    });

    const prompt = `You are a university assistant. Use ONLY this context:
    ---
    ${context}
    ---
    Question: ${question}
    If the answer isn't in the context, say "I don't have that information."`;

    const result = await model.generateContent(prompt);
    const response = (await result.response).text();

    const baseConfidence = relevantContent[0]?.similarity || 0;
    const confidence = Math.min(100, Math.max(0, Math.round(baseConfidence * 90 + 10)));

    // Create chat history
    await Chat.create({
      userId,
      question,
      response: response.trim(),
      confidence,
      sources: relevantContent
        .filter(c => c.similarity > 0.5)
        .map(c => ({
          title: c.title,
          folder: c.folder,
          score: Math.round(c.similarity * 100)
        })),
      timestamp: new Date().toISOString()
    });

    // Create Gap section

    // Save gap if confidence is below 70
    if (confidence < 70) {
      await Gap.create({
        userId,
        question,
        response: response.trim(),
        confidence,
        sources: relevantContent
          .filter(c => c.similarity > 0.5)
          .map(c => ({
            title: c.title,
            folder: c.folder,
            score: Math.round(c.similarity * 100)
          })),
        timestamp: new Date()
      });
    }


    res.json({
      response: response.trim(),
      confidence,
      sources: relevantContent
        .filter(c => c.similarity > 0.5)
        .map(c => ({
          title: c.title,
          folder: c.folder,
          score: Math.round(c.similarity * 100)
        })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat Error:', error);
    const status = error.message.includes('API key') ? 401
      : error.message.includes('context') ? 413
        : 500;
    res.status(status).json({
      error: status === 401 ? 'Invalid API configuration'
        : status === 413 ? 'Context too large'
          : 'AI service unavailable'
    });
  }
};


exports.chatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id }).sort({ timestamp: -1 }).limit(50);
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
}
exports.gapSection = async (req, res) => {
  try {
    const gaps = await Gap.find({ userId: req.user.id }).sort({ timestamp: -1 });
    console.log(gaps);
    res.json(gaps);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gaps Section' });
  }
}

exports.deleteChat = async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete chat' });
  }
};
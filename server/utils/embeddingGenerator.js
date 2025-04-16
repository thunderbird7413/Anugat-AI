const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateEmbeddings = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    return null;
  }
};
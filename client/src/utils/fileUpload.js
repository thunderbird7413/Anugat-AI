const cloudinary = require('cloudinary').v2;
const { extractTextFromPdf } = require('./pdfExtractor');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadFile(file, type) {
  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: type === 'video' ? 'video' : 'auto'
    });
    
    // For PDFs, extract text
    let extractedText = '';
    if (type === 'pdf') {
      extractedText = await extractTextFromPdf(result.secure_url);
    }
    
    return {
      url: result.secure_url,
      content: extractedText
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

module.exports = { uploadFile };
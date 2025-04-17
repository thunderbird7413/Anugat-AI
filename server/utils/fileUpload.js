// const cloudinary = require('cloudinary').v2;
// const pdfParse = require('pdf-parse');
// const fs = require('fs/promises');

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
//   secure: true
// });

// exports.uploadFile = async (file, type) => {
//   try {
//     // 1. Handle PDF text extraction before upload
//     let extractedText = '';
//     if (type === 'pdf') {
//       const dataBuffer = await fs.readFile(file.path);
//       const data = await pdfParse(dataBuffer);
//       extractedText = data.text;
//     }

//     // 2. Configure Cloudinary upload options
//     const uploadOptions = {
//       resource_type: type === 'video' ? 'video' : 'auto',
//       access_mode: 'public',
//       public_id: `${Date.now()}-${file.originalname}`,
//       overwrite: false
//     };

//     // 3. Upload to Cloudinary
//     const result = await cloudinary.uploader.upload(file.path, uploadOptions);
    
//     // 4. Return unified response format
//     return {
//       url: result.secure_url,  // Always use secure_url
//       content: type === 'pdf' ? extractedText : ''
//     };

//   } catch (error) {
//     console.error('File upload error:', error);
//     throw new Error(`File upload failed: ${error.message}`);
//   }
// };

const cloudinary = require('cloudinary').v2;
const pdfParse = require('pdf-parse');
const fs = require('fs/promises');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

exports.uploadFile = async (file, type, folderPath) => {
  try {
    // 1. Handle PDF text extraction before upload
    let extractedText = '';
    if (type === 'pdf') {
      const dataBuffer = await fs.readFile(file.path);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    }
    
    // 2. Configure Cloudinary upload options with folder structure
    const uploadOptions = {
      resource_type: type === 'video' ? 'video' : 'auto',
      access_mode: 'public',
      public_id: `${Date.now()}-${file.originalname}`,
      overwrite: false,
      folder: folderPath // Add folder path to organize in Cloudinary
    };
    
    // 3. Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, uploadOptions);
        
    // 4. Return unified response format
    return {
      url: result.secure_url,  // Always use secure_url
      content: type === 'pdf' ? extractedText : ''
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};
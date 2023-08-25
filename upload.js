const cloudinary = require("cloudinary").v2;
require('dotenv').config(); // Load environment variables from .env file

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const resumePath = './resumes/Jyoti_Singh_MERN_Resume.pdf';

cloudinary.uploader.upload(resumePath, { resource_type: 'raw' })
  .then(result => {
    console.log("Cloudinary upload result:", result);
  })
  .catch(error => {
    console.error("Error uploading to Cloudinary:", error);
  });

// historyRoutes.js
const express = require('express');
const cloudinary = require('cloudinary').v2;
const HistoryModel = require('../Models/HistoryModel'); // Import your history model
const { saveUploadHistory } = require('../utils/AuthUtils');

const HistoryRouter = express.Router();


// Get upload history
HistoryRouter.get("/uploadHistory", async (req, res) => {
  try {
    // Retrieve upload history from your history model (replace with actual query)
    const history = await HistoryModel.find().sort({ uploadDate: -1 });

    const formattedHistory = history.map(item => ({
      userId: item.userId,
      uploadDate: item.uploadDate,
      resumeUrl: item.resumeUrl,
      viewUrl: cloudinary.url(item.publicId, { resource_type: 'raw', secure: true }), // Generate view URL
      downloadUrl: cloudinary.url(item.publicId, { resource_type: 'raw', secure: true, attachment: true }), // Generate download URL
    }));

    return res.status(200).json({
      status: 200,
      message: "Upload history retrieved successfully",
      data: formattedHistory,
    });
  } catch (error) {
    console.error("Error fetching upload history:", error);
    return res.status(500).json({
      status: 500,
      message: "Error fetching upload history",
      error: error.message,
    });
  }
});

// Define the route to save upload history
HistoryRouter.post("/saveUploadHistory/:userId",  async (req, res) => {
    try {
        const userId = req.params.userId;
        const cloudinaryResult = await cloudinary.uploader.upload(file.tempFilePath);

        await saveUploadHistory(userId, cloudinaryResult);

        return res.status(200).json({
            status: 200,
            message: "Upload history saved successfully",
        });
    } catch (error) {
        console.error("Error saving upload history:", error);
        return res.status(500).json({
            status: 500,
            message: "Error saving upload history",
            error: error.message,
        });
    }
});

module.exports = HistoryRouter;

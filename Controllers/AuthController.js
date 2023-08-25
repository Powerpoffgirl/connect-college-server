const express = require("express");
const bcrypt = require("bcryptjs");
const UserModel = require("../Models/UserModel"); // Adjust the path based on your project structure
const jwt = require("jsonwebtoken");
const authRouter = express.Router();
const { isAuth } = require("../Middlewares/AuthMiddleware");
const JWT_SECRET = process.env.JWT_SECRET
const multer = require("multer");
// const HistoryRouter = require('../Controllers/HistoryController');
const { saveUploadHistory } = require("../utils/AuthUtils");
const cloudinary = require('cloudinary').v2; 

authRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;
    console.log("REQUEST BODY", req.body);
    
    // Check if user with the same email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user document
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      userType,
    });

    console.log("NEW USER", newUser)
    try {
      const userDb = await newUser.save();
      console.log(userDb);
      return res.status(200).json({
        status: 200,
        message: "User Created Successfully",
        data: userDb,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Database error",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

authRouter.post("/login", async (req, res) => {
  console.log("REQUEST BODY LOGIN ", req.body)
  const { email, password , userType } = req.body;

  try {
    // Find the user by email
    console.log("USER TYPE", userType)
    const user = await UserModel.findOne({ email });

    console.log("USER", user)

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("-------BEFORE JWT--------", user._id, userType)
    // Create a JWT token
    const token = jwt.sign(
      { userId: user._id, userType: userType },
      JWT_SECRET, // Replace with your actual secret key
      { expiresIn: "1h" } // Token expiration time
    );

     // Session-based authentication
     req.session.isAuth = true;
     req.session.user = {
       email: user.email,
       userId: user._id,
     };
 
     console.log("TOKEN FROM LOGIN", token)
    // Respond with the logged-in user's data and token
    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    console.error("Login process error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

authRouter.get('/get_all_students', isAuth, async (req, res) => {
  try {
    console.log('Headers:', req.headers);
    // Extract the token from the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized: Token not provided',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token and extract user information
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userType = decodedToken.userType;
    
    // Check if the user is authorized to access this endpoint
    if (userType !== 'staff') {
      return res.status(403).json({
        status: 403,
        message: 'Forbidden: You do not have permission to access this endpoint',
      });
    }

    const students = await UserModel.find({ userType: 'student' });

    return res.status(200).json({
      status: 200,
      message: 'List of students retrieved successfully',
      data: students,
    });
  } catch (error) {
    console.error('Error fetching list of students:', error);
    return res.status(500).json({
      status: 500,
      message: 'Error fetching list of students',
      error: error.message,
    });
  }
});



// Update user including resume upload history
authRouter.put("/updateUser", isAuth, async (req, res) => {
  try {
    console.log("UPDATE USER", req.body)
    const {name, email} = req.body;
    const authorizationHeader = req.header('Authorization');
    if (!authorizationHeader) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized: Token not provided",
      });
    }
     const token = authorizationHeader.split(' ')[1];
      // Verify the token and extract user information
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decodedToken.userId;
      const { phoneNo, resume } = req.body;
      const file = req.files && req.files.resume;

    
    const updatedUserData = {
      phoneNo,
    };

    if (file) {
      try {
        const cloudinaryResult = await cloudinary.uploader.upload(file.tempFilePath);

        // Call the saveUploadHistory function to save the history entry
        await saveUploadHistory(userId,  cloudinaryResult);

        updatedUserData.resume = cloudinaryResult.secure_url;

      } catch (error) {
        console.error("Error uploading resume:", error);
        return res.status(500).json({
          status: 500,
          message: "Error uploading resume",
          error: error.message,
        });
      }
    }

    try {
      const userDb = await UserModel.findByIdAndUpdate(userId, updatedUserData, {
        new: true,
        runValidators: true,
      });

      console.log("UserDb:", userDb);

      return res.status(200).json({
        status: 200,
        message: "User Updated Successfully",
        data: userDb,
      });
    } catch (error) {
      console.error("Error updating user in the database:", error);
      return res.status(500).json({
        status: 500,
        message: "Database error",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      status: 500,
      message: "Error updating user",
      error: error.message,
    });
  }
});



authRouter.post("/logout", isAuth, async (req, res) => {
  try {
      if (req.err) {
        console.error("Error occurred during logout:", err);
        return res.status(500).json({
          status: 500,
          message: "Logout Unsuccessful",
          error: "Something went wrong during logout.",
        });
      }

      // Successful logout
      return res.status(200).json({
        status: 200,
        message: "Logout Successfully",
        data: req.user, // Use req.user instead of user
      });
      
    // });
  } catch (error) {
    // Catch any other unexpected errors during logout
    console.error("Error occurred during logout:", error);
    return res.status(500).json({
      status: 500,
      message: "Error Occurred",
      error: "Something went wrong during logout.",
    });
  }
});


module.exports = authRouter;

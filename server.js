const express = require("express");
const clc = require("cli-color");
require("dotenv").config();
const session = require("express-session");
const mongoDbSession = require("connect-mongodb-session")(session);
const authRouter = require("./Controllers/AuthController");
// file imports
const db = require("./db");
const fs = require("fs");
const bodyParser = require('body-parser');
const server = express();

const cors = require("cors");

const fileUpload = require('express-fileupload');
const HistoryRouter = require("./Controllers/HistoryController");
const cloudinary = require("cloudinary").v2          
const { isAuth } = require("./Middlewares/AuthMiddleware");

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const PORT = process.env.PORT || 8003;
// middlewares
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use(bodyParser.json())
server.use(fileUpload({
  useTempFiles:true
}))

const store = new mongoDbSession({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

server.use(
  cors({
    origin: "https://connect-college-server.onrender.com", // Replace with the actual origin of your React app
    credentials: true,
  })
);

server.use(
  session({
    secret: process.env.SECRECT_KEY,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// routes
server.get("/", (req, res) => {
  return res.send({
    status: 200,
    message: "Welcome to your connect-college App",
  });
});

server.use(authRouter);
server.use("/auth", authRouter);
server.use("/history", isAuth, HistoryRouter);
// server.use("/follow", isAuth, FollowRouter);

server.listen(PORT, (req, res) => {
  console.log(clc.yellow.underline(`Server is running on port ${PORT}`));
});

const validator = require("validator");
const HistoryModel = require("../Models/HistoryModel");
const cleanUpAndValidate = ({ name, email, password, type }) => {
  return new Promise((resolve, reject) => {
    if (!email || !password || !name  || !type) {
      reject("Missing credentials");
    }
    if (typeof email !== "string") {
      reject("Invalid Email");
    }
    if (typeof password !== "string") {
      reject("Invalid password");
    }
    if (password.length <= 2 || password.length > 25)
      reject("Password length should be 3-25");

    if (!validator.isEmail(email)) {
      reject("Invalid Email format");
    }
    resolve();
  });
};


/// Define the function to save upload history
const saveUploadHistory = async (userId, cloudinaryResult) => {
  try {
      const historyEntry = new HistoryModel({
          userId: userId,
          resumeUrl: cloudinaryResult.secure_url,
          publicId: cloudinaryResult.public_id,
      });

      await historyEntry.save();
  } catch (error) {
      console.error("Error saving upload history:", error);
      throw error;
  }
};

const registerUser=()=> {
  return new Promise(async (resolve, reject) => {
    const hashedPassword = await bcryptjs.hash(
      this.password,
      parseInt(process.env.SALT)
    );

    const user = new UserSchema({
      username: this.username,
      name: this.name,
      email: this.email,
      password: hashedPassword,
    });

    try {
      const userDb = await user.save();
      resolve(userDb);
    } catch (error) {
      reject(error);
    }
  });
}


module.exports = { cleanUpAndValidate, saveUploadHistory, registerUser };



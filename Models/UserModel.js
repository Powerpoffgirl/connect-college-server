const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: String,
  },
  resume: {
    type:Buffer,
  },
  userType: {
    type: String,
    enum: ["student", "staff"],
    required: true,
  }
});

const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;

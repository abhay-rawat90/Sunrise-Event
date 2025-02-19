const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  mobilenumber: Number,
  email: String,
  password: String,
});

const seuser = mongoose.model("seuser", userSchema);

module.exports = seuser;


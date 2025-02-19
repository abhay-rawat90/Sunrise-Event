const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serviceSchema = new Schema({
  title: String,
  description: String,
  price: Number,
});
const service = mongoose.model("service", serviceSchema);
module.exports = service;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    event: String,
    name: String,
    mobilenumber: Number,
    email: String,
    venue: String,
    guests: String,
    date: Date,
    anycustom: String,
    pay_id: String,
  });

  const booking = mongoose.model("booking", bookSchema);
  module.exports = booking;
  
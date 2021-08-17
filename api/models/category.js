const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  type: { type: String, unique: true, required: true }
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;

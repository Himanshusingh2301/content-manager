const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Section", sectionSchema);

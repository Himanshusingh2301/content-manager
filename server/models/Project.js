const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    color: { type: String, default: "#7c3aed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);

const mongoose = require("mongoose");

const editHistorySchema = new mongoose.Schema({
  body: { type: String, required: true },
  editedBy: { type: String, default: "unknown" },
  editedAt: { type: Date, default: Date.now },
});

const contentVariantSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    isActive: { type: Boolean, default: false },
    section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true, index: true },
    createdBy: { type: String, default: "unknown" },
    editHistory: { type: [editHistorySchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContentVariant", contentVariantSchema);

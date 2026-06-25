const router = require("express").Router();
const Section = require("../models/Section");
const ContentVariant = require("../models/ContentVariant");
const { protect } = require("../middleware/auth");

// POST create section under a project
router.post("/", protect, async (req, res) => {
  try {
    const { name, description, projectId } = req.body;
    if (!name || !projectId) return res.status(400).json({ message: "name and projectId are required" });
    const section = await Section.create({ name, description, project: projectId });
    res.status(201).json({ ...section.toObject(), variantCount: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single section with its variants
router.get("/:id", protect, async (req, res) => {
  try {
    const section = await Section.findById(req.params.id).populate("project", "name color");
    if (!section) return res.status(404).json({ message: "Section not found" });
    const variants = await ContentVariant.find({ section: req.params.id }).sort({ createdAt: -1 });
    res.json({ section, variants });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update section
router.put("/:id", protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    const section = await Section.findByIdAndUpdate(req.params.id, { name, description }, { new: true });
    if (!section) return res.status(404).json({ message: "Section not found" });
    res.json(section);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE section + its variants
router.delete("/:id", protect, async (req, res) => {
  try {
    await ContentVariant.deleteMany({ section: req.params.id });
    await Section.findByIdAndDelete(req.params.id);
    res.json({ message: "Section deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

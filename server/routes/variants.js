const router = require("express").Router();
const ContentVariant = require("../models/ContentVariant");
const { protect } = require("../middleware/auth");

// POST create variant
router.post("/", protect, async (req, res) => {
  try {
    const { title, body, sectionId } = req.body;
    if (!title || !body || !sectionId)
      return res.status(400).json({ message: "title, body and sectionId are required" });
    const variant = await ContentVariant.create({
      title, body, section: sectionId, createdBy: req.username,
    });
    res.status(201).json(variant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update variant (saves old body to history with username)
router.put("/:id", protect, async (req, res) => {
  try {
    const { title, body } = req.body;
    const variant = await ContentVariant.findById(req.params.id);
    if (!variant) return res.status(404).json({ message: "Variant not found" });

    if (body && body !== variant.body) {
      variant.editHistory.unshift({
        body: variant.body,
        editedBy: req.username,
        editedAt: new Date(),
      });
      if (variant.editHistory.length > 10) variant.editHistory = variant.editHistory.slice(0, 10);
      variant.body = body;
    }
    if (title) variant.title = title;
    await variant.save();
    res.json(variant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH toggle active (activates if inactive, deactivates if already active)
router.patch("/:id/activate", protect, async (req, res) => {
  try {
    const variant = await ContentVariant.findById(req.params.id);
    if (!variant) return res.status(404).json({ message: "Variant not found" });

    if (variant.isActive) {
      // Already active — deactivate it
      variant.isActive = false;
    } else {
      // Deactivate all others in same section, then activate this one
      await ContentVariant.updateMany({ section: variant.section }, { isActive: false });
      variant.isActive = true;
    }
    await variant.save();
    res.json(variant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE variant
router.delete("/:id", protect, async (req, res) => {
  try {
    await ContentVariant.findByIdAndDelete(req.params.id);
    res.json({ message: "Variant deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST restore history version
router.post("/:id/restore/:index", protect, async (req, res) => {
  try {
    const variant = await ContentVariant.findById(req.params.id);
    if (!variant) return res.status(404).json({ message: "Variant not found" });
    const idx = parseInt(req.params.index);
    const entry = variant.editHistory[idx];
    if (!entry) return res.status(404).json({ message: "History entry not found" });
    variant.editHistory.unshift({ body: variant.body, editedBy: req.username, editedAt: new Date() });
    variant.body = entry.body;
    if (variant.editHistory.length > 10) variant.editHistory = variant.editHistory.slice(0, 10);
    await variant.save();
    res.json(variant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

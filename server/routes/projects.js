const router = require("express").Router();
const Project = require("../models/Project");
const Section = require("../models/Section");
const ContentVariant = require("../models/ContentVariant");
const { protect } = require("../middleware/auth");

// GET all projects
router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    const withCounts = await Promise.all(
      projects.map(async (p) => {
        const sectionCount = await Section.countDocuments({ project: p._id });
        return { ...p.toObject(), sectionCount };
      })
    );
    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create project
router.post("/", protect, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    const project = await Project.create({ name, description, color });
    res.status(201).json({ ...project.toObject(), sectionCount: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update project
router.put("/:id", protect, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, color },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE project (cascades to sections + variants)
router.delete("/:id", protect, async (req, res) => {
  try {
    const sections = await Section.find({ project: req.params.id });
    for (const s of sections) {
      await ContentVariant.deleteMany({ section: s._id });
    }
    await Section.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET project with its sections
router.get("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    const sections = await Section.find({ project: req.params.id }).sort({ createdAt: -1 });
    const sectionsWithCounts = await Promise.all(
      sections.map(async (s) => {
        const variantCount = await ContentVariant.countDocuments({ section: s._id });
        return { ...s.toObject(), variantCount };
      })
    );
    res.json({ project, sections: sectionsWithCounts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

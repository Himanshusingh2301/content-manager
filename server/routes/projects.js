const router = require("express").Router();
const Project = require("../models/Project");
const Section = require("../models/Section");
const ContentVariant = require("../models/ContentVariant");
const { protect } = require("../middleware/auth");

// GET all projects — single aggregation instead of N+1 queries
router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.aggregate([
      { $sort: { createdAt: 1 } },
      {
        $lookup: {
          from: "sections",
          localField: "_id",
          foreignField: "project",
          as: "sections",
        },
      },
      {
        $addFields: { sectionCount: { $size: "$sections" } },
      },
      {
        $project: { sections: 0 },
      },
    ]);
    res.json(projects);
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
      { new: true, lean: true }
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE project — parallel deletion
router.delete("/:id", protect, async (req, res) => {
  try {
    const sections = await Section.find({ project: req.params.id }).lean().select("_id");
    const sectionIds = sections.map((s) => s._id);
    await Promise.all([
      ContentVariant.deleteMany({ section: { $in: sectionIds } }),
      Section.deleteMany({ project: req.params.id }),
    ]);
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single project with sections — single aggregation
router.get("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).lean();
    if (!project) return res.status(404).json({ message: "Project not found" });

    const sections = await Section.aggregate([
      { $match: { project: project._id } },
      { $sort: { createdAt: 1 } },
      {
        $lookup: {
          from: "contentvariants",
          localField: "_id",
          foreignField: "section",
          as: "variants",
        },
      },
      {
        $addFields: { variantCount: { $size: "$variants" } },
      },
      {
        $project: { variants: 0 },
      },
    ]);

    res.json({ project, sections });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

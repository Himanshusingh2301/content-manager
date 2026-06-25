const router = require("express").Router();
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// POST /api/auth/login
// Verifies company password, auto-creates user on first login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username and password are required" });

    if (password !== process.env.ACCESS_PASSWORD)
      return res.status(401).json({ message: "Wrong password" });

    const clean = username.trim().toLowerCase();
    if (!/^[a-z0-9_]+$/.test(clean))
      return res.status(400).json({ message: "Username can only contain letters, numbers and underscores" });

    // Upsert — create if new, return existing if already registered
    let user = await User.findOne({ username: clean });
    if (!user) {
      user = await User.create({ username: clean, displayName: username.trim() });
    }

    res.json({
      user: { id: user._id, username: user.username, displayName: user.displayName },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/users — list all users (protected)
router.get("/users", protect, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select("-__v");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

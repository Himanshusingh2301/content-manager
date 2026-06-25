const protect = (req, res, next) => {
  const password = req.headers["x-access-password"];
  if (!password || password !== process.env.ACCESS_PASSWORD) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // Attach username to request if provided
  req.username = req.headers["x-username"] || "unknown";
  next();
};

module.exports = { protect };

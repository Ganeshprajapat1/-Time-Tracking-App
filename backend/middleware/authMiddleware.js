const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Expected format: "Bearer <token>"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing." });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET is not configured." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Token payload created in authController.js: { userId, role }
    req.user = {
      id: decoded.userId,
      role: decoded.role
    };

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired." });
    }

    if (error.name === "JsonWebTokenError" || error.name === "NotBeforeError") {
      return res.status(401).json({ message: "Invalid token." });
    }

    return res.status(401).json({ message: "Unauthorized." });
  }
};

module.exports = {
  protect
};


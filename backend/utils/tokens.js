const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const hashToken = (raw) => crypto.createHash("sha256").update(raw).digest("hex");

const signAccessToken = (payload) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");
  const expiresIn = process.env.JWT_ACCESS_EXPIRES || "15m";
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

const signRefreshToken = (payload, expiresInOverride) => {
  if (!process.env.JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET missing");
  const expiresIn = expiresInOverride || process.env.JWT_REFRESH_EXPIRES || "7d";
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn });
};

const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);

const randomRawTokenHex = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

const otpSixDigits = () => crypto.randomInt(100000, 1000000).toString();

module.exports = {
  hashToken,
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  randomRawTokenHex,
  otpSixDigits
};

const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const PasswordResetToken = require("../models/PasswordResetToken");
const { validateStrongPassword } = require("../utils/password");
const {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  randomRawTokenHex,
  otpSixDigits
} = require("../utils/tokens");
const { sendMail } = require("../utils/email");

const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;
const RESET_MS = (process.env.PASSWORD_RESET_EXPIRES_MINUTES
  ? Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES)
  : 15) *
  60 *
  1000;

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  status: user.status,
  hourlyRate: user.hourlyRate,
  createdAt: user.createdAt
});

const issueTokens = async (user, rememberMe) => {
  const payload = { userId: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshExpires = rememberMe
    ? process.env.JWT_REFRESH_EXPIRES_REMEMBER || "30d"
    : process.env.JWT_REFRESH_EXPIRES || "7d";
  const refreshToken = signRefreshToken({ userId: user._id.toString() }, refreshExpires);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  return { accessToken, refreshToken };
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, termsAccepted } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
    if (!termsAccepted) {
      return res.status(400).json({ message: "You must accept the terms." });
    }

    const pwdErr = validateStrongPassword(password);
    if (pwdErr) return res.status(400).json({ message: pwdErr });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email is already registered." });

    const otp = otpSixDigits();
    const otpHash = hashToken(otp);
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      role: "Developer",
      termsAccepted: true,
      isVerified: false,
      emailVerificationOtpHash: otpHash,
      emailVerificationExpires: expires
    });

    await sendMail({
      to: email,
      subject: "Verify your email",
      text: `Your verification code is ${otp}. It expires in one hour.`
    });

    if (process.env.NODE_ENV !== "production") {
      return res.status(201).json({
        message: "Registered. Verify your email with the OTP sent.",
        devOtp: otp,
        user: buildUserResponse(user)
      });
    }

    return res.status(201).json({
      message: "Registered. Check your email for the verification code.",
      user: buildUserResponse(user)
    });
  } catch (err) {
    next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "email and otp are required." });
    }

    const user = await User.findOne({ email }).select(
      "+emailVerificationOtpHash +emailVerificationExpires"
    );
    if (!user || !user.emailVerificationOtpHash) {
      return res.status(400).json({ message: "Invalid verification request." });
    }
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ message: "OTP expired. Request a new one." });
    }
    if (hashToken(String(otp).trim()) !== user.emailVerificationOtpHash) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    const updated = await User.findByIdAndUpdate(
      user._id,
      {
        isVerified: true,
        $unset: { emailVerificationOtpHash: 1, emailVerificationExpires: 1 }
      },
      { new: true }
    );

    return res.status(200).json({ message: "Email verified.", user: buildUserResponse(updated) });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required." });
    }

    const user = await User.findOne({ email }).select(
      "+password +loginAttempts +lockUntil +refreshTokenHash +emailVerificationOtpHash"
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ message: "Account suspended." });
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(423).json({ message: "Account temporarily locked. Try again later." });
    }

    if (!user.googleId && !user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= MAX_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_MS);
        user.loginAttempts = 0;
      }
      await user.save();
      return res.status(401).json({ message: "Invalid email or password." });
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
    const tokens = await issueTokens(user, Boolean(rememberMe));

    return res.status(200).json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      token: tokens.accessToken,
      user: buildUserResponse(user)
    });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "refreshToken is required." });

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({ message: "Invalid refresh token." });
    }

    const user = await User.findById(decoded.userId).select("+refreshTokenHash");
    if (!user || !user.refreshTokenHash || hashToken(refreshToken) !== user.refreshTokenHash) {
      return res.status(401).json({ message: "Invalid refresh token." });
    }

    const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });
    return res.status(200).json({ accessToken, token: accessToken });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    const user = await User.findById(req.user.id).select("+refreshTokenHash");
    if (user) {
      user.refreshTokenHash = undefined;
      await user.save();
    }
    return res.status(200).json({ message: "Logged out." });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.status(200).json({ user: buildUserResponse(user) });
  } catch (err) {
    next(err);
  }
};

const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: "credential is required." });

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) return res.status(501).json({ message: "Google sign-in is not configured." });

    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token." });
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = await User.create({
        name: payload.name || email.split("@")[0],
        email,
        googleId,
        role: "Developer",
        isVerified: true,
        termsAccepted: true
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.isVerified = true;
      await user.save();
    }

    const tokens = await issueTokens(user, true);
    return res.status(200).json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      token: tokens.accessToken,
      user: buildUserResponse(user)
    });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = email ? await User.findOne({ email: String(email).toLowerCase() }) : null;

    if (user && user.googleId && !user.password) {
      return res.status(200).json({
        message: "If an account exists, password reset instructions were sent."
      });
    }

    if (user) {
      const raw = randomRawTokenHex(32);
      const tokenHash = hashToken(raw);
      await PasswordResetToken.updateMany({ userId: user._id, usedAt: null }, { usedAt: new Date() });
      await PasswordResetToken.create({
        userId: user._id,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_MS)
      });
      const base = process.env.FRONTEND_URL || "http://localhost:5173";
      const link = `${base}/reset-password?token=${raw}`;
      await sendMail({
        to: user.email,
        subject: "Password reset",
        text: `Reset your password (valid ${RESET_MS / 60000} minutes): ${link}`
      });
    }

    return res.status(200).json({
      message: "If an account exists, password reset instructions were sent."
    });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body;
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ message: "token, password, and confirmPassword are required." });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
    const pwdErr = validateStrongPassword(password);
    if (pwdErr) return res.status(400).json({ message: pwdErr });

    const tokenHash = hashToken(String(token).trim());
    const record = await PasswordResetToken.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() }
    });

    if (!record) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    const user = await User.findById(record.userId).select("+password");
    if (!user) return res.status(400).json({ message: "User not found." });

    user.password = password;
    user.refreshTokenHash = undefined;
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    record.usedAt = new Date();
    await record.save();

    return res.status(200).json({ message: "Password updated. You can log in." });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All password fields are required." });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
    const pwdErr = validateStrongPassword(newPassword);
    if (pwdErr) return res.status(400).json({ message: pwdErr });

    const user = await User.findById(req.user.id).select("+password");
    if (!user || !user.password) {
      return res.status(400).json({ message: "Password login not available for this account." });
    }
    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(400).json({ message: "Current password is incorrect." });

    user.password = newPassword;
    user.refreshTokenHash = undefined;
    await user.save();
    return res.status(200).json({ message: "Password updated." });
  } catch (err) {
    next(err);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "email is required." });
    const user = await User.findOne({ email }).select("+emailVerificationOtpHash");
    if (!user || user.isVerified) {
      return res.status(200).json({ message: "If eligible, a new code was sent." });
    }
    const otp = otpSixDigits();
    user.emailVerificationOtpHash = hashToken(otp);
    user.emailVerificationExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    await sendMail({
      to: user.email,
      subject: "Verify your email",
      text: `Your verification code is ${otp}. It expires in one hour.`
    });
    if (process.env.NODE_ENV !== "production") {
      return res.status(200).json({ message: "OTP sent.", devOtp: otp });
    }
    return res.status(200).json({ message: "OTP sent." });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  me,
  googleAuth,
  forgotPassword,
  resetPassword,
  resendVerification,
  changePassword
};

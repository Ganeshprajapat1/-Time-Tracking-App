const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;

const validateStrongPassword = (password) => {
  if (!password || typeof password !== "string") {
    return "Password is required.";
  }
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!strongPasswordRegex.test(password)) {
    return "Password must include uppercase, lowercase, number, and special character.";
  }
  return null;
};

module.exports = { validateStrongPassword, strongPasswordRegex };

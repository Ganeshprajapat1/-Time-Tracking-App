import api from "./apiClient";

export const register = (body) => api.post("/api/auth/register", body);

export const verifyEmail = (body) => api.post("/api/auth/verify-email", body);

export const resendVerification = (body) => api.post("/api/auth/resend-verification", body);

export const login = (body) => api.post("/api/auth/login", body);

export const googleLogin = (body) => api.post("/api/auth/google", body);

export const forgotPassword = (body) => api.post("/api/auth/forgot-password", body);

export const resetPassword = (body) => api.post("/api/auth/reset-password", body);

export const logout = () => api.post("/api/auth/logout");

export const me = () => api.get("/api/auth/me");

export const changePassword = (body) => api.put("/api/auth/change-password", body);

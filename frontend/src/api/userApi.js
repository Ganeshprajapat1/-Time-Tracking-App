import api from "./apiClient";

export const listDevelopers = () => api.get("/api/users/developers");

export const listUsers = () => api.get("/api/users");

export const updateUserRole = (userId, role) => api.patch(`/api/users/${userId}/role`, { role });

export const updateUserStatus = (userId, status) => api.patch(`/api/users/${userId}/status`, { status });

export const deleteUser = (userId) => api.delete(`/api/users/${userId}`);

export const updateProfile = (userId, body) => api.patch(`/api/users/${userId}/profile`, body);

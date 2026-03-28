import api from "./apiClient";

export const getNotifications = (params) => api.get("/api/notifications", { params });

export const simulateIdle = (body) => api.post("/api/notifications/idle-sim", body);

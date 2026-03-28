import api from "./apiClient";

export const listModules = (projectId) => api.get("/api/modules", { params: { projectId } });

export const createModule = (body) => api.post("/api/modules", body);

export const updateModule = (moduleId, body) => api.put(`/api/modules/${moduleId}`, body);

export const deleteModule = (moduleId) => api.delete(`/api/modules/${moduleId}`);

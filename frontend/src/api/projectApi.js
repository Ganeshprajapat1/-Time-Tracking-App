import api from "./apiClient";

export const getProjects = () => api.get("/api/projects");

export const getProjectById = (projectId) => api.get(`/api/projects/${projectId}`);

export const createProject = (data) =>  api.post("/api/projects", data);

export const updateProject = (id, data) =>  api.put(`/api/projects/${id}`, data);

export const deleteProject = (id) =>  api.delete(`/api/projects/${id}`);

export const createTask = (data) =>  api.post("/api/tasks", data);
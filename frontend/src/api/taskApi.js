import api from "./apiClient";

export const getTasks = (params = {}) => {
  const p = typeof params === "string" ? { projectId: params } : params;
  const { projectId, status, priority, moduleId } = p;
  const query = {};
  if (projectId && projectId !== "all") query.projectId = projectId;
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (moduleId) query.moduleId = moduleId;
  return api.get("/api/tasks", { params: query });
};

// GET SINGLE TASK
export const getTaskById = (taskId) =>
  api.get(`/api/tasks/${taskId}`);

// CREATE TASK (IMPORTANT)
export const createTask = (data) =>
  api.post("/api/tasks", data);

// UPDATE STATUS
export const updateTaskStatus = (taskId, status) =>
  api.put(`/api/tasks/${taskId}/status`, { status });

// ADD UPDATE NOTE
export const addTaskUpdate = (taskId, text) =>
  api.post(`/api/tasks/${taskId}/update`, { text });

// REQUEST HELP
export const requestHelp = (taskId) =>
  api.put(`/api/tasks/${taskId}/help`);

export const assignTask = (taskId, assignedTo) =>
  api.put(`/api/tasks/${taskId}/assign`, { assignedTo });

export const deleteTask = (taskId) => api.delete(`/api/tasks/${taskId}`);
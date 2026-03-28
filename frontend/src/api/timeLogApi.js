// import api from "./apiClient";

// export const startTimer = ({ taskId }) =>
//   api.post("/api/time-logs/start", { taskId });

// export const stopTimer = ({ timeLogId, taskId } = {}) =>
//   api.post("/api/time-logs/stop", { timeLogId, taskId });

// export const getLogsByUser = ({ userId, startDate, endDate }) =>
//   api.get(`/api/time-logs/user/${userId}`, { params: { startDate, endDate } });

// export const getLogsByTask = ({ taskId, startDate, endDate }) =>
//   api.get(`/api/time-logs/task/${taskId}`, { params: { startDate, endDate } });


import api from "./apiClient";

// START TIMER
export const startTimer = (data) =>
  api.post("/api/time-logs/start", data);

// STOP TIMER
export const stopTimer = (data) =>
  api.post("/api/time-logs/stop", data);

// GET USER LOGS
export const getLogsByUser = ({ userId, startDate, endDate } = {}) =>
  api.get(`/api/time-logs/user/${userId}`, {
    params: {
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    },
  });

// GET TASK LOGS
export const getLogsByTask = ({ taskId, startDate, endDate } = {}) =>
  api.get(`/api/time-logs/task/${taskId}`, {
    params: {
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    },
  });

export const listTimeLogs = (params) => api.get("/api/time-logs", { params });

export const createManualLog = (body) => api.post("/api/time-logs/manual", body);
import api from "./apiClient";

export const hoursPerProject = (params) => api.get("/api/reports/hours-per-project", { params });

export const hoursPerUser = (params) => api.get("/api/reports/hours-per-user", { params });

export const taskCompletionStats = (params) => api.get("/api/reports/task-completion-stats", { params });

export const productivityReport = (params) => api.get("/api/reports/productivity", { params });

export const exportReportsCsv = async (params) => {
  const res = await api.get("/api/reports/export/csv", { params, responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "time-logs.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

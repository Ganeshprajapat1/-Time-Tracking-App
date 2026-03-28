import api from "./apiClient";

export const billingSummary = (params) => api.get("/api/billing/summary", { params });

export const listInvoices = (params) => api.get("/api/billing/invoices", { params });

export const createInvoice = (body) => api.post("/api/billing/invoices", body);

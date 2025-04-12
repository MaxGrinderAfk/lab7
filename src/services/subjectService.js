import api from "./api";

export const createSubject = (data) => api.post("/subjects", data);
export const createSubjectsBulk = (data) => api.post("/subjects/bulk", data);
export const getSubjects = (params) => api.get("/subjects", { params });
export const getSubject = (id) => api.get(`/subjects/${id}`);
export const getSubjectByName = (name) => api.get(`/subjects/name/${name}`);
export const deleteSubject = (id) => api.delete(`/subjects/${id}`);
export const deleteSubjectByName = (name) => api.delete(`/subjects/name/${name}`);

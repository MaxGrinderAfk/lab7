import api from "./api";

export const createMark = (data) => api.post("/marks", data);
export const getMarks = (params) => api.get("/marks", { params });
export const deleteMark = (markId) => api.delete(`/marks/${markId}`);
export const getStudent = (id) => api.get(`/marks/students/${id}`);
export const getSubject = (id) => api.get(`/marks/subjects/${id}`);
export const getStudentByName = (name) => api.get(`/marks/students/name/${name}`);
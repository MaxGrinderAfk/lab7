import api from "./api";

export const createMark = (data) => api.post("/marks", data);
export const createMarksBulk = (data) => api.post("/marks/bulk", data);
export const getMarks = (params) => api.get("/marks", { params });
export const getMarksByValue = (value) => api.get(`/marks/value/${value}`);
export const getAverageByStudent = (studentId) => api.get(`/marks/average/student/${studentId}`);
export const getAverageBySubject = (subjectId) => api.get(`/marks/average/subject/${subjectId}`);
export const deleteSpecificMark = (params) =>
    api.delete("/marks/delete-specific", { params });
export const deleteMark = (markId) => api.delete(`/marks/${markId}`);
export const getStudent = (id) => api.get(`/marks/students/${id}`);
export const getSubject = (id) => api.get(`/marks/subjects/${id}`);

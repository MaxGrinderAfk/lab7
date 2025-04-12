import api from "./api";

export const createStudent = (data) => api.post("/students", data);
export const createStudentsBulk = (data) => api.post("/students/bulk", data);
export const getStudent = (studentId) => api.get(`/students/${studentId}`);
export const getStudents = (params) => api.get("/students", { params });
export const getStudentsByGroup = (groupId) => api.get(`/students/group/${groupId}`);
export const updateStudent = (studentId, name, age) => {
    return api.put(`/students/${studentId}?name=${encodeURIComponent(name)}&age=${encodeURIComponent(age)}`);
};
export const deleteStudent = (studentId) => api.delete(`/students/${studentId}`);

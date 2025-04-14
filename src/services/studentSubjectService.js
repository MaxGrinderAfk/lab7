import api from "./api";

export const getAllStudents = () => {
    return api.get("/student-subjects/students");
};

export const getAllSubjects = () => {
    return api.get("/student-subjects/subjects");
};

// Получение связей по имени
export const getSubjectsByStudentName = (studentName) => {
    return api.get(`/student-subjects/students/name/${encodeURIComponent(studentName)}/subjects`);
};

export const getStudentWithSubjects = (studentId) => {
    return api.get(`/student-subjects/student/${studentId}/with-subjects`);
};

// Управление связями по имени
export const addSubjectToStudentByNames = (studentName, subjectName) => {
    return api.post(`/student-subjects/students/name/${encodeURIComponent(studentName)}/subjects/name/${encodeURIComponent(subjectName)}`);
};

export const removeSubjectFromStudentByNames = (studentName, subjectName) => {
    return api.delete(`/student-subjects/students/name/${encodeURIComponent(studentName)}/subjects/name/${encodeURIComponent(subjectName)}`);
};
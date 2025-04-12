import api from "./api";

export const addSubjectToStudent = (studentId, subjectId) =>
    api.post("/student-subjects", null, { params: { studentId, subjectId } });

export const addSubjectsToStudentBulk = (studentId, subjectIds) =>
    api.post("/student-subjects/bulk", subjectIds, { params: { studentId } });

export const removeSubjectFromStudent = (studentId, subjectId) =>
    api.delete("/student-subjects", { params: { studentId, subjectId } });

export const getSubjectsByStudent = (studentId) =>
    api.get(`/student-subjects/${studentId}/subjects`);

export const getStudentsBySubject = (subjectId) =>
    api.get(`/student-subjects/${subjectId}/students`);

export const getStudentWithSubjects = (studentId) =>
    api.get(`/student-subjects/student/${studentId}/with-subjects`);

export const getSubjectWithStudents = (subjectId) =>
    api.get(`/student-subjects/subject/${subjectId}/with-students`);

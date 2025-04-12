import api from './api';

const API = "/groups";

export const getGroups = (params) => {
    return api.get(API, { params });
};

export const createGroup = (data) => {
    return api.post(API, data);
};

export const deleteGroup = (groupId) => {
    return api.delete(`${API}/${groupId}`);
};

export const getGroupById = (groupId) => {
    return api.get(`${API}/${groupId}`);
};
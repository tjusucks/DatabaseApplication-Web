import axios from 'axios';

const BASE_URL = '/api/safety/inspections';

export const getSafetyInspections = async (params) => {
  const response = await axios.get(BASE_URL, { params });
  return response.data;
};

export const addSafetyInspection = async (data) => {
  await axios.post(BASE_URL, data);
};

export const deleteSafetyInspection = async (id) => {
  await axios.delete(`${BASE_URL}/${id}`);
};
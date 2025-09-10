import axios from 'axios';

const BASE_URL = '/api/facilities';

export const getFacilities = async (params) => {
  const response = await axios.get(BASE_URL, { params });
  return response.data;
};

export const getFacilityDetail = async (id) => {
  const response = await axios.get(`${BASE_URL}/${id}`);
  return response.data;
};

export const getFacilityMonitoringData = async (id) => {
  const response = await axios.get(`${BASE_URL}/${id}/monitoring`);
  return response.data;
};
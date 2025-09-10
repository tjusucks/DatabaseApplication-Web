import axios from 'axios';

const BASE_URL_RECORDS = '/api/maintenance/records';
const BASE_URL_SCHEDULES = '/api/maintenance/schedules';

export const getMaintenanceRecords = async (params) => {
  const response = await axios.get(BASE_URL_RECORDS, { params });
  return response.data;
};

export const getMaintenanceRecordDetail = async (id) => {
  const response = await axios.get(`${BASE_URL_RECORDS}/${id}`);
  return response.data;
};

export const addMaintenanceRecord = async (data) => {
  await axios.post(BASE_URL_RECORDS, data);
};

export const getMaintenanceSchedules = async (params) => {
  const response = await axios.get(BASE_URL_SCHEDULES, { params });
  return response.data;
};

export const addMaintenanceSchedule = async (data) => {
  await axios.post(BASE_URL_SCHEDULES, data);
};

export const deleteMaintenanceSchedule = async (id) => {
  await axios.delete(`${BASE_URL_SCHEDULES}/${id}`);
};
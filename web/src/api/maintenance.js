import axios from 'axios'

const BASE_URL = '/api/resource/maintenance'

export const createMaintenanceRecord = async (data) => {
  const response = await axios.post(BASE_URL, data)
  return response.data
}

export const updateMaintenanceRecord = async (id, data) => {
  const response = await axios.put(`${BASE_URL}/${id}`, data)
  return response.data
}

export const deleteMaintenanceRecord = async (id) => {
  const response = await axios.delete(`${BASE_URL}/${id}`)
  return response.data
}

export const searchMaintenanceRecords = async (params) => {
  const response = await axios.get(`${BASE_URL}/search`, { params })
  return response.data
}

export const getMaintenanceStats = async (params) => {
  const response = await axios.get(`${BASE_URL}/stats`, { params })
  return response.data
}

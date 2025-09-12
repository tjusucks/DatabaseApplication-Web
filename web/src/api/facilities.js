import axios from 'axios'

export const createRide = async (data) => {
  const response = await axios.post('/api/resource/rides', data)
  return response.data
}

export const updateRide = async (id, data) => {
  const response = await axios.put(`/api/resource/rides/${id}`, data)
  return response.data
}

export const deleteRide = async (id) => {
  const response = await axios.delete(`/api/resource/rides/${id}`)
  return response.data
}

export const searchRides = async (params) => {
  const response = await axios.get('/api/resource/rides/search', { params })
  return response.data
}

export const getRideStats = async (params) => {
  const response = await axios.get('/api/resource/rides/stats', { params })
  return response.data
}

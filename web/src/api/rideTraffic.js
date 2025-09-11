import request from '@/utils/request'

// Ride Traffic API Service

/**
 * 获取所有游乐设施的实时流量数据
 */
export function getAllRealTimeRideTraffic() {
  return request({
    url: '/api/resource/ride-traffic/realtime',
    method: 'get',
  })
}

/**
 * 获取指定游乐设施的实时流量数据
 * @param {number} rideId 游乐设施ID
 */
export function getRealTimeRideTraffic(rideId) {
  return request({
    url: `/api/resource/ride-traffic/realtime/${rideId}`,
    method: 'get',
  })
}

/**
 * 根据游乐设施ID和记录时间获取流量数据
 * @param {number} rideId 游乐设施ID
 * @param {string} recordTime 记录时间
 */
export function getRideTrafficById(rideId, recordTime) {
  return request({
    url: `/api/resource/ride-traffic/${rideId}/${recordTime}`,
    method: 'get',
  })
}

/**
 * 搜索游乐设施流量数据
 * @param {Object} params 搜索参数
 */
export function searchRideTraffic(params) {
  return request({
    url: '/api/resource/ride-traffic/search',
    method: 'get',
    params,
  })
}

/**
 * 获取游乐设施流量统计数据
 * @param {Object} params 统计参数
 */
export function getRideTrafficStats(params) {
  return request({
    url: '/api/resource/ride-traffic/stats',
    method: 'get',
    params,
  })
}

/**
 * 更新所有游乐设施的流量数据
 * @param {Object} data 更新数据 {recordTime}
 */
export function updateAllRideTraffic(data) {
  return request({
    url: '/api/resource/ride-traffic/update',
    method: 'post',
    data,
  })
}

/**
 * 更新指定游乐设施的流量数据
 * @param {number} rideId 游乐设施ID
 * @param {Object} data 更新数据 {recordTime}
 */
export function updateRideTraffic(rideId, data) {
  return request({
    url: `/api/resource/ride-traffic/update/${rideId}`,
    method: 'post',
    data,
  })
}

/**
 * 获取或更新流量数据配置
 * @param {Object} data 配置数据
 */
export function updateRideTrafficConfig(data) {
  return request({
    url: '/api/resource/ride-traffic/update/config',
    method: 'post',
    data,
  })
}

/**
 * 获取流量数据配置
 */
export function getRideTrafficConfig() {
  return request({
    url: '/api/resource/ride-traffic/update/config',
    method: 'get',
  })
}

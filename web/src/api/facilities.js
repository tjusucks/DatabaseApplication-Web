import request from '@/utils/request'

// 游乐设施管理 API - 基于后端 /api/resource/rides 路径

/**
 * 创建游乐设施
 * @param {Object} data 设施数据
 */
export function createRide(data) {
  return request({
    url: '/api/resource/rides',
    method: 'post',
    data,
  })
}

/**
 * 更新游乐设施
 * @param {string|number} id 设施ID
 * @param {Object} data 更新数据
 */
export function updateRide(id, data) {
  return request({
    url: `/api/resource/rides/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除游乐设施
 * @param {string|number} id 设施ID
 */
export function deleteRide(id) {
  return request({
    url: `/api/resource/rides/${id}`,
    method: 'delete',
  })
}

/**
 * 搜索游乐设施，支持多条件筛选和分页
 * @param {Object} params 搜索参数
 */
export function searchRides(params) {
  return request({
    url: '/api/resource/rides/search',
    method: 'get',
    params,
  })
}

/**
 * 获取游乐设施统计数据
 * @param {Object} params 统计参数
 */
export function getRideStats(params) {
  return request({
    url: '/api/resource/rides/stats',
    method: 'get',
    params,
  })
}
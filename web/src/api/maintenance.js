import request from '@/utils/request'

// 维护记录管理 API

/**
 * 创建维护记录
 * @param {Object} data 记录数据
 */
export function createMaintenanceRecord(data) {
  return request({
    url: '/api/resource/maintenance',
    method: 'post',
    data,
  })
}

/**
 * 获取维护记录
 * @param {string} id 记录ID
 */
export function getMaintenanceRecord(id) {
  return request({
    url: `/api/resource/maintenance/${id}`,
    method: 'get',
  })
}

/**
 * 更新维护记录
 * @param {string} id 记录ID
 * @param {Object} data 更新数据
 */
export function updateMaintenanceRecord(id, data) {
  return request({
    url: `/api/resource/maintenance/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除维护记录
 * @param {string} id 记录ID
 */
export function deleteMaintenanceRecord(id) {
  return request({
    url: `/api/resource/maintenance/${id}`,
    method: 'delete',
  })
}

/**
 * 搜索维护记录，支持多条件筛选和分页
 * @param {Object} params 搜索参数
 */
export function searchMaintenanceRecords(params) {
  return request({
    url: '/api/resource/maintenance/search',
    method: 'get',
    params,
  })
}

/**
 * 获取维护记录统计数据
 * @param {Object} params 统计参数
 */
export function getMaintenanceStats(params) {
  return request({
    url: '/api/resource/maintenance/stats',
    method: 'get',
    params,
  })
}
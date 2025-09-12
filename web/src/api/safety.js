import request from '@/utils/request'

// 安全检查记录管理 API

/**
 * 创建安全检查记录
 * @param {Object} data CreateInspectionRecordCommand 数据
 */
export function createInspectionRecord(data) {
  return request({
    url: '/api/resource/inspections',
    method: 'post',
    data,
  })
}

/**
 * 根据ID获取单个检查记录
 * @param {string} id 检查记录ID
 */
export function getInspectionRecord(id) {
  return request({
    url: `/api/resource/inspections/${id}`,
    method: 'get',
  })
}

/**
 * 更新检查记录
 * @param {string} id 检查记录ID
 * @param {Object} data UpdateInspectionRecordCommand 数据
 */
export function updateInspectionRecord(id, data) {
  return request({
    url: `/api/resource/inspections/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除检查记录
 * @param {string} id 检查记录ID
 */
export function deleteInspectionRecord(id) {
  return request({
    url: `/api/resource/inspections/${id}`,
    method: 'delete',
  })
}

/**
 * 搜索检查记录（带分页和筛选）
 * @param {Object} params 搜索参数
 */
export function searchInspectionRecords(params) {
  return request({
    url: '/api/resource/inspections/search',
    method: 'get',
    params,
  })
}

/**
 * 获取检查记录统计信息
 * @param {Object} params 统计参数
 */
export function getInspectionStats(params) {
  return request({
    url: '/api/resource/inspections/stats',
    method: 'get',
    params,
  })
}

// 为了保持向后兼容，可以保留一些旧的函数名作为别名
export const getSafetyInspections = searchInspectionRecords;
export const addSafetyInspection = createInspectionRecord;
export const deleteSafetyInspection = deleteInspectionRecord;
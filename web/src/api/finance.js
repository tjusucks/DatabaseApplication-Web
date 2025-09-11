import request from '@/utils/request'

const BASE_URL = '/resource/financial-records'

/**
 * 搜索财务记录（支持过滤和分页）
 * @param {Object} params 搜索参数
 */
export const getFinancialRecords = (params) => {
  return request.get(`${BASE_URL}/search`, { params })
}

/**
 * 根据ID获取财务记录详情
 * @param {string} id 记录ID
 */
export const getFinancialRecordById = (id) => {
  return request.get(`${BASE_URL}/${id}`)
}

/**
 * 创建财务记录
 * @param {Object} data 财务记录数据
 */
export const createFinancialRecord = (data) => {
  return request.post(BASE_URL, data)
}

/**
 * 更新现有财务记录
 * @param {string} id 记录ID
 * @param {Object} data 更新数据
 */
export const updateFinancialRecord = (id, data) => {
  return request.put(`${BASE_URL}/${id}`, data)
}

/**
 * 删除财务记录
 * @param {string} id 记录ID
 */
export const deleteFinancialRecord = (id) => {
  return request.delete(`${BASE_URL}/${id}`)
}

/**
 * 获取财务总览统计
 * @param {Object} params 查询参数
 */
export const getFinancialOverview = (params) => {
  return request.get(`${BASE_URL}/overview`, { params })
}

/**
 * 获取分组财务统计
 * @param {Object} params 分组参数
 */
export const getGroupedFinancialStats = (params) => {
  return request.get(`${BASE_URL}/stats/grouped`, { params })
}

/**
 * 按交易类型获取财务记录
 * @param {string} transactionType 交易类型
 * @param {Object} params 过滤参数
 */
export const getFinancialRecordsByType = (transactionType, params) => {
    return request.get(`${BASE_URL}/by-type/${transactionType}`, { params });
};

/**
 * 获取财务统计信息
 * @param {Object} params 查询参数
 */
export function getFinancialStats(params) {
  return request.get(`${BASE_URL}/stats`, { params });
}

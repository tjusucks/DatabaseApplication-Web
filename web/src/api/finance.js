import request from '@/utils/request'

// ----------------- 财务记录 (Financial Records) -----------------

/**
 * 搜索财务记录 (包括收入、支出、消费记录)
 * @param {Object} params 查询参数, e.g., { transactionType: 'income', page: 1, pageSize: 10 }
 */
export function searchFinancialRecords(params) {
  return request({
    url: '/api/resource/financial-records/search',
    method: 'get',
    params,
  })
}

/**
 * 创建财务记录
 * @param {Object} data 记录数据
 */
export function createFinancialRecord(data) {
  return request({
    url: '/api/resource/financial-records',
    method: 'post',
    data,
  })
}

/**
 * 获取单个财务记录详情
 * @param {string} id 记录ID
 */
export function getFinancialRecordById(id) {
  return request({
    url: '/api/resource/financial-records/${id}',
    method: 'get',
  })
}

/**
 * 更新财务记录
 * @param {string} id 记录ID
 * @param {Object} data 更新数据
 */
export function updateFinancialRecord(id, data) {
  return request({
    url: '/api/resource/financial-records/${id}',
    method: 'put',
    data,
  })
}

/**
 * 删除财务记录
 * @param {string} id 记录ID
 */
export function deleteFinancialRecord(id) {
  return request({
    url: '/api/resource/financial-records/${id}',
    method: 'delete',
  })
}

// ----------------- 财务报表 (Financial Reports) -----------------

/**
 * 获取财务总览
 * @param {Object} params 查询参数, e.g., { startDate, endDate }
 */
export function getFinanceOverview(params) {
  return request({
    url: '/api/resource/financial-records/overview',
    method: 'get',
    params,
  })
}

/**
 * 获取分组统计数据
 * @param {Object} params 查询参数, e.g., { startDate, endDate }
 */
export function getFinanceGroupedStats(params) {
  return request({
    url: '/api/resource/financial-records/stats/grouped',
    method: 'get',
    params,
  })
}

/**
 * 获取时间序列统计数据 (例如按月统计)
 * @param {Object} params 查询参数, e.g., { startDate, endDate, granularity: 'month' }
 */
export function getFinanceStats(params) {
  return request({
    url: '/api/resource/financial-records/stats',
    method: 'get',
    params,
  })
}

/**
 * 按类型获取财务记录详情列表
 * @param {string} transactionType 交易类型
 * @param {Object} params 查询参数, e.g., { startDate, endDate }
 */
export function getRecordsByType(transactionType, params) {
  return request({
    url: '/api/resource/financial-records/by-type/${transactionType}',
    method: 'get',
    params,
  })
}

// ----------------- 薪资管理 (Payroll) -----------------

/**
 * 创建工资单记录
 * @param {Object} data - 工资单数据
 */
export function createSalaryRecord(data) {
  return request({
    url: '/api/resource/salary-records',
    method: 'post',
    data,
  })
}

/**
 * 获取单个工资单记录
 * @param {number} id - 工资单ID
 */
export function getSalaryRecord(id) {
  return request({
    url: '/api/resource/salary-records/batch',
    method: 'post',
    data,
  })
}

/**
 * 更新工资单记录
 * @param {number} id - 工资单ID
 * @param {Object} data - 更新的数据
 */
export function updateSalaryRecord(id, data) {
  return request({
    url: `/api/resource/salary-records/${salaryRecordId}`,
    method: 'put',
    data,
  })
}

/**
 * 删除工资单记录
 * @param {number} id - 工资单ID
 */
export function deleteSalaryRecord(id) {
  return request({
    url: `/api/resource/salary-records/${salaryRecordId}`,
    method: 'delete',
  })
}

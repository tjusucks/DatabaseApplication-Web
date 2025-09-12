import request from '@/utils/request'

// ----------------- 财务记录 (Financial Records) -----------------

/**
 * 搜索财务记录 (包括收入、支出、消费记录)
 * @param {Object} params 查询参数, e.g., { transactionType: 'income', page: 1, pageSize: 10 }
 */
export function searchFinancialRecords(params) {
  return request({
    url: '/resource/financial-records/search',
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
    url: '/resource/financial-records',
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
    url: `/resource/financial-records/${id}`,
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
    url: `/resource/financial-records/${id}`,
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
    url: `/resource/financial-records/${id}`,
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
    url: '/resource/financial-records/overview',
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
    url: '/resource/financial-records/stats/grouped',
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
    url: '/resource/financial-records/stats',
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
    url: `/resource/financial-records/by-type/${transactionType}`,
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
    url: '/resource/salary-records',
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
    url: `/resource/salary-records/${id}`,
    method: 'get',
  })
}

/**
 * 更新工资单记录
 * @param {number} id - 工资单ID
 * @param {Object} data - 更新的数据
 */
export function updateSalaryRecord(id, data) {
  return request({
    url: `/resource/salary-records/${id}`,
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
    url: `/resource/salary-records/${id}`,
    method: 'delete',
  })
}

/**
 * 搜索工资单记录
 * @param {Object} query - 查询条件
 */
export function searchSalaryRecords(query) {
  return request({
    url: '/resource/salary-records/search',
    method: 'get',
    params: query,
  })
}

/**
 * 获取工资单统计信息
 * @param {Object} query - 查询条件
 */
export function getSalaryStats(query) {
  return request({
    url: '/resource/salary-records/stats',
    method: 'post',
    data: query,
  })
}

/**
 * 生成工资单
 * @param {Object} data - 生成选项
 */
export function generatePayrolls(data) {
  return request({
    url: '/resource/salary-records/generate-payrolls',
    method: 'post',
    data,
  })
}

/**
 * 处理工资单支付
 * @param {Object} data - 支付信息
 */
export function processPayroll(data) {
  return request({
    url: '/resource/salary-records/process-payroll',
    method: 'post',
    data,
  })
}

// ----------------- 维保记录 (Maintenance) -----------------

/**
 * 搜索维保记录
 * @param {Object} query - 查询条件
 */
export function searchMaintenanceRecords(query) {
  return request({
    url: '/resource/maintenance-records/search',
    method: 'get',
    params: query,
  })
}

/**
 * 创建维保记录
 * @param {Object} data - 维保记录数据
 */
export function createMaintenanceRecord(data) {
  return request({
    url: '/resource/maintenance-records',
    method: 'post',
    data,
  })
}

/**
 * 获取单个维保记录
 * @param {number} id - 记录ID
 */
export function getMaintenanceRecord(id) {
  return request({
    url: `/resource/maintenance-records/${id}`,
    method: 'get',
  })
}

/**
 * 更新维保记录
 * @param {number} id - 记录ID
 * @param {Object} data - 更新的数据
 */
export function updateMaintenanceRecord(id, data) {
  return request({
    url: `/resource/maintenance-records/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除维保记录
 * @param {number} id - 记录ID
 */
export function deleteMaintenanceRecord(id) {
  return request({
    url: `/resource/maintenance-records/${id}`,
    method: 'delete',
  })
}

// ----------------- 票务销售 (Ticket Sales) -----------------

/**
 * 搜索门票销售记录 (作为收入)
 * @param {Object} query - 查询条件
 */
export function searchTicketSales(query) {
  return request({
    url: '/resource/tickets/search', // 假设这是票务搜索的端点
    method: 'get',
    params: query,
  })
}

// ----------------- 退款处理 (Refunds) -----------------

/**
 * 搜索退款记录 (作为支出)
 * @param {Object} query - 查询条件
 */
export function searchRefunds(query) {
  return request({
    url: '/resource/refunds/search', // 假设这是退款搜索的端点
    method: 'get',
    params: query,
  })
}

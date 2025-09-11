import request from '@/utils/request'

// 财务管理 API

// ========== 财务记录管理 ==========

/**
 * 搜索财务记录（支持过滤和分页）
 * @param {Object} params 搜索参数
 */
export function searchFinancialRecords(params) {
  return request({
    url: '/api/FinancialRecords/search',
    method: 'get',
    params
  })
}

/**
 * 根据ID获取财务记录详情
 * @param {string} recordId 记录ID
 */
export function getFinancialRecordById(recordId) {
  return request({
    url: `/api/FinancialRecords/${recordId}`,
    method: 'get'
  })
}

/**
 * 获取财务统计信息
 */
export function getFinancialStats() {
  return request({
    url: '/api/FinancialRecords/stats',
    method: 'get'
  })
}

/**
 * 获取分组财务统计
 * @param {Object} params 分组参数
 */
export function getGroupedFinancialStats(params) {
  return request({
    url: '/api/FinancialRecords/stats/grouped',
    method: 'get',
    params
  })
}

/**
 * 获取收入支出概览
 */
export function getFinancialOverview() {
  return request({
    url: '/api/FinancialRecords/overview',
    method: 'get'
  })
}

/**
 * 按交易类型获取财务记录
 * @param {string} transactionType 交易类型
 * @param {Object} params 过滤参数
 */
export function getFinancialRecordsByType(transactionType, params) {
  return request({
    url: `/api/FinancialRecords/by-type/${transactionType}`,
    method: 'get',
    params
  })
}

/**
 * 创建新的财务记录
 * @param {Object} data 财务记录数据
 */
export function createFinancialRecord(data) {
  return request({
    url: '/api/FinancialRecords',
    method: 'post',
    data
  })
}

/**
 * 更新现有财务记录
 * @param {string} recordId 记录ID
 * @param {Object} data 更新数据
 */
export function updateFinancialRecord(recordId, data) {
  return request({
    url: `/api/FinancialRecords/${recordId}`,
    method: 'put',
    data
  })
}

/**
 * 删除财务记录
 * @param {string} recordId 记录ID
 */
export function deleteFinancialRecord(recordId) {
  return request({
    url: `/api/FinancialRecords/${recordId}`,
    method: 'delete'
  })
}

// ========== 薪资记录管理 ==========

/**
 * 搜索薪资记录（支持过滤和分页）
 * @param {Object} params 搜索参数
 */
export function searchSalaryRecords(params) {
  return request({
    url: '/api/resource/salary-records/search',
    method: 'get',
    params
  })
}

/**
 * 根据ID获取薪资记录详情
 * @param {string} salaryRecordId 薪资记录ID
 */
export function getSalaryRecordById(salaryRecordId) {
  return request({
    url: `/api/resource/salary-records/${salaryRecordId}`,
    method: 'get'
  })
}

/**
 * 获取薪资统计信息
 */
export function getSalaryStats() {
  return request({
    url: '/api/resource/salary-records/stats',
    method: 'get'
  })
}

/**
 * 获取分组薪资统计
 * @param {Object} params 分组参数
 */
export function getGroupedSalaryStats(params) {
  return request({
    url: '/api/resource/salary-records/stats/grouped',
    method: 'get',
    params
  })
}

/**
 * 获取特定员工的薪资记录
 * @param {string} employeeId 员工ID
 */
export function getSalaryRecordsByEmployee(employeeId) {
  return request({
    url: `/api/resource/salary-records/employee/${employeeId}`,
    method: 'get'
  })
}

/**
 * 获取员工薪资汇总
 * @param {string} employeeId 员工ID
 */
export function getEmployeeSalarySummary(employeeId) {
  return request({
    url: `/api/resource/salary-records/employee/${employeeId}/summary`,
    method: 'get'
  })
}

/**
 * 获取月度薪资报告
 * @param {Object} params 报告参数
 */
export function getMonthlySalaryReport(params) {
  return request({
    url: '/api/resource/salary-records/reports/monthly',
    method: 'get',
    params
  })
}

/**
 * 获取工资单
 * @param {Object} params 工资单参数
 */
export function getPayroll(params) {
  return request({
    url: '/api/resource/salary-records/payroll',
    method: 'get',
    params
  })
}

/**
 * 创建新的薪资记录
 * @param {Object} data 薪资记录数据
 */
export function createSalaryRecord(data) {
  return request({
    url: '/api/resource/salary-records',
    method: 'post',
    data
  })
}

/**
 * 批量创建薪资记录（批量发薪）
 * @param {Array} data 薪资记录数组
 */
export function batchCreateSalaryRecords(data) {
  return request({
    url: '/api/resource/salary-records/batch',
    method: 'post',
    data
  })
}

/**
 * 更新现有薪资记录
 * @param {string} salaryRecordId 薪资记录ID
 * @param {Object} data 更新数据
 */
export function updateSalaryRecord(salaryRecordId, data) {
  return request({
    url: `/api/resource/salary-records/${salaryRecordId}`,
    method: 'put',
    data
  })
}

/**
 * 删除薪资记录
 * @param {string} salaryRecordId 薪资记录ID
 */
export function deleteSalaryRecord(salaryRecordId) {
  return request({
    url: `/api/resource/salary-records/${salaryRecordId}`,
    method: 'delete'
  })
}
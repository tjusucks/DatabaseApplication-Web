import request from '@/utils/request'

// 财务 API

// ----------------- 收入管理 -----------------

/**
 * 获取收入列表
 * @param {Object} params 查询参数，如分页、筛选等
 */
export function getIncomes(params) {
  return request({
    url: '/api/Finance/income',
    method: 'get',
    params
  })
}

/**
 * 创建收入记录
 * @param {Object} data 收入数据
 */
export function createIncome(data) {
  return request({
    url: '/api/Finance/income',
    method: 'post',
    data
  })
}

/**
 * 更新收入记录
 * @param {string} id 记录ID
 * @param {Object} data 更新数据
 */
export function updateIncome(id, data) {
  return request({
    url: `/api/Finance/income/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除收入记录
 * @param {string} id 记录ID
 */
export function deleteIncome(id) {
  return request({
    url: `/api/Finance/income/${id}`,
    method: 'delete'
  })
}


// ----------------- 支出管理 -----------------

/**
 * 获取支出列表
 * @param {Object} params 查询参数
 */
export function getExpenses(params) {
  return request({
    url: '/api/Finance/expenses',
    method: 'get',
    params
  })
}

/**
 * 创建支出记录
 * @param {Object} data 支出数据
 */
export function createExpense(data) {
  return request({
    url: '/api/Finance/expenses',
    method: 'post',
    data
  })
}

/**
 * 更新支出记录
 * @param {string} id 记录ID
 * @param {Object} data 更新数据
 */
export function updateExpense(id, data) {
  return request({
    url: `/api/Finance/expenses/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除支出记录
 * @param {string} id 记录ID
 */
export function deleteExpense(id) {
  return request({
    url: `/api/Finance/expenses/${id}`,
    method: 'delete'
  })
}


// ----------------- 消费记录 -----------------

/**
 * 获取消费记录列表
 * @param {Object} params 查询参数
 */
export function getConsumptionRecords(params) {
  return request({
    url: '/api/Finance/records',
    method: 'get',
    params
  })
}


// ----------------- 财务报表 -----------------

/**
 * 获取财务总览统计
 */
export function getFinanceSummary() {
  return request({
    url: '/api/Finance/summary',
    method: 'get'
  })
}

/**
 * 按类别获取财务统计
 */
export function getFinanceGroupedByType() {
  return request({
    url: '/api/Finance/grouped-by-type',
    method: 'get'
  })
}

/**
 * 按时间段获取财务统计
 * @param {Object} params 查询参数，如 startDate, endDate, interval
 */
export function getFinanceOverTime(params) {
  return request({
    url: '/api/Finance/over-time',
    method: 'get',
    params
  })
}

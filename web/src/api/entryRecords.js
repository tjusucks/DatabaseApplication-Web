import request from '@/utils/request'

// 入园记录管理 API

/**
 * 注册游客入园
 * @param {Object} data 入园数据
 */
export function registerEntry(data) {
  return request({
    url: '/api/EntryRecords/entry',
    method: 'post',
    data
  })
}

/**
 * 注册游客出园
 * @param {Object} data 出园数据
 */
export function registerExit(data) {
  return request({
    url: '/api/EntryRecords/exit',
    method: 'post',
    data
  })
}

/**
 * 获取所有入园记录
 * @param {Object} params 查询参数
 */
export function getAllEntryRecords(params) {
  return request({
    url: '/api/EntryRecords',
    method: 'get',
    params
  })
}

/**
 * 根据ID获取入园记录
 * @param {string} id 记录ID
 */
export function getEntryRecordById(id) {
  return request({
    url: `/api/EntryRecords/${id}`,
    method: 'get'
  })
}

/**
 * 获取特定游客的入园记录
 * @param {string} visitorId 游客ID
 */
export function getEntryRecordsByVisitor(visitorId) {
  return request({
    url: `/api/EntryRecords/visitor/${visitorId}`,
    method: 'get'
  })
}

/**
 * 获取当前在园游客列表
 */
export function getCurrentVisitors() {
  return request({
    url: '/api/EntryRecords/current',
    method: 'get'
  })
}

/**
 * 获取当前在园游客数量
 */
export function getCurrentVisitorCount() {
  return request({
    url: '/api/EntryRecords/current/count',
    method: 'get'
  })
}

/**
 * 按日期范围查询入园记录
 * @param {Object} params 日期范围参数
 */
export function getEntryRecordsByDateRange(params) {
  return request({
    url: '/api/EntryRecords/date-range',
    method: 'get',
    params
  })
}

/**
 * 获取每日统计数据
 * @param {Object} params 统计参数
 */
export function getDailyStatistics(params) {
  return request({
    url: '/api/EntryRecords/statistics/daily',
    method: 'get',
    params
  })
}

/**
 * 按入园门查询记录
 * @param {string} gate 入园门
 */
export function getEntryRecordsByGate(gate) {
  return request({
    url: `/api/EntryRecords/gate/${gate}`,
    method: 'get'
  })
}

/**
 * 获取游客的活跃入园记录
 * @param {string} visitorId 游客ID
 */
export function getActiveEntryRecord(visitorId) {
  return request({
    url: `/api/EntryRecords/visitor/${visitorId}/active`,
    method: 'get'
  })
}

/**
 * 更新入园记录
 * @param {string} id 记录ID
 * @param {Object} data 更新数据
 */
export function updateEntryRecord(id, data) {
  return request({
    url: `/api/EntryRecords/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除入园记录
 * @param {string} id 记录ID
 */
export function deleteEntryRecord(id) {
  return request({
    url: `/api/EntryRecords/${id}`,
    method: 'delete'
  })
}

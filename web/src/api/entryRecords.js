import request from '@/utils/request'

// 入园记录管理 API - 基于后端 /api/user/entries 路径

/**
 * 创建入园/出园记录
 * @param {Object} data 记录数据
 */
export function createEntryRecord(data) {
  return request({
    url: '/api/user/entries',
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
    url: '/api/user/entries',
    method: 'get',
    params
  })
}

/**
 * 根据ID获取入园记录
 * @param {string|number} id 记录ID
 */
export function getEntryRecordById(id) {
  return request({
    url: `/api/user/entries/${id}`,
    method: 'get'
  })
}

/**
 * 更新入园记录
 * @param {string|number} id 记录ID
 * @param {Object} data 更新数据
 */
export function updateEntryRecord(id, data) {
  return request({
    url: `/api/user/entries/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除入园记录
 * @param {string|number} id 记录ID
 */
export function deleteEntryRecord(id) {
  return request({
    url: `/api/user/entries/${id}`,
    method: 'delete'
  })
}

/**
 * 搜索入园记录，支持多条件筛选和分页
 * @param {Object} params 搜索参数
 */
export function searchEntryRecords(params) {
  return request({
    url: '/api/user/entries/search',
    method: 'get',
    params
  })
}

/**
 * 获取入园记录统计数据
 * @param {Object} params 统计参数
 */
export function getEntryRecordStats(params) {
  return request({
    url: '/api/user/entries/stats',
    method: 'get',
    params
  })
}

/**
 * 获取分组入园记录统计数据
 * @param {Object} params 统计参数
 */
export function getGroupedEntryRecordStats(params) {
  return request({
    url: '/api/user/entries/stats/grouped',
    method: 'get',
    params
  })
}

// 便捷函数 - 基于搜索API实现

/**
 * 注册游客入园
 * @param {Object} data 入园数据 {visitorId, entryGate, ticketId?}
 */
export function registerEntry(data) {
  return createEntryRecord({
    ...data,
    entryTime: new Date().toISOString()
  })
}

/**
 * 注册游客出园
 * @param {Object} data 出园数据 {entryRecordId, exitGate}
 */
export function registerExit(data) {
  return updateEntryRecord(data.entryRecordId, {
    exitTime: new Date().toISOString(),
    exitGate: data.exitGate
  })
}

/**
 * 获取特定游客的入园记录
 * @param {string|number} visitorId 游客ID
 */
export function getEntryRecordsByVisitor(visitorId) {
  return searchEntryRecords({ visitorId })
}

/**
 * 获取当前在园游客列表
 */
export function getCurrentVisitors() {
  return searchEntryRecords({
    isCurrentlyInPark: true,
    includeVisitorInfo: true
  })
}

/**
 * 获取当前在园游客数量
 */
export function getCurrentVisitorCount() {
  return getEntryRecordStats({
    statType: 'currentCount'
  })
}

/**
 * 按日期范围查询入园记录
 * @param {Object} params 日期范围参数 {startDate, endDate}
 */
export function getEntryRecordsByDateRange(params) {
  return searchEntryRecords({
    startDate: params.startDate,
    endDate: params.endDate
  })
}

/**
 * 获取每日统计数据
 * @param {Object} params 统计参数
 */
export function getDailyStatistics(params) {
  return getGroupedEntryRecordStats({
    groupBy: 'date',
    ...params
  })
}

/**
 * 按入园门查询记录
 * @param {string} gate 入园门
 */
export function getEntryRecordsByGate(gate) {
  return searchEntryRecords({ entryGate: gate })
}

/**
 * 获取游客的活跃入园记录（当前在园的记录）
 * @param {string|number} visitorId 游客ID
 */
export function getActiveEntryRecord(visitorId) {
  return searchEntryRecords({
    visitorId,
    isCurrentlyInPark: true,
    limit: 1
  })
}

import request from '@/utils/request'

// 游客管理 API

/**
 * 创建新游客
 * @param {Object} data 游客信息
 */
export function createVisitor(data) {
  return request({
    url: '/api/Visitors',
    method: 'post',
    data
  })
}

/**
 * 获取所有游客
 * @param {Object} params 查询参数
 */
export function getVisitors(params) {
  return request({
    url: '/api/Visitors',
    method: 'get',
    params
  })
}

/**
 * 根据ID获取游客
 * @param {string} id 游客ID
 */
export function getVisitorById(id) {
  return request({
    url: `/api/Visitors/${id}`,
    method: 'get'
  })
}

/**
 * 根据用户ID获取游客
 * @param {string} userId 用户ID
 */
export function getVisitorByUserId(userId) {
  return request({
    url: `/api/Visitors/user/${userId}`,
    method: 'get'
  })
}

/**
 * 获取游客历史记录
 * @param {string} id 游客ID
 */
export function getVisitorHistory(id) {
  return request({
    url: `/api/Visitors/${id}/history`,
    method: 'get'
  })
}

/**
 * 按姓名搜索游客
 * @param {string} name 姓名
 */
export function searchVisitorsByName(name) {
  return request({
    url: '/api/Visitors/search/name',
    method: 'get',
    params: { name }
  })
}

/**
 * 按电话号码搜索游客
 * @param {string} phone 电话号码
 */
export function searchVisitorsByPhone(phone) {
  return request({
    url: '/api/Visitors/search/phone',
    method: 'get',
    params: { phone }
  })
}

/**
 * 按黑名单状态筛选游客
 * @param {boolean} isBlacklisted 是否在黑名单
 */
export function getVisitorsByBlacklistStatus(isBlacklisted) {
  return request({
    url: `/api/Visitors/blacklist/${isBlacklisted}`,
    method: 'get'
  })
}

/**
 * 按游客类型筛选
 * @param {string} visitorType 游客类型
 */
export function getVisitorsByType(visitorType) {
  return request({
    url: `/api/Visitors/type/${visitorType}`,
    method: 'get'
  })
}

/**
 * 按注册日期范围筛选
 * @param {Object} params 日期范围参数
 */
export function getVisitorsByRegistrationDate(params) {
  return request({
    url: '/api/Visitors/registration-date',
    method: 'get',
    params
  })
}

/**
 * 统一搜索API，支持多条件筛选和分页
 * @param {Object} params 搜索参数
 */
export function searchVisitors(params) {
  return request({
    url: '/api/Visitors/search',
    method: 'get',
    params
  })
}

/**
 * 更新游客信息
 * @param {string} id 游客ID
 * @param {Object} data 更新数据
 */
export function updateVisitor(id, data) {
  return request({
    url: `/api/Visitors/${id}`,
    method: 'put',
    data
  })
}

/**
 * 更新黑名单状态
 * @param {string} id 游客ID
 * @param {Object} data 黑名单状态数据
 */
export function updateVisitorBlacklistStatus(id, data) {
  return request({
    url: `/api/Visitors/${id}/blacklist`,
    method: 'put',
    data
  })
}

/**
 * 删除游客
 * @param {string} id 游客ID
 */
export function deleteVisitor(id) {
  return request({
    url: `/api/Visitors/${id}`,
    method: 'delete'
  })
}

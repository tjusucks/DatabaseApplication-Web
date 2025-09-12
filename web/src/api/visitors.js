import request from '@/utils/request'

// 游客管理 API - 基于后端 /api/user/visitors 路径

/**
 * 创建新游客
 * @param {Object} data 游客信息
 */
export function createVisitor(data) {
  return request({
    url: '/api/user/visitors',
    method: 'post',
    data,
  })
}

/**
 * 获取所有游客
 * @param {Object} params 查询参数
 */
export function getVisitors(params) {
  return request({
    url: '/api/user/visitors',
    method: 'get',
    params,
  })
}

/**
 * 根据ID获取游客
 * @param {string|number} id 游客ID
 */
export function getVisitorById(id) {
  return request({
    url: `/api/user/visitors/${id}`,
    method: 'get',
  })
}

/**
 * 更新游客信息
 * @param {string|number} id 游客ID
 * @param {Object} data 更新数据
 */
export function updateVisitor(id, data) {
  return request({
    url: `/api/user/visitors/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 更新游客联系信息
 * @param {string|number} id 游客ID
 * @param {Object} data 联系信息数据 {email, phoneNumber}
 */
export function updateVisitorContact(id, data) {
  return request({
    url: `/api/user/visitors/${id}/contact`,
    method: 'put',
    data,
  })
}

/**
 * 删除游客
 * @param {string|number} id 游客ID
 */
export function deleteVisitor(id) {
  return request({
    url: `/api/user/visitors/${id}`,
    method: 'delete',
  })
}

// ==================== 会员管理相关 API ====================

/**
 * 升级游客为会员
 * @param {string|number} id 游客ID
 */
export function upgradeToMember(id) {
  return request({
    url: `/api/user/visitors/${id}/membership`,
    method: 'post',
  })
}

/**
 * 取消游客会员资格
 * @param {string|number} id 游客ID
 */
export function removeMembership(id) {
  return request({
    url: `/api/user/visitors/${id}/membership`,
    method: 'delete',
  })
}

/**
 * 为会员添加积分
 * @param {string|number} id 游客ID
 * @param {Object} data 积分数据 {points, reason}
 */
export function addPoints(id, data) {
  return request({
    url: `/api/user/visitors/${id}/points/add`,
    method: 'post',
    data,
  })
}

/**
 * 扣除会员积分
 * @param {string|number} id 游客ID
 * @param {Object} data 积分数据 {points, reason}
 */
export function deductPoints(id, data) {
  return request({
    url: `/api/user/visitors/${id}/points/deduct`,
    method: 'post',
    data,
  })
}

/**
 * 通过联系方式为会员添加积分
 * @param {Object} data 积分数据 {email?, phoneNumber?, points, reason}
 */
export function addPointsByContact(data) {
  return request({
    url: `/api/user/visitors/points/add-by-contact`,
    method: 'post',
    data,
  })
}

/**
 * 通过联系方式扣除会员积分
 * @param {Object} data 积分数据 {email?, phoneNumber?, points, reason}
 */
export function deductPointsByContact(data) {
  return request({
    url: `/api/user/visitors/points/deduct-by-contact`,
    method: 'post',
    data,
  })
}

/**
 * 统一搜索API，支持多条件筛选和分页
 * @param {Object} params 搜索参数
 */
export function searchVisitors(params) {
  return request({
    url: '/api/user/visitors/search',
    method: 'get',
    params,
  })
}

/**
 * 获取游客统计数据
 * @param {Object} params 统计参数
 */
export function getVisitorStats(params) {
  return request({
    url: '/api/user/visitors/stats',
    method: 'get',
    params,
  })
}

/**
 * 获取分组游客统计数据
 * @param {Object} params 统计参数
 */
export function getGroupedVisitorStats(params) {
  return request({
    url: '/api/user/visitors/stats/grouped',
    method: 'get',
    params,
  })
}

/**
 * 将游客加入黑名单
 * @param {string|number} id 游客ID
 * @param {Object} data 黑名单数据 {reason}
 */
export function blacklistVisitor(id, data) {
  return request({
    url: `/api/user/visitors/${id}/blacklist`,
    method: 'post',
    data: {
      visitorId: parseInt(id),
      reason: data.reason || '违规行为',
    },
  })
}

/**
 * 将游客移出黑名单
 * @param {string|number} id 游客ID
 */
export function unblacklistVisitor(id) {
  return request({
    url: `/api/user/visitors/${id}/blacklist`,
    method: 'delete',
  })
}

// 兼容性函数 - 保持向后兼容
export function searchVisitorsByName(name) {
  return searchVisitors({ keyword: name })
}

export function searchVisitorsByPhone(phone) {
  return searchVisitors({ keyword: phone })
}

export function getVisitorsByBlacklistStatus(isBlacklisted) {
  return searchVisitors({ isBlacklisted })
}

export function getVisitorsByType(visitorType) {
  return searchVisitors({ visitorType })
}

export function updateVisitorBlacklistStatus(id, data) {
  if (data.isBlacklisted) {
    return blacklistVisitor(id, { reason: data.reason || '违规行为' })
  } else {
    return unblacklistVisitor(id)
  }
}

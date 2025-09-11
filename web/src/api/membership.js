import request from "@/utils/request";

// 会员管理 API

/**
 * 注册新游客
 * @param {Object} data 游客注册信息
 */
export function registerMember(data) {
  return request({
    url: "/api/Membership/register",
    method: "post",
    data,
  });
}

/**
 * 根据ID获取游客信息
 * @param {string} id 游客ID
 */
export function getMemberById(id) {
  return request({
    url: `/api/Membership/${id}`,
    method: "get",
  });
}

/**
 * 根据用户ID获取游客信息
 * @param {string} userId 用户ID
 */
export function getMemberByUserId(userId) {
  return request({
    url: `/api/Membership/by-user/${userId}`,
    method: "get",
  });
}

/**
 * 获取所有游客
 * @param {Object} params 查询参数
 */
export function getAllMembers(params) {
  return request({
    url: "/api/Membership",
    method: "get",
    params,
  });
}

/**
 * 按游客类型筛选
 * @param {string} type 游客类型
 */
export function getMembersByType(type) {
  return request({
    url: `/api/Membership/by-type/${type}`,
    method: "get",
  });
}

/**
 * 按会员等级筛选
 * @param {string} level 会员等级
 */
export function getMembersByLevel(level) {
  return request({
    url: `/api/Membership/by-level/${level}`,
    method: "get",
  });
}

/**
 * 升级游客为会员
 * @param {string} id 游客ID
 * @param {Object} data 升级数据
 */
export function upgradeMember(id, data) {
  return request({
    url: `/api/Membership/${id}/upgrade`,
    method: "post",
    data,
  });
}

/**
 * 增加积分
 * @param {Object} data 积分数据
 */
export function addPoints(data) {
  return request({
    url: "/api/Membership/points/add",
    method: "post",
    data,
  });
}

/**
 * 扣除积分
 * @param {Object} data 积分数据
 */
export function deductPoints(data) {
  return request({
    url: "/api/Membership/points/deduct",
    method: "post",
    data,
  });
}

/**
 * 更新游客信息
 * @param {string} id 游客ID
 * @param {Object} data 更新数据
 */
export function updateMember(id, data) {
  return request({
    url: `/api/Membership/${id}`,
    method: "put",
    data,
  });
}

/**
 * 将游客加入黑名单
 * @param {string} id 游客ID
 * @param {Object} data 黑名单数据
 */
export function addToBlacklist(id, data) {
  return request({
    url: `/api/Membership/${id}/blacklist`,
    method: "post",
    data,
  });
}

/**
 * 将游客移出黑名单
 * @param {string} id 游客ID
 * @param {Object} data 移出黑名单数据
 */
export function removeFromBlacklist(id, data) {
  return request({
    url: `/api/Membership/${id}/unblacklist`,
    method: "post",
    data,
  });
}

/**
 * 获取会员统计信息
 */
export function getMemberStatistics() {
  return request({
    url: "/api/Membership/statistics",
    method: "get",
  });
}

/**
 * 删除游客
 * @param {string} id 游客ID
 */
export function deleteMember(id) {
  return request({
    url: `/api/Membership/${id}`,
    method: "delete",
  });
}

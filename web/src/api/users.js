import request from '@/utils/request'

// 基础用户管理 API

/**
 * 创建用户
 * @param {Object} data 用户数据
 */
export function createUser(data) {
  return request({
    url: '/api/Users',
    method: 'post',
    data,
  })
}

/**
 * 根据ID获取用户
 * @param {string} id 用户ID
 */
export function getUserById(id) {
  return request({
    url: `/api/Users/${id}`,
    method: 'get',
  })
}

/**
 * 更新用户
 * @param {string} id 用户ID
 * @param {Object} data 更新数据
 */
export function updateUser(id, data) {
  return request({
    url: `/api/Users/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除用户
 * @param {string} id 用户ID
 */
export function deleteUser(id) {
  return request({
    url: `/api/Users/${id}`,
    method: 'delete',
  })
}

/**
 * 获取所有用户
 * @param {Object} params 查询参数
 */
export function getAllUsers(params) {
  return request({
    url: '/api/Users',
    method: 'get',
    params,
  })
}

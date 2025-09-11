import { request } from '@/utils/request'

// 用户登录
export const login = (data) => {
  return request.post('/auth/login', data)
}

// 用户注册
export const register = (data) => {
  return request.post('/auth/register', data)
}

// 用户登出
export const logout = () => {
  return request.post('/auth/logout')
}

// 获取用户信息
export const getUserInfo = () => {
  return request.get('/auth/profile')
}

// 检查用户名可用性
export const checkUsernameAvailability = (username) => {
  return request.get(`/auth/check-username/${username}`)
}

// 修改密码
export const changePassword = (data) => {
  return request.post('/auth/change-password', data)
}

// 重置密码
export const resetPassword = (data) => {
  return request.post('/auth/reset-password', data)
}

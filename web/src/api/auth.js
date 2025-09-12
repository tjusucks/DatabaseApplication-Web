import { request } from '@/utils/request'

// 用户登录
export const login = (data) => {
  return request.post('/api/auth/login', data)
}

// 用户注册
export const register = (data) => {
  return request.post('/api/auth/register', data)
}

// 用户登出
export const logout = () => {
  return request.post('/api/auth/logout')
}

// 获取用户信息
export const getUserInfo = () => {
  return request.get('/api/auth/profile')
}

// 检查用户名可用性
export const checkUsernameAvailability = (username) => {
  return request.get(`/api/auth/check-username/${username}`)
}

// 重置密码
export const resetPassword = (data) => {
  return request.post('/api/auth/reset-password', data)
}

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { login as loginApi, logout as logoutApi, getUserInfo } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
  const permissions = ref(JSON.parse(localStorage.getItem('permissions') || '[]'))

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value.name || '')
  const userRole = computed(() => userInfo.value.role || '')
  const avatar = computed(() => userInfo.value.avatar || '')

  // 检查是否有指定角色
  const hasRole = (role) => {
    return userInfo.value.role === role || userInfo.value.role === 'super_admin'
  }

  // 检查是否有任意一个角色
  const hasAnyRole = (roles) => {
    if (!roles || roles.length === 0) return true
    return roles.some(role => hasRole(role))
  }

  // 检查是否有权限
  const hasPermission = (permission) => {
    return permissions.value.includes(permission) || userInfo.value.role === 'super_admin'
  }

  // 登录
  const login = async (loginForm) => {
    try {
      // 模拟登录 API 调用
      // const response = await loginApi(loginForm)
      
      // 模拟数据 - 实际项目中应该从 API 获取
      const mockResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        userInfo: {
          id: 1,
          name: loginForm.username === 'admin' ? '系统管理员' : '普通用户',
          username: loginForm.username,
          role: loginForm.username === 'admin' ? 'super_admin' : 'employee',
          avatar: '',
          email: loginForm.username + '@example.com',
          phone: '13800138000'
        },
        permissions: loginForm.username === 'admin' 
          ? ['*'] 
          : ['visitor:read', 'ticket:read']
      }

      // 保存到状态和本地存储
      token.value = mockResponse.token
      userInfo.value = mockResponse.userInfo
      permissions.value = mockResponse.permissions

      localStorage.setItem('token', mockResponse.token)
      localStorage.setItem('userInfo', JSON.stringify(mockResponse.userInfo))
      localStorage.setItem('permissions', JSON.stringify(mockResponse.permissions))

      ElMessage.success('登录成功')
      return mockResponse
    } catch (error) {
      ElMessage.error('登录失败：' + (error.message || '未知错误'))
      throw error
    }
  }

  // 登出
  const logout = async () => {
    try {
      // await logoutApi()
      
      // 清除状态和本地存储
      token.value = ''
      userInfo.value = {}
      permissions.value = []

      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('permissions')

      ElMessage.success('已退出登录')
    } catch (error) {
      console.error('登出失败:', error)
      // 即使 API 调用失败，也要清除本地数据
      token.value = ''
      userInfo.value = {}
      permissions.value = []
      localStorage.clear()
    }
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      if (!token.value) return null
      
      // const response = await getUserInfo()
      // userInfo.value = response.data
      // permissions.value = response.permissions
      
      return userInfo.value
    } catch (error) {
      console.error('获取用户信息失败:', error)
      await logout()
      throw error
    }
  }

  // 更新用户信息
  const updateUserInfo = (newUserInfo) => {
    userInfo.value = { ...userInfo.value, ...newUserInfo }
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  }

  return {
    // 状态
    token,
    userInfo,
    permissions,
    
    // 计算属性
    isLoggedIn,
    userName,
    userRole,
    avatar,
    
    // 方法
    hasRole,
    hasAnyRole,
    hasPermission,
    login,
    logout,
    fetchUserInfo,
    updateUserInfo
  }
})

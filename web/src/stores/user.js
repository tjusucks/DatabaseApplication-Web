import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
  refreshToken as refreshTokenApi,
  getUserInfo,
  changePassword as changePasswordApi
} from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const refreshToken = ref(localStorage.getItem('refreshToken') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
  const permissions = ref(JSON.parse(localStorage.getItem('permissions') || '[]'))

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value.displayName || userInfo.value.name || '')
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
      const response = await loginApi({
        username: loginForm.username,
        password: loginForm.password,
        rememberMe: loginForm.remember
      })

      // 保存到状态和本地存储
      token.value = response.accessToken
      refreshToken.value = response.refreshToken
      userInfo.value = response.user
      permissions.value = response.user.permissions || []

      localStorage.setItem('token', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      localStorage.setItem('userInfo', JSON.stringify(response.user))
      localStorage.setItem('permissions', JSON.stringify(response.user.permissions || []))

      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '登录失败'
      ElMessage.error(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // 注册
  const register = async (registerForm) => {
    try {
      const response = await registerApi({
        username: registerForm.username,
        password: registerForm.password,
        confirmPassword: registerForm.confirmPassword,
        displayName: registerForm.displayName,
        email: registerForm.email || null,
        phoneNumber: registerForm.phoneNumber || null
      })

      // 保存到状态和本地存储
      token.value = response.accessToken
      refreshToken.value = response.refreshToken
      userInfo.value = response.user
      permissions.value = response.user.permissions || []

      localStorage.setItem('token', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      localStorage.setItem('userInfo', JSON.stringify(response.user))
      localStorage.setItem('permissions', JSON.stringify(response.user.permissions || []))

      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '注册失败'
      ElMessage.error(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // 登出
  const logout = async () => {
    try {
      if (refreshToken.value) {
        await logoutApi({ refreshToken: refreshToken.value })
      }
    } catch (error) {
      console.error('登出API调用失败:', error)
    } finally {
      // 清除状态和本地存储
      token.value = ''
      refreshToken.value = ''
      userInfo.value = {}
      permissions.value = []

      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('permissions')

      ElMessage.success('已退出登录')
    }
  }

  // 刷新Token
  const refreshAccessToken = async () => {
    try {
      if (!refreshToken.value) {
        throw new Error('没有刷新令牌')
      }

      const response = await refreshTokenApi({ refreshToken: refreshToken.value })

      // 更新token
      token.value = response.accessToken
      refreshToken.value = response.refreshToken

      localStorage.setItem('token', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)

      return response.accessToken
    } catch (error) {
      console.error('刷新令牌失败:', error)
      await logout()
      throw error
    }
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      if (!token.value) return null

      const response = await getUserInfo()
      userInfo.value = response
      permissions.value = response.permissions || []

      localStorage.setItem('userInfo', JSON.stringify(response))
      localStorage.setItem('permissions', JSON.stringify(response.permissions || []))

      return response
    } catch (error) {
      console.error('获取用户信息失败:', error)
      if (error.response?.status === 401) {
        await logout()
      }
      throw error
    }
  }

  // 修改密码
  const changePassword = async (passwordData) => {
    try {
      await changePasswordApi(passwordData)
      ElMessage.success('密码修改成功')
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '密码修改失败'
      ElMessage.error(errorMessage)
      throw new Error(errorMessage)
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
    refreshToken,
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
    register,
    logout,
    refreshAccessToken,
    fetchUserInfo,
    changePassword,
    updateUserInfo
  }
})

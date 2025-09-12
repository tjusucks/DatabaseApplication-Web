import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
  getUserInfo
} from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
  const isAuthenticated = ref(!!localStorage.getItem('isAuthenticated'))

  // 计算属性
  const isLoggedIn = computed(() => isAuthenticated.value && userInfo.value.userId)
  const userName = computed(() => userInfo.value.displayName || userInfo.value.username || '')
  const userRole = computed(() => userInfo.value.roleName || '')

  // 检查是否有指定角色
  const hasRole = (role) => {
    // Admin角色拥有所有权限
    if (userInfo.value.roleName === 'Admin') return true
    return userInfo.value.roleName === role
  }

  // 检查是否有任意一个角色
  const hasAnyRole = (roles) => {
    if (!roles || roles.length === 0) return true
    return roles.some(role => hasRole(role))
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
      userInfo.value = response.user
      isAuthenticated.value = true

      localStorage.setItem('userInfo', JSON.stringify(response.user))
      localStorage.setItem('isAuthenticated', 'true')

      ElMessage.success(response.message || '登录成功')
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
      userInfo.value = response.user
      isAuthenticated.value = true

      localStorage.setItem('userInfo', JSON.stringify(response.user))
      localStorage.setItem('isAuthenticated', 'true')

      ElMessage.success(response.message || '注册成功')
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
      // 只有在已登录状态下才调用后端登出API
      if (isAuthenticated.value) {
        await logoutApi()
      }
    } catch (error) {
      console.error('登出API调用失败:', error)
      // 即使API调用失败，也要清除本地状态
    } finally {
      // 清除状态和本地存储
      userInfo.value = {}
      isAuthenticated.value = false

      localStorage.removeItem('userInfo')
      localStorage.removeItem('isAuthenticated')

      ElMessage.success('已退出登录')
    }
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      if (!isAuthenticated.value) return null

      const response = await getUserInfo()
      userInfo.value = response

      localStorage.setItem('userInfo', JSON.stringify(response))

      return response
    } catch (error) {
      console.error('获取用户信息失败:', error)
      if (error.response?.status === 401) {
        await logout()
      }
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
    userInfo,
    isAuthenticated,

    // 计算属性
    isLoggedIn,
    userName,
    userRole,

    // 方法
    hasRole,
    hasAnyRole,
    login,
    register,
    logout,
    fetchUserInfo,
    updateUserInfo
  }
})

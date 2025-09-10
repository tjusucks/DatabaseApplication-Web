import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 侧边栏状态
  const sidebarCollapsed = ref(false)
  
  // 主题设置
  const theme = ref(localStorage.getItem('theme') || 'light')
  
  // 语言设置
  const language = ref(localStorage.getItem('language') || 'zh-cn')
  
  // 页面加载状态
  const pageLoading = ref(false)
  
  // 全局加载状态
  const globalLoading = ref(false)
  
  // 面包屑导航
  const breadcrumbs = ref([])

  // 切换侧边栏
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value)
  }

  // 设置侧边栏状态
  const setSidebarCollapsed = (collapsed) => {
    sidebarCollapsed.value = collapsed
    localStorage.setItem('sidebarCollapsed', collapsed)
  }

  // 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', theme.value)
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  // 设置主题
  const setTheme = (newTheme) => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  // 设置语言
  const setLanguage = (lang) => {
    language.value = lang
    localStorage.setItem('language', lang)
  }

  // 设置页面加载状态
  const setPageLoading = (loading) => {
    pageLoading.value = loading
  }

  // 设置全局加载状态
  const setGlobalLoading = (loading) => {
    globalLoading.value = loading
  }

  // 设置面包屑
  const setBreadcrumbs = (crumbs) => {
    breadcrumbs.value = crumbs
  }

  // 初始化应用设置
  const initApp = () => {
    // 恢复侧边栏状态
    const savedSidebarState = localStorage.getItem('sidebarCollapsed')
    if (savedSidebarState !== null) {
      sidebarCollapsed.value = savedSidebarState === 'true'
    }

    // 应用主题
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  return {
    // 状态
    sidebarCollapsed,
    theme,
    language,
    pageLoading,
    globalLoading,
    breadcrumbs,

    // 方法
    toggleSidebar,
    setSidebarCollapsed,
    toggleTheme,
    setTheme,
    setLanguage,
    setPageLoading,
    setGlobalLoading,
    setBreadcrumbs,
    initApp
  }
})

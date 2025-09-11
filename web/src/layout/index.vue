<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <div class="sidebar-container" :class="{ collapsed: appStore.sidebarCollapsed }">
      <Sidebar />
    </div>

    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <div class="navbar-container">
        <Navbar />
      </div>

      <!-- 面包屑导航 -->
      <div class="breadcrumb-container">
        <Breadcrumb />
      </div>

      <!-- 页面内容 -->
      <div class="content-container">
        <router-view v-slot="{ Component, route }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </router-view>
      </div>
    </div>

    <!-- 全局加载遮罩 -->
    <div v-if="appStore.globalLoading" class="global-loading">
      <el-icon class="loading-icon">
        <Loading />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
import Breadcrumb from './components/Breadcrumb.vue'

const appStore = useAppStore()

onMounted(() => {
  appStore.initApp()
})
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  width: 100%;
}

.sidebar-container {
  width: 250px;
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.sidebar-container.collapsed {
  width: 64px;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.navbar-container {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.breadcrumb-container {
  height: 40px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.content-container {
  flex: 1;
  padding: 20px;
  background-color: #f0f2f5;
  overflow-y: auto;
}

.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Page transition animations */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Responsive design */
@media (max-width: 768px) {
  .sidebar-container {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s;
  }

  .sidebar-container:not(.collapsed) {
    transform: translateX(0);
  }

  .main-container {
    margin-left: 0;
    width: 100%;
  }
}

/* Large screen optimizations */
@media (min-width: 1200px) {
  .layout-container {
    max-width: none;
  }

  .content-container {
    padding: 24px;
  }
}

/* Medium screen optimizations */
@media (min-width: 769px) and (max-width: 1199px) {
  .content-container {
    padding: 20px;
  }
}
</style>

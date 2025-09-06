<template>
  <div class="sidebar">
    <!-- Logo 区域 -->
    <div class="logo-container">
      <img src="@/assets/logo.svg" alt="Logo" class="logo" />
      <h2 v-if="!appStore.sidebarCollapsed" class="title">主题公园管理</h2>
    </div>

    <!-- 菜单区域 -->
    <el-menu :default-active="activeMenu" :collapse="appStore.sidebarCollapsed" :unique-opened="true"
      background-color="#304156" text-color="#bfcbd9" active-text-color="#409EFF" router>
      <template v-for="item in menuList" :key="item.path">
        <!-- 单级菜单 -->
        <el-menu-item v-if="!item.children || item.children.length === 0" :index="item.path"
          @click="handleMenuClick(item)">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>

        <!-- 多级菜单 -->
        <el-sub-menu v-else :index="item.path">
          <template #title>
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.title }}</span>
          </template>

          <template v-for="child in item.children" :key="child.path">
            <!-- 二级菜单项 -->
            <el-menu-item v-if="!child.children || child.children.length === 0" :index="child.path"
              @click="handleMenuClick(child)">
              <el-icon>
                <component :is="child.icon || 'Document'" />
              </el-icon>
              <template #title>{{ child.title }}</template>
            </el-menu-item>

            <!-- 三级菜单 -->
            <el-sub-menu v-else :index="child.path">
              <template #title>
                <el-icon>
                  <component :is="child.icon || 'Folder'" />
                </el-icon>
                <span>{{ child.title }}</span>
              </template>

              <el-menu-item v-for="grandChild in child.children" :key="grandChild.path" :index="grandChild.path"
                @click="handleMenuClick(grandChild)">
                <el-icon>
                  <component :is="grandChild.icon || 'Document'" />
                </el-icon>
                <template #title>{{ grandChild.title }}</template>
              </el-menu-item>
            </el-sub-menu>
          </template>
        </el-sub-menu>
      </template>
    </el-menu>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { getMenuList } from '@/utils/menu'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 根据用户角色获取菜单列表
const menuList = computed(() => {
  return getMenuList(userStore.userRole)
})

// 处理菜单点击
const handleMenuClick = (menuItem) => {
  if (menuItem.path && menuItem.path !== route.path) {
    router.push(menuItem.path)
  }
}
</script>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  background-color: #2b3a4b;
  border-bottom: 1px solid #1f2d3d;
}

.logo {
  width: 32px;
  height: 32px;
}

.title {
  margin-left: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

.el-menu {
  flex: 1;
  border: none;
}

.el-menu:not(.el-menu--collapse) {
  width: 250px;
}

/* Menu item style adjustments */
:deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
}

:deep(.el-sub-menu .el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
}

:deep(.el-menu-item.is-active) {
  background-color: #409EFF !important;
}

:deep(.el-menu-item:hover) {
  background-color: #263445 !important;
}

:deep(.el-sub-menu__title:hover) {
  background-color: #263445 !important;
}

/* Mobile responsive design */
@media (max-width: 768px) {
  .logo-container {
    padding: 0 10px;
  }

  .title {
    font-size: 14px;
  }
}

/* Large screen sidebar width consistency */
@media (min-width: 1200px) {
  .el-menu:not(.el-menu--collapse) {
    width: 250px;
  }
}

/* Collapsed sidebar state */
.el-menu--collapse {
  width: 64px !important;
}

.el-menu--collapse .logo-container {
  justify-content: center;
  padding: 0 16px;
}
</style>

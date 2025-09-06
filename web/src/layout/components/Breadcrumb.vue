<template>
  <div class="breadcrumb-container">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item 
        v-for="(item, index) in breadcrumbs" 
        :key="item.path"
        :to="index === breadcrumbs.length - 1 ? undefined : item.path"
      >
        <el-icon v-if="item.icon" class="breadcrumb-icon">
          <component :is="item.icon" />
        </el-icon>
        {{ item.title }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getMenuList, generateBreadcrumbs } from '@/utils/menu'

const route = useRoute()
const userStore = useUserStore()

// 获取当前用户的菜单列表
const menuList = computed(() => {
  return getMenuList(userStore.userRole)
})

// 生成面包屑导航
const breadcrumbs = computed(() => {
  const crumbs = generateBreadcrumbs(menuList.value, route.path)
  
  // 如果没有找到匹配的菜单项，使用路由的 meta 信息
  if (crumbs.length === 0 && route.meta.title) {
    return [{
      path: route.path,
      title: route.meta.title,
      icon: route.meta.icon
    }]
  }
  
  return crumbs
})

// 监听路由变化，更新面包屑
watch(
  () => route.path,
  () => {
    // 这里可以添加额外的逻辑，比如更新页面标题等
  },
  { immediate: true }
)
</script>

<style scoped>
.breadcrumb-container {
  display: flex;
  align-items: center;
  height: 100%;
}

.breadcrumb-icon {
  margin-right: 4px;
  font-size: 14px;
}

:deep(.el-breadcrumb__item) {
  font-size: 14px;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #303133;
  font-weight: 500;
}

:deep(.el-breadcrumb__item .el-breadcrumb__inner) {
  color: #606266;
}

:deep(.el-breadcrumb__item .el-breadcrumb__inner:hover) {
  color: #409EFF;
}
</style>

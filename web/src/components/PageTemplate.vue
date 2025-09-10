<template>
  <div class="page-template-container">
    <el-card shadow="never">
      <template #header>
        <div class="page-header">
          <div class="header-content">
            <el-icon v-if="icon" :size="24" class="header-icon">
              <!-- 动态组件来显示Element Plus图标 -->
              <component :is="icon" />
            </el-icon>
            <div>
              <h2 class="title">{{ title }}</h2>
              <p class="description">{{ description }}</p>
            </div>
          </div>
        </div>
      </template>

      <!-- 主内容区域 -->
      <div class="page-content">
        <slot></slot>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

// 接收父组件传递的属性
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: 'Document',
  },
})
</script>

<style scoped>
.page-template-container {
  padding: 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-content {
  display: flex;
  align-items: center;
}
.header-icon {
  margin-right: 12px;
  color: #409eff; /* 主题色 */
}
.title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
.description {
  margin: 4px 0 0;
  color: #909399;
  font-size: 14px;
}
</style>

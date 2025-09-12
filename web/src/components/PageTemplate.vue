<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon v-if="icon" class="title-icon"><component :is="icon" /></el-icon>
        {{ title }}
      </h1>
      <p class="page-description">{{ description }}</p>
    </div>
    <div class="page-content">
      <div class="placeholder">
        <el-empty description="功能开发中，敬请期待..." />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

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
    default: '',
  },
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  background-color: #f5f7fa;
  height: 100%;
}

.page-header {
  padding-bottom: 20px;
  border-bottom: 1px solid #dcdfe6;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
}

.title-icon {
  margin-right: 10px;
}

.page-description {
  font-size: 14px;
  color: #606266;
  margin-top: 8px;
}

.page-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>

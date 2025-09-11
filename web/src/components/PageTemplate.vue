<template>
  <div class="page-template">
    <div class="page-header">
      <h2>{{ title }}</h2>
      <p v-if="description">{{ description }}</p>
    </div>

    <el-card>
      <div class="template-content">
        <el-icon size="64" color="#ddd">
          <component :is="icon" />
        </el-icon>
        <h3>{{ title }}</h3>
        <p>功能开发中，敬请期待...</p>
        <el-button type="primary" @click="$router.go(-1)">
          <el-icon><Back /></el-icon>
          返回上页
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
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
.page-template {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.template-content {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.template-content h3 {
  margin: 20px 0 10px 0;
  color: #606266;
}

.template-content p {
  margin-bottom: 30px;
}
</style>

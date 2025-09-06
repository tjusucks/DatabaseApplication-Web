<template>
  <div class="visitor-detail">
    <div class="page-header">
      <h2>游客详情</h2>
      <el-button @click="$router.go(-1)">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </el-button>
    </div>

    <el-card>
      <div class="detail-content">
        <el-icon size="64" color="#ddd">
          <User />
        </el-icon>
        <h3>游客详情页面</h3>
        <p>功能开发中...</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
// 页面逻辑开发中...
</script>

<style scoped>
.visitor-detail {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.detail-content {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.detail-content h3 {
  margin: 20px 0 10px 0;
  color: #606266;
}
</style>

<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人资料</span>
        </div>
      </template>

      <div class="profile-info">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <label class="info-label">用户名：</label>
              <span class="info-value">{{ userInfo.username || '未设置' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label class="info-label">显示名称：</label>
              <span class="info-value">{{ userInfo.displayName || '未设置' }}</span>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <label class="info-label">邮箱地址：</label>
              <span class="info-value">{{ userInfo.email || '未设置' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label class="info-label">手机号码：</label>
              <span class="info-value">{{ userInfo.phoneNumber || '未设置' }}</span>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <label class="info-label">出生日期：</label>
              <span class="info-value">{{ formattedBirthDate || '未设置' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label class="info-label">性别：</label>
              <span class="info-value">{{ formattedGender || '未设置' }}</span>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <label class="info-label">角色：</label>
              <span class="info-value">{{ userInfo.roleName || '未设置' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label class="info-label">注册时间：</label>
              <span class="info-value">{{ formattedRegisterTime || '未设置' }}</span>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <label class="info-label">权限级别：</label>
              <span class="info-value">{{ userInfo.permissionLevel ?? '未设置' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label class="info-label">用户ID：</label>
              <span class="info-value">{{ userInfo.userId || '未设置' }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 获取用户信息
const userInfo = computed(() => userStore.userInfo)

// 格式化注册时间
const formattedRegisterTime = computed(() => {
  if (userInfo.value.registerTime) {
    return new Date(userInfo.value.registerTime).toLocaleDateString('zh-CN')
  }
  return ''
})

// 格式化出生日期
const formattedBirthDate = computed(() => {
  if (userInfo.value.birthDate) {
    return new Date(userInfo.value.birthDate).toLocaleDateString('zh-CN')
  }
  return ''
})

// 格式化性别
const formattedGender = computed(() => {
  const genderMap = {
    'Male': '男',
    'Female': '女',
    'Other': '其他'
  }
  return genderMap[userInfo.value.gender] || ''
})


</script>

<style scoped>
.profile-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.profile-info {
  padding: 20px 0;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  min-height: 32px;
}

.info-label {
  font-weight: 500;
  color: #606266;
  min-width: 100px;
  margin-right: 12px;
}

.info-value {
  color: #303133;
  font-size: 14px;
  word-break: break-all;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-label {
    margin-bottom: 4px;
    margin-right: 0;
  }
}
</style>

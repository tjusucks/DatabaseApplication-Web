<template>
  <div class="reset-password-container">
    <div class="reset-password-box">
      <!-- 标题区域 -->
      <div class="reset-password-header">
        <h2>重置密码</h2>
        <p>请输入您的用户名或邮箱地址</p>
      </div>

      <!-- 重置密码表单 -->
      <el-form ref="resetFormRef" :model="resetForm" :rules="resetRules" class="reset-form" label-position="top">
        <el-form-item label="用户名或邮箱" prop="identifier">
          <el-input v-model="resetForm.identifier" placeholder="请输入用户名或邮箱地址" size="large" prefix-icon="User"
            clearable />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="handleResetPassword" class="reset-button">
            {{ loading ? '发送中...' : '发送重置链接' }}
          </el-button>
        </el-form-item>

        <el-form-item>
          <div class="reset-footer">
            <el-text>记起密码了？</el-text>
            <el-link type="primary" :underline="false" @click="goToLogin">
              返回登录
            </el-link>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { resetPassword } from '@/api/auth'

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const resetFormRef = ref()

// 加载状态
const loading = ref(false)

// 重置密码表单数据
const resetForm = reactive({
  identifier: ''
})

// 表单验证规则
const resetRules = {
  identifier: [
    { required: true, message: '请输入用户名或邮箱地址', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ]
}

// 处理密码重置
const handleResetPassword = async () => {
  if (!resetFormRef.value) return

  try {
    const valid = await resetFormRef.value.validate()
    if (!valid) return

    loading.value = true

    await resetPassword({
      identifier: resetForm.identifier
    })

    ElMessage.success('重置链接已发送到您的邮箱，请查收')
    router.push('/login')
  } catch (error) {
    console.error('密码重置失败:', error)
    ElMessage.error(error.response?.data?.message || '密码重置失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}

// 组件挂载时的初始化
onMounted(() => {
  // 如果已经登录，直接跳转到首页
  if (userStore.isLoggedIn) {
    router.push('/')
  }
})
</script>

<style scoped>
.reset-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.reset-password-box {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.reset-password-header {
  text-align: center;
  margin-bottom: 32px;
}

.reset-password-header h2 {
  color: #303133;
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 600;
}

.reset-password-header p {
  color: #909399;
  margin: 0;
  font-size: 14px;
}

.reset-form {
  width: 100%;
}

.reset-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

.reset-footer {
  text-align: center;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .reset-password-container {
    padding: 10px;
  }

  .reset-password-box {
    padding: 24px;
  }

  .reset-password-header h2 {
    font-size: 24px;
  }
}
</style>

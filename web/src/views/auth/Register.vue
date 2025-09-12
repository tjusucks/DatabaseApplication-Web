<template>
  <div class="register-container">
    <div class="register-box">
      <!-- 标题区域 -->
      <div class="register-header">
        <h2>用户注册</h2>
        <p>创建您的账户，开始使用系统</p>
      </div>

      <!-- 注册表单 -->
      <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="register-form"
        label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" size="large" prefix-icon="User" clearable />
        </el-form-item>

        <el-form-item label="显示名称" prop="displayName">
          <el-input v-model="registerForm.displayName" placeholder="请输入显示名称" size="large" prefix-icon="Avatar"
            clearable />
        </el-form-item>

        <el-form-item label="邮箱地址" prop="email">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱地址（可选）" size="large" prefix-icon="Message"
            clearable />
        </el-form-item>

        <el-form-item label="手机号码" prop="phoneNumber">
          <el-input v-model="registerForm.phoneNumber" placeholder="请输入手机号码（可选）" size="large" prefix-icon="Phone"
            clearable />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" size="large" prefix-icon="Lock"
            show-password clearable />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" size="large"
            prefix-icon="Lock" show-password clearable />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="handleRegister" class="register-button">
            {{ loading ? '注册中...' : '立即注册' }}
          </el-button>
        </el-form-item>

        <el-form-item>
          <div class="register-footer">
            <el-text>已有账号？</el-text>
            <el-link type="primary" :underline="false" @click="goToLogin">
              立即登录
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
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const registerFormRef = ref()

// 加载状态
const loading = ref(false)

// 注册表单数据
const registerForm = reactive({
  username: '',
  displayName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: ''
})



// 表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 50, message: '用户名长度在 2 到 50 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  displayName: [
    { required: true, message: '请输入显示名称', trigger: 'blur' },
    { min: 1, max: 100, message: '显示名称长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phoneNumber: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 100, message: '密码长度在 6 到 100 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}



// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) return

    loading.value = true

    await userStore.register(registerForm)
    router.push('/')
  } catch (error) {
    console.error('注册失败:', error)
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
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-box {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.register-header h2 {
  color: #303133;
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 600;
}

.register-header p {
  color: #909399;
  margin: 0;
  font-size: 14px;
}

.register-form {
  width: 100%;
}

.register-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

.register-footer {
  text-align: center;
  margin-top: 16px;
}



@media (max-width: 768px) {
  .register-container {
    padding: 10px;
  }

  .register-box {
    padding: 24px;
  }

  .register-header h2 {
    font-size: 24px;
  }
}
</style>

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
          <el-input v-model="registerForm.username" placeholder="请输入用户名" size="large" prefix-icon="User" clearable
            @blur="checkUsernameAvailability" />
          <div v-if="usernameCheckResult" class="field-hint">
            <el-text :type="usernameCheckResult.available ? 'success' : 'danger'">
              {{ usernameCheckResult.message }}
            </el-text>
          </div>
        </el-form-item>

        <el-form-item label="显示名称" prop="displayName">
          <el-input v-model="registerForm.displayName" placeholder="请输入显示名称" size="large" prefix-icon="Avatar"
            clearable />
        </el-form-item>

        <el-form-item label="邮箱地址" prop="email">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱地址（可选）" size="large" prefix-icon="Message" clearable
            @blur="checkEmailAvailability" />
          <div v-if="emailCheckResult" class="field-hint">
            <el-text :type="emailCheckResult.available ? 'success' : 'danger'">
              {{ emailCheckResult.message }}
            </el-text>
          </div>
        </el-form-item>

        <el-form-item label="手机号码" prop="phoneNumber">
          <el-input v-model="registerForm.phoneNumber" placeholder="请输入手机号码（可选）" size="large" prefix-icon="Phone"
            clearable />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" size="large" prefix-icon="Lock"
            show-password clearable @input="checkPasswordStrength" />
          <!-- 密码强度指示器 -->
          <div v-if="passwordStrength" class="password-strength">
            <div class="strength-bar">
              <div class="strength-fill" :class="`strength-${passwordStrength.level}`"
                :style="{ width: `${(passwordStrength.score / 5) * 100}%` }"></div>
            </div>
            <el-text :type="passwordStrength.type" size="small">
              {{ passwordStrength.feedback }}
            </el-text>
          </div>
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" size="large"
            prefix-icon="Lock" show-password clearable />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="handleRegister" :disabled="!isFormValid"
            class="register-button">
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { checkUsernameAvailability as checkUsernameAPI, checkEmailAvailability as checkEmailAPI } from '@/api/auth'

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

// 用户名和邮箱可用性检查结果
const usernameCheckResult = ref(null)
const emailCheckResult = ref(null)

// 密码强度检查结果
const passwordStrength = ref(null)

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
      validator: (rule, value, callback) => {
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

// 检查表单是否有效
const isFormValid = computed(() => {
  return registerForm.username &&
    registerForm.displayName &&
    registerForm.password &&
    registerForm.confirmPassword &&
    registerForm.password === registerForm.confirmPassword &&
    (!usernameCheckResult.value || usernameCheckResult.value.available) &&
    (!emailCheckResult.value || emailCheckResult.value.available || !registerForm.email)
})

// 检查用户名可用性
const checkUsernameAvailability = async () => {
  if (!registerForm.username || registerForm.username.length < 2) {
    usernameCheckResult.value = null
    return
  }

  try {
    const response = await checkUsernameAPI(registerForm.username)
    usernameCheckResult.value = {
      available: response.isAvailable,
      message: response.isAvailable ? '用户名可用' : '用户名已被使用'
    }
  } catch (error) {
    usernameCheckResult.value = {
      available: false,
      message: '检查用户名可用性失败'
    }
  }
}

// 检查邮箱可用性
const checkEmailAvailability = async () => {
  if (!registerForm.email) {
    emailCheckResult.value = null
    return
  }

  try {
    const response = await checkEmailAPI(registerForm.email)
    emailCheckResult.value = {
      available: response.isAvailable,
      message: response.isAvailable ? '邮箱可用' : '邮箱已被使用'
    }
  } catch (error) {
    emailCheckResult.value = {
      available: false,
      message: '检查邮箱可用性失败'
    }
  }
}

// 检查密码强度
const checkPasswordStrength = () => {
  const password = registerForm.password
  if (!password) {
    passwordStrength.value = null
    return
  }

  let score = 0
  let feedback = []

  // 长度检查
  if (password.length >= 8) score++
  else feedback.push('至少8个字符')

  // 大写字母
  if (/[A-Z]/.test(password)) score++
  else feedback.push('包含大写字母')

  // 小写字母
  if (/[a-z]/.test(password)) score++
  else feedback.push('包含小写字母')

  // 数字
  if (/[0-9]/.test(password)) score++
  else feedback.push('包含数字')

  // 特殊字符
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++
  else feedback.push('包含特殊字符')

  // 长度奖励
  if (password.length >= 12) score++

  const levels = ['very-weak', 'weak', 'fair', 'good', 'strong']
  const levelNames = ['很弱', '弱', '一般', '强', '很强']
  const types = ['danger', 'danger', 'warning', 'success', 'success']

  const level = Math.min(score, 4)

  passwordStrength.value = {
    score,
    level: levels[level],
    type: types[level],
    feedback: feedback.length > 0
      ? `密码强度: ${levelNames[level]}。建议: ${feedback.join('、')}`
      : `密码强度: ${levelNames[level]}`
  }
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) return

    loading.value = true

    await userStore.register(registerForm)

    ElMessage.success('注册成功，欢迎使用！')
    router.push('/')
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error(error.message || '注册失败，请稍后重试')
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

.field-hint {
  margin-top: 4px;
  font-size: 12px;
}

.password-strength {
  margin-top: 8px;
}

.strength-bar {
  width: 100%;
  height: 4px;
  background-color: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-very-weak {
  background-color: #f56c6c;
}

.strength-weak {
  background-color: #e6a23c;
}

.strength-fair {
  background-color: #f7ba2a;
}

.strength-good {
  background-color: #67c23a;
}

.strength-strong {
  background-color: #409eff;
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

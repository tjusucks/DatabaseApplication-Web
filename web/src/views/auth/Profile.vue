<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人资料</span>
        </div>
      </template>

      <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="profileForm.username" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示名称" prop="displayName">
              <el-input v-model="profileForm.displayName" placeholder="请输入显示名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱地址" prop="email">
              <el-input v-model="profileForm.email" placeholder="请输入邮箱地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phoneNumber">
              <el-input v-model="profileForm.phoneNumber" placeholder="请输入手机号码" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出生日期" prop="birthDate">
              <el-date-picker v-model="profileForm.birthDate" type="date" placeholder="请选择出生日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="profileForm.gender" placeholder="请选择性别" style="width: 100%">
                <el-option label="男" value="Male" />
                <el-option label="女" value="Female" />
                <el-option label="其他" value="Other" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="角色">
              <el-input v-model="profileForm.roleName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="注册时间">
              <el-input v-model="formattedRegisterTime" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleUpdateProfile">
            {{ loading ? '保存中...' : '保存修改' }}
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 修改密码卡片 -->
    <el-card class="password-card">
      <template #header>
        <div class="card-header">
          <span>修改密码</span>
        </div>
      </template>

      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input v-model="passwordForm.currentPassword" type="password" placeholder="请输入当前密码" show-password />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="passwordLoading" @click="handleChangePassword">
            {{ passwordLoading ? '修改中...' : '修改密码' }}
          </el-button>
          <el-button @click="handleResetPasswordForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { changePassword } from '@/api/auth'

const userStore = useUserStore()

// 表单引用
const profileFormRef = ref()
const passwordFormRef = ref()

// 加载状态
const loading = ref(false)
const passwordLoading = ref(false)

// 个人资料表单数据
const profileForm = reactive({
  username: '',
  displayName: '',
  email: '',
  phoneNumber: '',
  birthDate: null,
  gender: null,
  roleName: ''
})

// 密码修改表单数据
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 格式化注册时间
const formattedRegisterTime = computed(() => {
  if (userStore.userInfo.registerTime) {
    return new Date(userStore.userInfo.registerTime).toLocaleDateString('zh-CN')
  }
  return ''
})

// 个人资料表单验证规则
const profileRules = {
  displayName: [
    { required: true, message: '请输入显示名称', trigger: 'blur' },
    { min: 1, max: 100, message: '显示名称长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phoneNumber: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 密码修改表单验证规则
const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 100, message: '密码长度在 6 到 100 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 初始化表单数据
const initializeForm = () => {
  const userInfo = userStore.userInfo
  profileForm.username = userInfo.username || ''
  profileForm.displayName = userInfo.displayName || ''
  profileForm.email = userInfo.email || ''
  profileForm.phoneNumber = userInfo.phoneNumber || ''
  profileForm.birthDate = userInfo.birthDate ? new Date(userInfo.birthDate) : null
  profileForm.gender = userInfo.gender || null
  profileForm.roleName = userInfo.roleName || ''
}

// 处理个人资料更新
const handleUpdateProfile = async () => {
  if (!profileFormRef.value) return

  try {
    const valid = await profileFormRef.value.validate()
    if (!valid) return

    loading.value = true

    // 这里应该调用更新个人资料的API
    // 暂时只更新本地状态
    userStore.updateUserInfo({
      displayName: profileForm.displayName,
      email: profileForm.email,
      phoneNumber: profileForm.phoneNumber,
      birthDate: profileForm.birthDate,
      gender: profileForm.gender
    })

    ElMessage.success('个人资料更新成功')
  } catch (error) {
    console.error('更新个人资料失败:', error)
    ElMessage.error('更新失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理取消操作
const handleCancel = () => {
  initializeForm()
}

// 处理密码修改
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    const valid = await passwordFormRef.value.validate()
    if (!valid) return

    passwordLoading.value = true

    await changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })

    ElMessage.success('密码修改成功')
    handleResetPasswordForm()
  } catch (error) {
    console.error('密码修改失败:', error)
  } finally {
    passwordLoading.value = false
  }
}

// 重置密码表单
const handleResetPasswordForm = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  if (passwordFormRef.value) {
    passwordFormRef.value.clearValidate()
  }
}

// 组件挂载时初始化
onMounted(() => {
  initializeForm()
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

.password-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }
}
</style>

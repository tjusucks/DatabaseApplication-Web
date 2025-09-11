<template>
  <div class="visitor-create">
    <div class="page-header">
      <div class="header-left">
        <h2>新增游客</h2>
        <p>填写游客基本信息</p>
      </div>
      <div class="header-actions">
        <el-button @click="$router.go(-1)">
          <el-icon><Back /></el-icon>
          返回
        </el-button>
      </div>
    </div>

    <el-card class="form-card">
      <template #header>
        <span>游客信息</span>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
        class="visitor-form"
        v-loading="submitting"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="姓名" prop="displayName">
              <el-input
                v-model="form.displayName"
                placeholder="请输入游客姓名"
                @blur="generateUsername"
              />
            </el-form-item>
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="系统自动生成" readonly />
              <template #append>
                <el-button @click="generateUsername" size="small">重新生成</el-button>
              </template>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="form.email"
                placeholder="请输入邮箱（可选）"
                @blur="validateMemberContact"
              />
            </el-form-item>
            <el-form-item label="电话" prop="phoneNumber">
              <el-input
                v-model="form.phoneNumber"
                placeholder="请输入电话号码（可选）"
                @blur="validateMemberContact"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身高" prop="height">
              <el-input-number
                v-model="form.height"
                :min="50"
                :max="250"
                placeholder="请输入身高(cm)"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-select v-model="form.gender" placeholder="请选择性别" style="width: 100%">
                <el-option label="男" :value="0" />
                <el-option label="女" :value="1" />
                <el-option label="其他" :value="2" />
              </el-select>
            </el-form-item>
            <el-form-item label="生日" prop="birthDate">
              <el-date-picker
                v-model="form.birthDate"
                type="date"
                placeholder="请选择生日（可选）"
                style="width: 100%"
                :disabled-date="disabledDate"
              />
            </el-form-item>
            <el-form-item label="游客类型" prop="visitorType">
              <el-select
                v-model="form.visitorType"
                placeholder="请选择游客类型"
                style="width: 100%"
              >
                <el-option label="普通游客" value="Regular" />
                <el-option label="会员" value="Member" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <div class="form-actions">
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="$router.go(-1)">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            创建游客
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createVisitor } from '@/api/visitors'

const router = useRouter()

// 表单引用和状态
const formRef = ref()
const submitting = ref(false)

// 表单数据
const form = reactive({
  username: '',
  password: 'visitor', // 统一固定密码
  displayName: '',
  email: '',
  phoneNumber: '',
  gender: 0,
  birthDate: '',
  height: 170,
  visitorType: 'Regular',
})

// 生成UUID（简化版）
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// 自动生成用户名
const generateUsername = () => {
  if (!form.displayName.trim()) {
    ElMessage.warning('请先输入游客姓名')
    return
  }

  // 使用UUID确保绝对唯一性
  const uuid = generateUUID().replace(/-/g, '').slice(0, 12) // 取前12位

  // 移除姓名中的特殊字符，只保留字母、数字和中文，限制长度
  const cleanName = form.displayName.replace(/[^\w\u4e00-\u9fa5]/g, '').slice(0, 8)

  form.username = `visitor_${cleanName}_${uuid}`
}

// 验证会员类型
const validateMemberType = (rule, value, callback) => {
  if (value === 'Member') {
    // 检查是否有邮箱或电话
    const hasEmail = form.email && form.email.trim()
    const hasPhone = form.phoneNumber && form.phoneNumber.trim()

    if (!hasEmail && !hasPhone) {
      callback(new Error('会员账户必须提供邮箱或电话号码中的至少一项'))
      return
    }
  }
  callback()
}

// 验证会员联系方式（当邮箱或电话变化时触发）
const validateMemberContact = () => {
  if (form.visitorType === 'Member') {
    // 重新验证游客类型字段
    formRef.value?.validateField('visitorType')
  }
}

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' },
  ],
  displayName: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  email: [{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }],
  phoneNumber: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  height: [
    { required: true, message: '请输入身高', trigger: 'blur' },
    { type: 'number', min: 50, max: 250, message: '身高应在 50-250cm 之间', trigger: 'blur' },
  ],
  visitorType: [
    { required: true, message: '请选择游客类型', trigger: 'change' },
    { validator: validateMemberType, trigger: 'change' },
  ],
}

// 禁用未来日期
const disabledDate = (time) => {
  return time.getTime() > Date.now()
}

// 重置表单
const handleReset = () => {
  formRef.value.resetFields()
  Object.assign(form, {
    username: '',
    password: '',
    displayName: '',
    email: '',
    phoneNumber: '',
    gender: 0,
    birthDate: '',
    height: 170,
    visitorType: 'Regular',
  })
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 表单验证
    await formRef.value.validate()

    submitting.value = true

    // 构建提交数据
    const submitData = {
      username: form.username,
      passwordHash: form.password,
      displayName: form.displayName,
      email: form.email || null,
      phoneNumber: form.phoneNumber || null,
      birthDate: form.birthDate || null,
      gender: form.gender,
      height: form.height,
      visitorType: form.visitorType,
    }

    const response = await createVisitor(submitData)

    // 检查响应是否成功
    if (response && (response.visitorId || typeof response === 'number')) {
      ElMessage.success('游客创建成功')
      // 跳转到游客详情页
      router.push(`/visitors/${response.visitorId || response}`)
    } else {
      throw new Error('创建响应异常')
    }
  } catch (error) {
    console.error('创建游客失败:', error)

    // 检查是否是用户名重复错误
    if (
      error.response?.data?.message?.includes('username') ||
      error.message?.includes('username') ||
      error.response?.data?.message?.includes('唯一约束')
    ) {
      ElMessage.error('用户名已存在，请重新生成用户名')
      // 自动重新生成用户名
      generateUsername()
    } else if (error.response?.data?.message) {
      ElMessage.error('创建失败：' + error.response.data.message)
    } else if (error.message && !error.message.includes('服务器内部错误')) {
      ElMessage.error('创建失败：' + error.message)
    } else {
      ElMessage.error('创建失败，请检查输入信息后重试')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.visitor-create {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-left h2 {
  margin: 0 0 4px 0;
  font-size: 24px;
  color: #303133;
}

.header-left p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.form-card {
  max-width: 1000px;
  margin: 0 auto;
}

.visitor-form {
  padding: 20px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .el-button {
    flex: 1;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .el-button {
    width: 100%;
  }
}
</style>

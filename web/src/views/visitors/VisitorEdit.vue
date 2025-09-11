<template>
  <div class="visitor-edit">
    <div class="page-header">
      <div class="header-left">
        <h2>编辑游客</h2>
        <p>修改游客基本信息</p>
      </div>
      <div class="header-actions">
        <el-button @click="$router.go(-1)">
          <el-icon><Back /></el-icon>
          返回
        </el-button>
      </div>
    </div>

    <el-card class="form-card" v-loading="loading">
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
              <el-input v-model="form.displayName" placeholder="请输入游客姓名" />
            </el-form-item>
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="用户名" readonly />
              <template #append>
                <el-tooltip content="用户名创建后不可修改" placement="top">
                  <el-button size="small" disabled>
                    <el-icon><Lock /></el-icon>
                  </el-button>
                </el-tooltip>
              </template>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱（可选）" @blur="validateMemberContact" />
            </el-form-item>
            <el-form-item label="电话" prop="phoneNumber">
              <el-input v-model="form.phoneNumber" placeholder="请输入电话号码（可选）" @blur="validateMemberContact" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身高" prop="height">
              <el-input-number
                v-model="form.height"
                :min="50"
                :max="300"
                :step="1"
                controls-position="right"
                style="width: 100%"
              />
              <span class="unit">厘米</span>
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio :value="0">男</el-radio>
                <el-radio :value="1">女</el-radio>
                <el-radio :value="2">其他</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="生日" prop="birthDate">
              <el-date-picker
                v-model="form.birthDate"
                type="date"
                placeholder="请选择生日（可选）"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item label="游客类型">
              <el-input :value="originalData?.visitorType === 'Member' ? '会员' : '普通游客'" readonly>
                <template #append>
                  <el-tooltip content="游客类型需要通过专门的会员管理功能修改" placement="top">
                    <el-button size="small" disabled>
                      <el-icon><Lock /></el-icon>
                    </el-button>
                  </el-tooltip>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 会员信息区域 -->
        <div v-if="originalData?.visitorType === 'Member'" class="member-section">
          <el-divider content-position="left">会员信息</el-divider>
          <el-alert
            title="会员信息只读"
            type="info"
            :closable="false"
            show-icon>
            <template #default>
              <p>会员等级、积分等信息需要通过专门的会员管理功能进行修改。</p>
            </template>
          </el-alert>
          <el-row :gutter="24" style="margin-top: 16px;">
            <el-col :span="8">
              <el-form-item label="会员等级">
                <el-input :value="originalData?.memberLevel || 'Bronze'" readonly />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="积分">
                <el-input :value="originalData?.points || 0" readonly />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="成为会员时间">
                <el-input :value="formatDate(originalData?.memberSince)" readonly />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 状态信息 -->
        <el-divider content-position="left">状态信息</el-divider>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="黑名单状态">
              <el-input :value="originalData?.isBlacklisted ? '已拉黑' : '正常'" readonly>
                <template #append>
                  <el-tooltip content="黑名单状态需要通过专门的黑名单管理功能修改" placement="top">
                    <el-button size="small" disabled>
                      <el-icon><Lock /></el-icon>
                    </el-button>
                  </el-tooltip>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="注册时间">
              <el-input :value="formatDate(originalData?.user?.registerTime)" readonly />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            <el-icon><Check /></el-icon>
            保存修改
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button @click="$router.go(-1)">
            <el-icon><Close /></el-icon>
            取消
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Back, Lock, Check, Refresh, Close 
} from '@element-plus/icons-vue'
import { getVisitorById, updateVisitor, updateVisitorContact } from '@/api/visitors'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const formRef = ref()
const originalData = ref(null)

// 表单数据
const form = reactive({
  displayName: '',
  username: '',
  email: '',
  phoneNumber: '',
  birthDate: '',
  gender: 0,
  height: 170
})

// 表单验证规则
const formRules = {
  displayName: [
    { required: true, message: '请输入游客姓名', trigger: 'blur' },
    { min: 1, max: 50, message: '姓名长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  height: [
    { required: true, message: '请输入身高', trigger: 'blur' },
    { type: 'number', min: 50, max: 300, message: '身高必须在 50-300 厘米之间', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phoneNumber: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 获取游客详情
const fetchVisitorDetail = async () => {
  try {
    loading.value = true
    const visitorId = route.params.id
    const data = await getVisitorById(visitorId)
    
    originalData.value = data
    
    // 填充表单数据
    form.displayName = data.user?.displayName || ''
    form.username = data.user?.username || ''
    form.email = data.user?.email || ''
    form.phoneNumber = data.user?.phoneNumber || ''
    form.birthDate = data.user?.birthDate ? data.user.birthDate.split('T')[0] : ''
    form.gender = data.user?.gender === 'Male' ? 0 : data.user?.gender === 'Female' ? 1 : 2
    form.height = data.height || 170
    
  } catch (error) {
    ElMessage.error('获取游客信息失败：' + error.message)
    router.go(-1)
  } finally {
    loading.value = false
  }
}

// 验证会员联系方式
const validateMemberContact = () => {
  if (originalData.value?.visitorType === 'Member') {
    const hasEmail = form.email && form.email.trim()
    const hasPhone = form.phoneNumber && form.phoneNumber.trim()

    if (!hasEmail && !hasPhone) {
      ElMessage.warning('会员账户必须提供邮箱或电话号码中的至少一项')
      return false
    }
  }
  return true
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 表单验证
    await formRef.value.validate()

    // 验证会员联系方式
    if (!validateMemberContact()) {
      return
    }

    submitting.value = true

    // 构建基本信息更新数据（匹配后端UpdateVisitorCommand）
    const basicData = {
      visitorId: parseInt(route.params.id),
      displayName: form.displayName,
      phoneNumber: form.phoneNumber || null,
      birthDate: form.birthDate || null,
      gender: form.gender === 0 ? 'Male' : form.gender === 1 ? 'Female' : 'Other',
      visitorType: originalData.value?.visitorType, // 保持原有类型不变
      height: form.height
    }

    // 构建联系信息更新数据
    const contactData = {
      visitorId: parseInt(route.params.id),
      email: form.email || null,
      phoneNumber: form.phoneNumber || null
    }

    // 分别调用两个API
    await updateVisitor(route.params.id, basicData)
    await updateVisitorContact(route.params.id, contactData)

    ElMessage.success('游客信息更新成功')

    // 跳转到游客详情页
    router.push(`/visitors/${route.params.id}`)

  } catch (error) {
    console.error('更新游客失败:', error)

    if (error.response?.data?.message) {
      ElMessage.error('更新失败：' + error.response.data.message)
    } else if (error.message && !error.message.includes('服务器内部错误')) {
      ElMessage.error('更新失败：' + error.message)
    } else {
      ElMessage.error('更新失败，请检查输入信息后重试')
    }
  } finally {
    submitting.value = false
  }
}

// 重置表单
const handleReset = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置表单吗？这将恢复到原始数据。',
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 重新获取原始数据
    await fetchVisitorDetail()
    ElMessage.success('表单已重置')
    
  } catch (error) {
    // 用户取消操作
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchVisitorDetail()
})
</script>

<style scoped>
.visitor-edit {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.header-left p {
  margin: 0;
  color: #909399;
}

.form-card {
  max-width: 1000px;
}

.visitor-form {
  padding: 20px;
}

.unit {
  margin-left: 8px;
  color: #909399;
  font-size: 14px;
}

.member-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 4px;
  margin: 20px 0;
}

.form-actions {
  margin-top: 30px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}

.form-actions .el-button {
  margin: 0 8px;
}
</style>

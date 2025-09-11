<template>
  <div class="employee-create">
    <div class="page-header">
      <h2>新增员工</h2>
      <p>添加新的员工信息</p>
    </div>

    <el-card>
      <el-form
        ref="formRef"
        :model="employeeForm"
        :rules="formRules"
        label-width="120px"
        @submit.prevent="handleSubmit"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="employeeForm.username" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input v-model="employeeForm.password" type="password" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="显示名称" prop="displayName">
              <el-input v-model="employeeForm.displayName" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="employeeForm.email" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="电话号码" prop="phoneNumber">
              <el-input v-model="employeeForm.phoneNumber" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="出生日期" prop="birthDate">
              <el-date-picker
                v-model="employeeForm.birthDate"
                type="date"
                placeholder="请选择出生日期"
                style="width: 100%;"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="员工类型" prop="employeeType">
              <el-select v-model="employeeForm.employeeType" placeholder="请选择员工类型" clearable style="width: 100%;">
                <el-option
                  v-for="item in employeeTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="员工编号" prop="staffNumber">
              <el-input v-model="employeeForm.staffNumber" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="职位" prop="position">
              <el-input v-model="employeeForm.position" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="部门" prop="departmentName">
              <el-select 
                v-model="employeeForm.departmentName" 
                placeholder="请选择部门" 
                clearable 
                style="width: 100%;"
                filterable
                allow-create
              >
                <el-option
                  v-for="item in departmentOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="员工角色类型" prop="staffType">
              <el-select v-model="employeeForm.staffType" placeholder="请选择员工角色类型" clearable style="width: 100%;">
                <el-option
                  v-for="item in staffTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="证书" prop="certification">
              <el-input v-model="employeeForm.certification" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="责任区域" prop="responsibilityArea">
              <el-input v-model="employeeForm.responsibilityArea" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="团队ID" prop="teamId">
              <el-input-number
                v-model="employeeForm.teamId"
                controls-position="right"
                :min="0"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="上级ID" prop="managerId">
              <el-input-number
                v-model="employeeForm.managerId"
                controls-position="right"
                :min="0"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <div class="form-actions">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">创建</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createEmployee, getEmployees } from '@/api/hr'

// 路由
const router = useRouter()

// 表单引用
const formRef = ref()

// 提交状态
const submitLoading = ref(false)

// 部门选项
const departmentOptions = ref([])

// 员工表单数据
const employeeForm = reactive({
  username: '',
  password: '',
  displayName: '',
  email: '',
  phoneNumber: '',
  birthDate: '',
  employeeType: 1, // 默认为Employee
  staffNumber: '',
  position: '',
  departmentName: '',
  staffType: null,
  certification: '',
  responsibilityArea: '',
  teamId: null,
  managerId: null
})

// 员工类型选项
const employeeTypeOptions = [
  { value: 0, label: '管理员' },
  { value: 1, label: '普通员工' }
]

// 员工角色类型选项
const staffTypeOptions = [
  { value: 0, label: '普通员工' },
  { value: 1, label: '检查员' },
  { value: 2, label: '技工' },
  { value: 3, label: '管理人员' }
]

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  displayName: [
    { required: true, message: '请输入显示名称', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  staffNumber: [
    { required: true, message: '请输入员工编号', trigger: 'blur' }
  ],
  position: [
    { required: true, message: '请输入职位', trigger: 'blur' }
  ]
}

// 获取部门列表
const fetchDepartments = async () => {
  try {
    const response = await getEmployees()
    if (Array.isArray(response)) {
      // 从员工数据中提取唯一的部门名称
      const departments = [...new Set(response.map(emp => emp.departmentName).filter(Boolean))]
      departmentOptions.value = departments
    }
  } catch (error) {
    console.error('获取部门列表失败:', error)
    // 使用默认部门列表
    departmentOptions.value = ['人力资源部', '财务部', '运营部', '技术部', '市场部']
  }
}

// 处理表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      // 准备创建数据
      const createData = {
        username: employeeForm.username,
        passwordHash: employeeForm.password,
        displayName: employeeForm.displayName,
        email: employeeForm.email,
        phoneNumber: employeeForm.phoneNumber,
        birthDate: employeeForm.birthDate,
        employeeType: employeeForm.employeeType,
        staffNumber: employeeForm.staffNumber,
        position: employeeForm.position,
        departmentName: employeeForm.departmentName,
        teamId: employeeForm.teamId,
        managerId: employeeForm.managerId,
        certification: employeeForm.certification,
        responsibilityArea: employeeForm.responsibilityArea,
        staffType: employeeForm.staffType
      }
      
      // 调用API创建员工
      await createEmployee(createData)
      
      ElMessage.success('员工创建成功')
      router.push('/hr/employees/list')
    } catch (error) {
      console.error('创建员工失败:', error)
      // 检查是否是201响应（创建成功）
      if (error && error.response && error.response.status === 201) {
        ElMessage.success('员工创建成功')
        router.push('/hr/employees/list')
      } else {
        ElMessage.error('创建员工失败: ' + (error.message || '未知错误'))
      }
    } finally {
      submitLoading.value = false
    }
  })
}

// 处理取消操作
const handleCancel = () => {
  router.go(-1)
}

// 组件挂载时获取部门列表
onMounted(() => {
  fetchDepartments()
})
</script>

<style scoped>
.employee-create {
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}
</style>
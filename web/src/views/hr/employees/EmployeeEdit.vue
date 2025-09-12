<template>
  <div class="employee-edit">
    <div class="page-header">
      <h2>编辑员工信息</h2>
      <p>修改员工基本信息</p>
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
              <el-input v-model="employeeForm.departmentName" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="员工类型" prop="staffType">
              <el-select
                v-model="employeeForm.staffType"
                placeholder="请选择员工类型"
                clearable
                style="width: 100%"
              >
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
            <el-form-item label="入职日期" prop="hireDate">
              <el-date-picker
                v-model="employeeForm.hireDate"
                type="date"
                placeholder="请选择入职日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="工作状态" prop="employmentStatus">
              <el-select
                v-model="employeeForm.employmentStatus"
                placeholder="请选择工作状态"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in employmentStatusOptions"
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
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="上级ID" prop="managerId">
              <el-input-number
                v-model="employeeForm.managerId"
                controls-position="right"
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="form-actions">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">保存</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getEmployeeById, updateEmployee } from '@/api/hr'

// 路由和参数
const route = useRoute()
const router = useRouter()

// 表单引用
const formRef = ref()

// 提交状态
const submitLoading = ref(false)

// 员工表单数据
const employeeForm = ref({
  employeeId: 0,
  staffNumber: '',
  position: '',
  departmentName: '',
  staffType: null,
  hireDate: '',
  employmentStatus: 0,
  certification: '',
  responsibilityArea: '',
  teamId: null,
  managerId: null,
})

// 员工类型选项
const staffTypeOptions = [
  { value: 0, label: '普通员工' },
  { value: 1, label: '检查员' },
  { value: 2, label: '技工' },
  { value: 3, label: '管理人员' },
]

// 工作状态选项
const employmentStatusOptions = [
  { value: 0, label: '在职' },
  { value: 1, label: '已离职' },
  { value: 2, label: '休假中' },
]

// 表单验证规则
const formRules = {
  staffNumber: [{ required: true, message: '请输入员工编号', trigger: 'blur' }],
  position: [{ required: true, message: '请输入职位', trigger: 'blur' }],
}

// 获取员工详情
const fetchEmployeeDetail = async (id) => {
  try {
    const response = await getEmployeeById(id)
    const employeeData = response.data || response

    // 填充表单数据
    employeeForm.value = {
      employeeId: employeeData.employeeId,
      staffNumber: employeeData.staffNumber,
      position: employeeData.position,
      departmentName: employeeData.departmentName || '',
      staffType: employeeData.staffType,
      hireDate: employeeData.hireDate,
      employmentStatus: employeeData.employmentStatus,
      certification: employeeData.certification || '',
      responsibilityArea: employeeData.responsibilityArea || '',
      teamId: employeeData.teamId,
      managerId: employeeData.managerId,
    }
  } catch (error) {
    console.error('获取员工详情失败:', error)
    ElMessage.error('获取员工详情失败: ' + (error.message || '未知错误'))
  }
}

// 处理表单提交
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      // 准备更新数据
      const updateData = {
        employeeId: employeeForm.value.employeeId,
        staffNumber: employeeForm.value.staffNumber,
        position: employeeForm.value.position,
        departmentName: employeeForm.value.departmentName,
        teamId: employeeForm.value.teamId,
        managerId: employeeForm.value.managerId,
        certification: employeeForm.value.certification,
        responsibilityArea: employeeForm.value.responsibilityArea,
      }

      // 调用API更新员工信息
      await updateEmployee(employeeForm.value.employeeId, updateData)

      ElMessage.success('员工信息更新成功')
      router.push('/hr/employees/list')
    } catch (error) {
      console.error('更新员工信息失败:', error)
      ElMessage.error('更新员工信息失败: ' + (error.message || '未知错误'))
    } finally {
      submitLoading.value = false
    }
  })
}

// 处理取消操作
const handleCancel = () => {
  router.go(-1)
}

// 组件挂载时获取数据
onMounted(() => {
  const employeeId = route.params.id || route.params.employeeId
  if (employeeId) {
    fetchEmployeeDetail(employeeId)
  }
})
</script>

<style scoped>
.employee-edit {
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

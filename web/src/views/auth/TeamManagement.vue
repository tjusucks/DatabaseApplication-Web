<template>
  <div class="team-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>团队管理</h2>
      <p>管理团队成员和组织架构</p>
    </div>

    <!-- 搜索和操作区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="成员姓名">
          <el-input 
            v-model="searchForm.name" 
            placeholder="请输入成员姓名"
            clearable
          />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="searchForm.department" placeholder="请选择部门" clearable>
            <el-option label="管理部" value="management" />
            <el-option label="财务部" value="finance" />
            <el-option label="人事部" value="hr" />
            <el-option label="运营部" value="operations" />
            <el-option label="票务部" value="ticketing" />
            <el-option label="客服部" value="customer_service" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="请选择角色" clearable>
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="财务管理员" value="finance_manager" />
            <el-option label="人事管理员" value="hr_manager" />
            <el-option label="运营管理员" value="operations_manager" />
            <el-option label="票务管理员" value="ticket_manager" />
            <el-option label="客服人员" value="customer_service" />
            <el-option label="普通员工" value="employee" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加成员
        </el-button>
        <el-button type="success" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table 
        :data="tableData" 
        v-loading="loading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="员工ID" width="100" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="department" label="部门" width="120">
          <template #default="{ row }">
            {{ getDepartmentText(row.department) }}
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="140">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">
              {{ getRoleText(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '激活' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="joinDate" label="加入时间" width="160" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button type="warning" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="info" size="small" @click="handlePermissions(row)">
              权限
            </el-button>
            <el-button 
              :type="row.status === 'active' ? 'danger' : 'success'" 
              size="small" 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑成员对话框 -->
    <el-dialog v-model="memberDialogVisible" :title="isEdit ? '编辑成员' : '添加成员'" width="600px">
      <el-form :model="memberForm" :rules="memberRules" ref="memberFormRef" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="memberForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="memberForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-select v-model="memberForm.department" placeholder="请选择部门" style="width: 100%">
            <el-option label="管理部" value="management" />
            <el-option label="财务部" value="finance" />
            <el-option label="人事部" value="hr" />
            <el-option label="运营部" value="operations" />
            <el-option label="票务部" value="ticketing" />
            <el-option label="客服部" value="customer_service" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="memberForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="财务管理员" value="finance_manager" />
            <el-option label="人事管理员" value="hr_manager" />
            <el-option label="运营管理员" value="operations_manager" />
            <el-option label="票务管理员" value="ticket_manager" />
            <el-option label="客服人员" value="customer_service" />
            <el-option label="普通员工" value="employee" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="memberForm.status">
            <el-radio label="active">激活</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="memberDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitMember">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  name: '',
  department: '',
  role: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 成员对话框
const memberDialogVisible = ref(false)
const isEdit = ref(false)
const memberFormRef = ref()
const memberForm = reactive({
  id: '',
  name: '',
  email: '',
  department: '',
  role: '',
  status: 'active'
})

// 表单验证规则
const memberRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 模拟数据
const mockData = [
  {
    id: 'E001',
    name: '张三',
    email: 'zhangsan@example.com',
    department: 'management',
    role: 'super_admin',
    status: 'active',
    joinDate: '2024-01-15'
  },
  {
    id: 'E002',
    name: '李四',
    email: 'lisi@example.com',
    department: 'finance',
    role: 'finance_manager',
    status: 'active',
    joinDate: '2024-01-16'
  },
  {
    id: 'E003',
    name: '王五',
    email: 'wangwu@example.com',
    department: 'hr',
    role: 'hr_manager',
    status: 'inactive',
    joinDate: '2024-01-17'
  }
]

// 获取部门文本
const getDepartmentText = (department) => {
  const departmentMap = {
    management: '管理部',
    finance: '财务部',
    hr: '人事部',
    operations: '运营部',
    ticketing: '票务部',
    customer_service: '客服部'
  }
  return departmentMap[department] || '未知'
}

// 获取角色文本
const getRoleText = (role) => {
  const roleMap = {
    super_admin: '超级管理员',
    finance_manager: '财务管理员',
    hr_manager: '人事管理员',
    operations_manager: '运营管理员',
    ticket_manager: '票务管理员',
    customer_service: '客服人员',
    employee: '普通员工'
  }
  return roleMap[role] || '未知'
}

// 获取角色类型
const getRoleType = (role) => {
  const roleTypeMap = {
    super_admin: 'danger',
    finance_manager: 'warning',
    hr_manager: 'success',
    operations_manager: 'primary',
    ticket_manager: 'info',
    customer_service: '',
    employee: ''
  }
  return roleTypeMap[role] || ''
}

// 搜索
const handleSearch = () => {
  console.log('搜索条件:', searchForm)
  loadData()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    department: '',
    role: ''
  })
  loadData()
}

// 添加成员
const handleAdd = () => {
  isEdit.value = false
  Object.assign(memberForm, {
    id: '',
    name: '',
    email: '',
    department: '',
    role: '',
    status: 'active'
  })
  memberDialogVisible.value = true
}

// 导出数据
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 查看详情
const handleView = (row) => {
  ElMessage.info(`查看成员 ${row.name} 的详细信息`)
}

// 编辑成员
const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(memberForm, { ...row })
  memberDialogVisible.value = true
}

// 权限管理
const handlePermissions = (row) => {
  ElMessage.info(`管理成员 ${row.name} 的权限`)
}

// 切换状态
const handleToggleStatus = async (row) => {
  const action = row.status === 'active' ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(
      `确定要${action}成员 ${row.name} 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    row.status = row.status === 'active' ? 'inactive' : 'active'
    ElMessage.success(`${action}成功`)
  } catch {
    // 用户取消操作
  }
}

// 提交成员信息
const handleSubmitMember = async () => {
  try {
    await memberFormRef.value.validate()
    // 这里应该调用API保存成员信息
    ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
    memberDialogVisible.value = false
    loadData()
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadData()
}

// 当前页改变
const handleCurrentChange = (page) => {
  pagination.currentPage = page
  loadData()
}

// 加载数据
const loadData = () => {
  loading.value = true
  
  // 模拟 API 调用
  setTimeout(() => {
    tableData.value = mockData
    pagination.total = mockData.length
    loading.value = false
  }, 500)
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.team-management {
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

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 16px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
}
</style>

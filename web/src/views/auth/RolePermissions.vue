<template>
  <div class="role-permissions">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>角色权限管理</h2>
      <p>管理系统角色和权限分配</p>
    </div>

    <el-row :gutter="20">
      <!-- 角色列表 -->
      <el-col :span="8">
        <el-card class="role-card">
          <template #header>
            <div class="card-header">
              <span>角色列表</span>
              <el-button type="primary" size="small" @click="handleAddRole">
                <el-icon><Plus /></el-icon>
                添加角色
              </el-button>
            </div>
          </template>
          
          <el-menu 
            :default-active="selectedRole" 
            @select="handleRoleSelect"
            class="role-menu"
          >
            <el-menu-item 
              v-for="role in roles" 
              :key="role.key" 
              :index="role.key"
            >
              <el-icon><Avatar /></el-icon>
              <span>{{ role.name }}</span>
              <el-tag size="small" style="margin-left: auto;">
                {{ role.userCount }}人
              </el-tag>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <!-- 权限配置 -->
      <el-col :span="16">
        <el-card class="permission-card">
          <template #header>
            <div class="card-header">
              <span>权限配置 - {{ getCurrentRoleName() }}</span>
              <el-button type="success" size="small" @click="handleSavePermissions">
                <el-icon><Check /></el-icon>
                保存权限
              </el-button>
            </div>
          </template>

          <div v-if="selectedRole" class="permission-content">
            <el-tree
              ref="permissionTreeRef"
              :data="permissionTree"
              :props="treeProps"
              show-checkbox
              node-key="key"
              :default-checked-keys="currentPermissions"
              @check="handlePermissionCheck"
            >
              <template #default="{ node, data }">
                <span class="tree-node">
                  <el-icon>
                    <component :is="data.icon" />
                  </el-icon>
                  <span>{{ data.label }}</span>
                  <el-tag v-if="data.type" size="small" :type="getPermissionType(data.type)">
                    {{ data.type }}
                  </el-tag>
                </span>
              </template>
            </el-tree>
          </div>
          
          <div v-else class="no-selection">
            <el-empty description="请选择一个角色来配置权限" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加角色对话框 -->
    <el-dialog v-model="roleDialogVisible" title="添加角色" width="500px">
      <el-form :model="roleForm" :rules="roleRules" ref="roleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色标识" prop="key">
          <el-input v-model="roleForm.key" placeholder="请输入角色标识（英文）" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input 
            v-model="roleForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitRole">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

// 选中的角色
const selectedRole = ref('super_admin')

// 角色列表
const roles = ref([
  { key: 'super_admin', name: '超级管理员', userCount: 1 },
  { key: 'finance_manager', name: '财务管理员', userCount: 2 },
  { key: 'hr_manager', name: '人事管理员', userCount: 3 },
  { key: 'operations_manager', name: '运营管理员', userCount: 4 },
  { key: 'ticket_manager', name: '票务管理员', userCount: 5 },
  { key: 'customer_service', name: '客服人员', userCount: 8 },
  { key: 'employee', name: '普通员工', userCount: 20 }
])

// 权限树
const permissionTreeRef = ref()
const treeProps = {
  children: 'children',
  label: 'label'
}

// 权限树数据
const permissionTree = ref([
  {
    key: 'dashboard',
    label: '仪表板',
    icon: 'House',
    type: '查看'
  },
  {
    key: 'visitors',
    label: '游客管理',
    icon: 'User',
    children: [
      { key: 'visitors.list', label: '游客列表', type: '查看' },
      { key: 'visitors.create', label: '新增游客', type: '创建' },
      { key: 'visitors.edit', label: '编辑游客', type: '编辑' },
      { key: 'visitors.delete', label: '删除游客', type: '删除' },
      { key: 'visitors.blacklist', label: '黑名单管理', type: '管理' }
    ]
  },
  {
    key: 'tickets',
    label: '票务管理',
    icon: 'Ticket',
    children: [
      { key: 'tickets.types', label: '票种管理', type: '管理' },
      { key: 'tickets.pricing', label: '价格管理', type: '管理' },
      { key: 'tickets.sales', label: '门票销售', type: '操作' },
      { key: 'tickets.statistics', label: '销售统计', type: '查看' }
    ]
  },
  {
    key: 'finance',
    label: '财务管理',
    icon: 'Wallet',
    children: [
      { key: 'finance.income', label: '收入管理', type: '管理' },
      { key: 'finance.expenses', label: '支出管理', type: '管理' },
      { key: 'finance.reports', label: '财务报表', type: '查看' },
      { key: 'finance.salary', label: '薪资管理', type: '管理' }
    ]
  },
  {
    key: 'hr',
    label: '人力资源',
    icon: 'Avatar',
    children: [
      { key: 'hr.employees', label: '员工管理', type: '管理' },
      { key: 'hr.attendance', label: '考勤管理', type: '管理' },
      { key: 'hr.performance', label: '绩效管理', type: '管理' },
      { key: 'hr.payroll', label: '工资管理', type: '管理' }
    ]
  },
  {
    key: 'facilities',
    label: '设施管理',
    icon: 'OfficeBuilding',
    children: [
      { key: 'facilities.list', label: '设施列表', type: '查看' },
      { key: 'facilities.monitoring', label: '设施监控', type: '监控' },
      { key: 'facilities.maintenance', label: '维护管理', type: '管理' }
    ]
  },
  {
    key: 'auth',
    label: '权限管理',
    icon: 'Lock',
    children: [
      { key: 'auth.teams', label: '团队管理', type: '管理' },
      { key: 'auth.roles', label: '角色权限', type: '管理' }
    ]
  }
])

// 当前权限
const currentPermissions = ref([])

// 角色权限映射
const rolePermissions = {
  super_admin: ['dashboard', 'visitors', 'visitors.list', 'visitors.create', 'visitors.edit', 'visitors.delete', 'visitors.blacklist', 'tickets', 'tickets.types', 'tickets.pricing', 'tickets.sales', 'tickets.statistics', 'finance', 'finance.income', 'finance.expenses', 'finance.reports', 'finance.salary', 'hr', 'hr.employees', 'hr.attendance', 'hr.performance', 'hr.payroll', 'facilities', 'facilities.list', 'facilities.monitoring', 'facilities.maintenance', 'auth', 'auth.teams', 'auth.roles'],
  finance_manager: ['dashboard', 'finance', 'finance.income', 'finance.expenses', 'finance.reports', 'finance.salary'],
  hr_manager: ['dashboard', 'hr', 'hr.employees', 'hr.attendance', 'hr.performance', 'hr.payroll'],
  operations_manager: ['dashboard', 'facilities', 'facilities.list', 'facilities.monitoring', 'facilities.maintenance', 'visitors', 'visitors.list'],
  ticket_manager: ['dashboard', 'tickets', 'tickets.types', 'tickets.pricing', 'tickets.sales', 'tickets.statistics'],
  customer_service: ['dashboard', 'visitors', 'visitors.list', 'visitors.create', 'visitors.edit', 'visitors.blacklist'],
  employee: ['dashboard']
}

// 添加角色对话框
const roleDialogVisible = ref(false)
const roleFormRef = ref()
const roleForm = reactive({
  name: '',
  key: '',
  description: ''
})

// 表单验证规则
const roleRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ],
  key: [
    { required: true, message: '请输入角色标识', trigger: 'blur' },
    { pattern: /^[a-z_]+$/, message: '角色标识只能包含小写字母和下划线', trigger: 'blur' }
  ]
}

// 获取当前角色名称
const getCurrentRoleName = () => {
  const role = roles.value.find(r => r.key === selectedRole.value)
  return role ? role.name : ''
}

// 获取权限类型样式
const getPermissionType = (type) => {
  const typeMap = {
    '查看': 'info',
    '创建': 'success',
    '编辑': 'warning',
    '删除': 'danger',
    '管理': 'primary',
    '操作': '',
    '监控': 'info'
  }
  return typeMap[type] || ''
}

// 选择角色
const handleRoleSelect = (roleKey) => {
  selectedRole.value = roleKey
  loadRolePermissions(roleKey)
}

// 加载角色权限
const loadRolePermissions = (roleKey) => {
  currentPermissions.value = rolePermissions[roleKey] || []
  
  // 等待DOM更新后设置选中状态
  nextTick(() => {
    if (permissionTreeRef.value) {
      permissionTreeRef.value.setCheckedKeys(currentPermissions.value)
    }
  })
}

// 权限选择变化
const handlePermissionCheck = (data, checked) => {
  const checkedKeys = permissionTreeRef.value.getCheckedKeys()
  const halfCheckedKeys = permissionTreeRef.value.getHalfCheckedKeys()
  currentPermissions.value = [...checkedKeys, ...halfCheckedKeys]
}

// 保存权限
const handleSavePermissions = () => {
  const checkedKeys = permissionTreeRef.value.getCheckedKeys()
  const halfCheckedKeys = permissionTreeRef.value.getHalfCheckedKeys()
  const allPermissions = [...checkedKeys, ...halfCheckedKeys]
  
  // 这里应该调用API保存权限
  rolePermissions[selectedRole.value] = allPermissions
  ElMessage.success('权限保存成功')
}

// 添加角色
const handleAddRole = () => {
  Object.assign(roleForm, {
    name: '',
    key: '',
    description: ''
  })
  roleDialogVisible.value = true
}

// 提交角色
const handleSubmitRole = async () => {
  try {
    await roleFormRef.value.validate()
    
    // 检查角色标识是否已存在
    if (roles.value.some(r => r.key === roleForm.key)) {
      ElMessage.error('角色标识已存在')
      return
    }
    
    // 添加新角色
    roles.value.push({
      key: roleForm.key,
      name: roleForm.name,
      userCount: 0
    })
    
    // 初始化角色权限
    rolePermissions[roleForm.key] = ['dashboard']
    
    ElMessage.success('角色添加成功')
    roleDialogVisible.value = false
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadRolePermissions(selectedRole.value)
})
</script>

<style scoped>
.role-permissions {
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

.role-card, .permission-card {
  height: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-menu {
  border: none;
  height: 520px;
  overflow-y: auto;
}

.role-menu .el-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.permission-content {
  height: 520px;
  overflow-y: auto;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.no-selection {
  height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .role-card, .permission-card {
    height: auto;
    margin-bottom: 20px;
  }
}
</style>

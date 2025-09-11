<template>
  <div class="attendance-records">
    <div class="page-header">
      <h2>考勤管理</h2>
      <p>管理员工考勤信息</p>
    </div>

    <!-- 员工列表视图 -->
    <el-card v-if="!selectedEmployee" class="employee-list-card">
      <template #header>
        <div class="card-header">
          <span>员工列表</span>
          <div>
            <el-input
              v-model="searchForm.name"
              placeholder="搜索员工姓名"
              style="width: 200px; margin-right: 10px"
              clearable
            />
            <el-button type="primary" @click="searchEmployees">查询</el-button>
          </div>
        </div>
      </template>

      <el-table :data="employeeList" border style="width: 100%" v-loading="loading">
        <el-table-column prop="employeeId" label="员工ID" width="80" />
        <el-table-column prop="staffNumber" label="工号" width="100" />
        <el-table-column prop="user.displayName" label="姓名" width="120" />
        <el-table-column prop="position" label="职位" width="150" />
        <el-table-column prop="departmentName" label="部门" width="150" />
        <el-table-column prop="user.phoneNumber" label="联系电话" width="140" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="selectEmployee(scope.row)">
              查看考勤
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 员工考勤详情视图 -->
    <div v-else>
      <el-page-header @back="backToEmployeeList" :content="`${selectedEmployee.user.displayName} 的考勤记录`" class="mb-20" />
      
      <!-- 考勤查询条件 -->
      <el-card class="search-card mb-20">
        <el-form :model="attendanceSearchForm" label-width="100px" @submit.prevent="searchAttendance" inline>
          <el-form-item label="开始日期">
            <el-date-picker
              v-model="attendanceSearchForm.startDate"
              type="date"
              placeholder="选择开始日期"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="结束日期">
            <el-date-picker
              v-model="attendanceSearchForm.endDate"
              type="date"
              placeholder="选择结束日期"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchAttendance">查询</el-button>
            <el-button @click="resetAttendanceSearch">重置</el-button>
            <el-button type="success" @click="handleCheckIn" :loading="checkInLoading">今日补签</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 考勤记录表格 -->
      <el-card>
        <template #header>
          <div class="card-header">
            <span>考勤记录列表</span>
            <div>
              <el-button type="primary" @click="handleAdd">新增考勤</el-button>
            </div>
          </div>
        </template>

        <el-table :data="attendanceList" border style="width: 100%" v-loading="loading">
          <el-table-column prop="attendanceId" label="考勤ID" width="80" />
          <el-table-column prop="attendanceDate" label="考勤日期" width="120">
            <template #default="scope">
              {{ formatDate(scope.row.attendanceDate) }}
            </template>
          </el-table-column>
          <el-table-column prop="checkInTime" label="签到时间" width="100">
            <template #default="scope">
              {{ formatTime(scope.row.checkInTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="checkOutTime" label="签退时间" width="100">
            <template #default="scope">
              {{ scope.row.checkOutTime ? formatTime(scope.row.checkOutTime) : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="attendanceStatus" label="考勤状态" width="100">
            <template #default="scope">
              <el-tag :type="getAttendanceStatusType(scope.row.attendanceStatus)">
                {{ getAttendanceStatusLabel(scope.row.attendanceStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="leaveType" label="请假类型" width="100">
            <template #default="scope">
              {{ scope.row.leaveType ? getLeaveTypeLabel(scope.row.leaveType) : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="160">
            <template #default="scope">
              {{ formatDateTime(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="attendanceCurrentPage"
            v-model:page-size="attendancePageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="attendanceTotal"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleAttendanceSizeChange"
            @current-change="handleAttendanceCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 考勤记录编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="attendanceFormRef"
        :model="attendanceForm"
        :rules="attendanceRules"
        label-width="100px"
      >
        <el-form-item label="员工ID" prop="employeeId">
          <el-input v-model.number="attendanceForm.employeeId" :disabled="!!selectedEmployee" />
        </el-form-item>
        <el-form-item label="考勤日期" prop="attendanceDate">
          <el-date-picker
            v-model="attendanceForm.attendanceDate"
            type="date"
            placeholder="选择考勤日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="签到时间" prop="checkInTime">
          <el-time-picker
            v-model="attendanceForm.checkInTime"
            placeholder="选择签到时间"
            value-format="HH:mm:ss"
            format="HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="签退时间" prop="checkOutTime">
          <el-time-picker
            v-model="attendanceForm.checkOutTime"
            placeholder="选择签退时间"
            value-format="HH:mm:ss"
            format="HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="考勤状态" prop="attendanceStatus">
          <el-select v-model="attendanceForm.attendanceStatus" placeholder="请选择考勤状态" style="width: 100%">
            <el-option label="正常" value="Present" />
            <el-option label="迟到" value="Late" />
            <el-option label="缺勤" value="Absent" />
            <el-option label="请假" value="Leave" />
          </el-select>
        </el-form-item>
        <el-form-item label="请假类型" prop="leaveType">
          <el-select v-model="attendanceForm.leaveType" placeholder="请选择请假类型" style="width: 100%">
            <el-option label="年假" value="AnnualLeave" />
            <el-option label="病假" value="SickLeave" />
            <el-option label="事假" value="PersonalLeave" />
            <el-option label="调休" value="CompensatoryLeave" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAttendance">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { queryAttendance, createAttendance, updateAttendance, deleteAttendance, getEmployees, checkIn } from '@/api/hr.js'

// 数据相关
const loading = ref(false)
const checkInLoading = ref(false)
const employeeList = ref([])
const attendanceList = ref([])
const total = ref(0)
const attendanceTotal = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const attendanceCurrentPage = ref(1)
const attendancePageSize = ref(10)
const selectedEmployee = ref(null)

// 表单相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const attendanceFormRef = ref(null)

// 搜索表单
const searchForm = reactive({
  name: ''
})

const attendanceSearchForm = reactive({
  startDate: '',
  endDate: ''
})

// 考勤表单
const attendanceForm = reactive({
  attendanceId: null,
  employeeId: null,
  attendanceDate: '',
  checkInTime: '',
  checkOutTime: '',
  attendanceStatus: '',
  leaveType: ''
})

// 表单验证规则
const attendanceRules = {
  employeeId: [{ required: true, message: '请输入员工ID', trigger: 'blur' }],
  attendanceDate: [{ required: true, message: '请选择考勤日期', trigger: 'change' }],
  checkInTime: [{ required: true, message: '请选择签到时间', trigger: 'change' }],
  attendanceStatus: [{ required: true, message: '请选择考勤状态', trigger: 'change' }]
}

// 考勤状态映射
const attendanceStatusMap = {
  'Present': '正常',
  'Late': '迟到',
  'Absent': '缺勤',
  'Leave': '请假'
}

// 请假类型映射
const leaveTypeMap = {
  'AnnualLeave': '年假',
  'SickLeave': '病假',
  'PersonalLeave': '事假',
  'CompensatoryLeave': '调休'
}

// 获取考勤状态标签类型
const getAttendanceStatusType = (status) => {
  const typeMap = {
    'Present': 'success',
    'Late': 'warning',
    'Absent': 'danger',
    'Leave': 'info'
  }
  return typeMap[status] || 'info'
}

// 获取考勤状态标签文本
const getAttendanceStatusLabel = (status) => {
  return attendanceStatusMap[status] || status
}

// 获取请假类型标签文本
const getLeaveTypeLabel = (type) => {
  return leaveTypeMap[type] || type
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return date.split('T')[0]
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  return time.split('T')[1]?.substring(0, 8) || ''
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  return dateTime.replace('T', ' ').substring(0, 19)
}

// 查询员工列表
const searchEmployees = async () => {
  loading.value = true
  try {
    // 使用真实的员工查询API
    const params = {}
    
    // 如果有搜索关键字，则添加keyword参数
    if (searchForm.name) {
      params.keyword = searchForm.name
    }
    
    const response = await getEmployees(params)
    employeeList.value = Array.isArray(response) ? response : []
    total.value = employeeList.value.length
    ElMessage.success('查询成功')
  } catch (error) {
    console.error('查询失败:', error)
    ElMessage.error('查询失败: ' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

// 选择员工查看考勤
const selectEmployee = (employee) => {
  selectedEmployee.value = employee
  searchAttendance()
}

// 返回员工列表
const backToEmployeeList = () => {
  selectedEmployee.value = null
  attendanceList.value = []
}

// 查询考勤记录
const searchAttendance = async () => {
  if (!selectedEmployee.value) return
  
  loading.value = true
  try {
    // 验证员工ID
    if (!selectedEmployee.value.employeeId) {
      ElMessage.error('员工ID无效')
      loading.value = false
      return
    }
    
    // 构建查询参数 - 使用正确的参数格式
    const params = {
      queryType: 'GetEmployeeAttendance',
      employeeId: selectedEmployee.value.employeeId
    }
    
    // 只有当日期不为空时才添加到参数中
    if (attendanceSearchForm.startDate) {
      params.startDate = attendanceSearchForm.startDate
    }
    
    if (attendanceSearchForm.endDate) {
      params.endDate = attendanceSearchForm.endDate
    }
    
    console.log('查询参数:', params)
    
    const response = await queryAttendance(params)
    
    // 处理响应数据
    if (response && Array.isArray(response)) {
      attendanceList.value = response
      attendanceTotal.value = response.length
    } else {
      attendanceList.value = []
      attendanceTotal.value = 0
    }
    
    ElMessage.success('查询成功')
  } catch (error) {
    console.error('查询失败:', error)
    attendanceList.value = []
    attendanceTotal.value = 0
    ElMessage.error('查询失败: ' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

// 重置考勤搜索条件
const resetAttendanceSearch = () => {
  attendanceSearchForm.startDate = ''
  attendanceSearchForm.endDate = ''
  searchAttendance()
}

// 处理新增
const handleAdd = () => {
  dialogTitle.value = '新增考勤记录'
  isEdit.value = false
  resetAttendanceForm()
  // 设置默认员工ID
  if (selectedEmployee.value) {
    attendanceForm.employeeId = selectedEmployee.value.employeeId
  }
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑考勤记录'
  isEdit.value = true
  // 拷贝数据到表单
  Object.assign(attendanceForm, {
    attendanceId: row.attendanceId,
    employeeId: row.employeeId,
    attendanceDate: formatDate(row.attendanceDate),
    checkInTime: formatTime(row.checkInTime),
    checkOutTime: row.checkOutTime ? formatTime(row.checkOutTime) : '',
    attendanceStatus: row.attendanceStatus,
    leaveType: row.leaveType || ''
  })
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除 ${formatDate(row.attendanceDate)} 的考勤记录吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteAttendance(row.attendanceId)
      ElMessage.success('删除成功')
      searchAttendance() // 重新查询
    } catch (error) {
      ElMessage.error('删除失败: ' + (error.response?.data?.message || error.message))
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 今日补签
const handleCheckIn = async () => {
  if (!selectedEmployee.value) return
  
  try {
    checkInLoading.value = true
    
    // 验证员工ID
    if (!selectedEmployee.value.employeeId) {
      ElMessage.error('员工ID无效')
      checkInLoading.value = false
      return
    }
    
    // 构造签到数据，包含当前时间
    const checkInData = {
      employeeId: selectedEmployee.value.employeeId,
      checkInTime: new Date().toISOString() // 添加当前时间
    }
    
    await checkIn(checkInData)
    ElMessage.success('补签成功')
    // 重新查询考勤记录以显示新记录
    searchAttendance()
  } catch (error) {
    console.error('补签失败:', error)
    ElMessage.error('补签失败: ' + (error.response?.data?.message || error.message))
  } finally {
    checkInLoading.value = false
  }
}

// 重置表单
const resetAttendanceForm = () => {
  Object.assign(attendanceForm, {
    attendanceId: null,
    employeeId: null,
    attendanceDate: '',
    checkInTime: '',
    checkOutTime: '',
    attendanceStatus: '',
    leaveType: ''
  })
}

// 处理对话框关闭
const handleDialogClose = () => {
  attendanceFormRef.value?.resetFields()
  resetAttendanceForm()
}

// 提交考勤记录
const submitAttendance = () => {
  attendanceFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        // 验证员工ID
        const employeeId = attendanceForm.employeeId || selectedEmployee.value?.employeeId
        if (!employeeId) {
          ElMessage.error('员工ID无效')
          return
        }
        
        // 构造提交数据
        const submitData = {
          employeeId: employeeId,
          attendanceDate: attendanceForm.attendanceDate,
          checkInTime: attendanceForm.checkInTime ? 
            `${attendanceForm.attendanceDate}T${attendanceForm.checkInTime}` : 
            `${attendanceForm.attendanceDate}T09:00:00`,
          checkOutTime: attendanceForm.checkOutTime ? 
            `${attendanceForm.attendanceDate}T${attendanceForm.checkOutTime}` : 
            null,
          status: attendanceForm.attendanceStatus,
          leaveType: attendanceForm.leaveType || null
        }
        
        if (isEdit.value) {
          // 编辑
          await updateAttendance(attendanceForm.attendanceId, {
            ...submitData,
            attendanceId: attendanceForm.attendanceId
          })
          ElMessage.success('更新成功')
        } else {
          // 新增
          await createAttendance(submitData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        searchAttendance() // 重新查询
      } catch (error) {
        ElMessage.error((isEdit.value ? '更新' : '新增') + '失败: ' + (error.response?.data?.message || error.message))
      }
    }
  })
}

// 处理员工列表分页
const handleSizeChange = (val) => {
  pageSize.value = val
  searchEmployees()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  searchEmployees()
}

// 处理考勤记录分页
const handleAttendanceSizeChange = (val) => {
  attendancePageSize.value = val
  searchAttendance()
}

const handleAttendanceCurrentChange = (val) => {
  attendanceCurrentPage.value = val
  searchAttendance()
}

// 组件挂载时查询数据
onMounted(() => {
  searchEmployees()
})
</script>

<style scoped>
.attendance-records {
  padding: 0;
}

.mb-20 {
  margin-bottom: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 500;
}

.page-header p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.search-card .el-form {
  margin-bottom: 10px;
}
</style>
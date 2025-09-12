<template>
  <div class="payroll-records">
    <el-card class="page-header">
      <template #header>
        <div class="card-header">
          <span>工资记录</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleGeneratePayroll">
              <el-icon><Plus /></el-icon>
              生成工资单
            </el-button>
          </div>
        </div>
      </template>
      <el-form :model="searchForm" :inline="true" @submit.prevent="handleSearch">
        <el-form-item label="员工姓名">
          <el-input v-model="searchForm.employeeName" placeholder="请输入员工姓名" />
        </el-form-item>
        <el-form-item label="月份">
          <el-date-picker
            v-model="searchForm.month"
            type="month"
            placeholder="选择月份"
            format="YYYY年MM月"
            value-format="YYYY-MM"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table
        :data="payrollData"
        v-loading="loading"
        element-loading-text="加载中..."
        stripe
        style="width: 100%"
      >
        <el-table-column prop="employeeName" label="员工姓名" width="120" />
        <el-table-column prop="staffNumber" label="员工编号" width="120" />
        <el-table-column prop="departmentName" label="部门" width="150" />
        <el-table-column prop="position" label="职位" width="150" />
        <el-table-column prop="payDate" label="发放日期" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.payDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="salary" label="基本工资" width="120">
          <template #default="scope"> ¥{{ scope.row.salary?.toFixed(2) }} </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="handlePrint(scope.row)">打印</el-button>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- 工资单详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="工资单详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="员工姓名">{{
          currentPayroll.employeeName
        }}</el-descriptions-item>
        <el-descriptions-item label="员工编号">{{
          currentPayroll.staffNumber
        }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{
          currentPayroll.departmentName
        }}</el-descriptions-item>
        <el-descriptions-item label="职位">{{ currentPayroll.position }}</el-descriptions-item>
        <el-descriptions-item label="发放日期">{{
          formatDate(currentPayroll.payDate)
        }}</el-descriptions-item>
        <el-descriptions-item label="基本工资"
          >¥{{ currentPayroll.salary?.toFixed(2) }}</el-descriptions-item
        >
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handlePrint(currentPayroll)">打印</el-button>
      </template>
    </el-dialog>

    <!-- 生成工资单对话框 -->
    <el-dialog
      v-model="generateDialogVisible"
      title="生成工资单"
      width="600px"
      @close="resetGenerateForm"
    >
      <el-form
        ref="generateFormRef"
        :model="generateForm"
        :rules="generateFormRules"
        label-width="100px"
      >
        <el-form-item label="员工" prop="employeeId">
          <el-select
            v-model="generateForm.employeeId"
            placeholder="请选择员工"
            style="width: 100%"
            filterable
            remote
            :remote-method="searchEmployees"
            :loading="employeeLoading"
          >
            <el-option
              v-for="item in employeeOptions"
              :key="item.employeeId"
              :label="`${item.name} (${item.employeeId})`"
              :value="item.employeeId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="工资月份" prop="payMonth">
          <el-date-picker
            v-model="generateForm.payMonth"
            type="month"
            placeholder="选择月份"
            format="YYYY年MM月"
            value-format="YYYY-MM"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="基本工资" prop="salary">
          <el-input-number
            v-model="generateForm.salary"
            :precision="2"
            :step="1000"
            :min="0"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="generateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitGenerateForm" :loading="generateLoading"
          >确定</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { searchSalaryRecords, getSalaryRecord, createSalaryRecord } from '@/api/finance'
import { getEmployees } from '@/api/hr'
import { useRouter } from 'vue-router'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  employeeName: '',
  month: '',
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 数据
const payrollData = ref([])
const loading = ref(false)
const detailDialogVisible = ref(false)
const currentPayroll = ref({})

// 生成工资单相关
const generateDialogVisible = ref(false)
const generateFormRef = ref()
const generateLoading = ref(false)
const employeeLoading = ref(false)
const employeeOptions = ref([])

const generateForm = reactive({
  employeeId: null,
  payMonth: '',
  salary: 0,
})

const generateFormRules = {
  employeeId: [{ required: true, message: '请选择员工', trigger: 'change' }],
  payMonth: [{ required: true, message: '请选择工资月份', trigger: 'change' }],
  salary: [{ required: true, message: '请输入基本工资', trigger: 'blur' }],
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 构建符合后端API要求的参数
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
    }

    // 只有当搜索条件不为空时才添加它们到参数中
    if (searchForm.employeeName) {
      params.keyword = searchForm.employeeName
    }

    if (searchForm.month) {
      // 将月份转换为日期范围
      const year = searchForm.month.substring(0, 4)
      const month = searchForm.month.substring(5, 7)
      params.startDate = `${year}-${month}-01`
      // 计算月末日期
      const lastDay = new Date(year, month, 0).getDate()
      params.endDate = `${year}-${month}-${lastDay}`
    }

    const response = await searchSalaryRecords(params)

    // 根据实际的API响应结构调整数据处理
    if (response && response.data) {
      payrollData.value = response.data.salaryRecords || response.data
      pagination.total = response.data.totalCount || (response.data.length ? response.data.length : 0)
    } else {
      payrollData.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取工资记录失败:', error)
    ElMessage.error('获取工资记录失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.employeeName = ''
  searchForm.month = ''
  pagination.currentPage = 1
  loadData()
}

// 分页变化
const handleSizeChange = (val) => {
  pagination.pageSize = val
  loadData()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  loadData()
}

// 查看详情
const handleView = async (row) => {
  try {
    const response = await getSalaryRecord(row.salaryRecordId || row.id)
    currentPayroll.value = response.data || response
    detailDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取工资单详情失败: ' + error.message)
  }
}

// 生成工资单
const handleGeneratePayroll = () => {
  generateDialogVisible.value = true
}

// 搜索员工
const searchEmployees = async (keyword) => {
  if (!keyword) {
    employeeOptions.value = []
    return
  }

  employeeLoading.value = true
  try {
    const response = await getEmployees({ keyword })
    // 根据API实际返回的数据结构调整代码
    const employees = Array.isArray(response) ? response : response?.data || []
    employeeOptions.value = employees.map((item) => ({
      employeeId: item.employeeId || item.id,
      name: item.user?.displayName || item.user?.username || item.name || '未知',
    }))
  } catch (error) {
    console.error('搜索员工失败:', error)
    ElMessage.error('搜索员工失败: ' + (error.message || '未知错误'))
  } finally {
    employeeLoading.value = false
  }
}

// 重置生成表单
const resetGenerateForm = () => {
  generateForm.employeeId = null
  generateForm.payMonth = ''
  generateForm.salary = 0
  employeeOptions.value = []
}

// 提交生成表单
const submitGenerateForm = async () => {
  if (!generateFormRef.value) return

  await generateFormRef.value.validate(async (valid) => {
    if (!valid) return

    generateLoading.value = true
    try {
      // 构造工资单数据
      const payrollData = {
        employeeId: generateForm.employeeId,
        payDate: `${generateForm.payMonth}-01`,
        salary: generateForm.salary,
      }

      await createSalaryRecord(payrollData)
      ElMessage.success('工资单生成成功')
      generateDialogVisible.value = false
      resetGenerateForm()
      loadData() // 重新加载数据
    } catch (error) {
      ElMessage.error('生成工资单失败: ' + error.message)
    } finally {
      generateLoading.value = false
    }
  })
}

// 打印工资单
const handlePrint = (row) => {
  ElMessage.info('打印功能开发中...')
  console.log('Print payroll:', row)
}

// 初始化加载
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.payroll-records {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.total-amount {
  font-weight: bold;
  color: #e6a23c;
  font-size: 16px;
}
</style>
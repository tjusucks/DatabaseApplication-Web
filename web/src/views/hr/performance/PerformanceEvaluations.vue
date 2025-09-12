<template>
  <div class="performance-evaluations">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>绩效评估</h2>
      <p>进行员工绩效考核和评估</p>
    </div>

    <el-card class="search-card">
      <el-form :model="searchForm" label-width="80px" inline>
        <el-form-item label="员工">
          <el-input v-model="searchForm.employeeId" placeholder="员工ID" />
        </el-form-item>
        <el-form-item label="考核周期">
          <el-select
            v-model="searchForm.period"
            placeholder="请选择考核周期"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="period in periodOptions"
              :key="period.value"
              :label="period.label"
              :value="period.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="评估人">
          <el-input v-model="searchForm.evaluatorId" placeholder="评估人ID" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>评估列表</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新增评估
          </el-button>
        </div>
      </template>

      <el-table :data="reviews" v-loading="loading" style="width: 100%">
        <el-table-column prop="reviewId" label="评估ID" width="80" />
        <el-table-column prop="employee.staffNumber" label="员工工号" width="120" />
        <el-table-column prop="employee.position" label="职位" width="150" />
        <el-table-column prop="employee.departmentName" label="部门" width="150" />
        <el-table-column prop="period" label="考核周期" width="120" />
        <el-table-column prop="score" label="得分" width="80">
          <template #default="scope">
            <el-tag :type="getScoreTagType(scope.row.score)">
              {{ scope.row.score }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="evaluationLevel" label="评级" width="100">
          <template #default="scope">
            <el-tag :type="getLevelTagType(scope.row.evaluationLevel)">
              {{ getLevelText(scope.row.evaluationLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="evaluatorId" label="评估人ID" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 创建/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="reviewFormRef" :model="reviewForm" :rules="reviewRules" label-width="100px">
        <el-form-item label="员工ID" prop="employeeId">
          <el-input v-model.number="reviewForm.employeeId" />
        </el-form-item>
        <el-form-item label="考核周期" prop="period">
          <el-select v-model="reviewForm.period" placeholder="请选择考核周期" style="width: 100%">
            <el-option
              v-for="period in periodOptions"
              :key="period.value"
              :label="period.label"
              :value="period.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="得分" prop="score">
          <el-input-number
            v-model="reviewForm.score"
            :min="0"
            :max="100"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="评级" prop="evaluationLevel">
          <el-select
            v-model="reviewForm.evaluationLevel"
            placeholder="请选择评级"
            style="width: 100%"
          >
            <el-option label="优秀" value="Excellent" />
            <el-option label="良好" value="Good" />
            <el-option label="合格" value="Qualified" />
            <el-option label="不合格" value="Unqualified" />
          </el-select>
        </el-form-item>
        <el-form-item label="评估人ID" prop="evaluatorId">
          <el-input v-model.number="reviewForm.evaluatorId" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getEmployeeReviews,
  createEmployeeReview,
  updateEmployeeReview,
  deleteEmployeeReview,
} from '@/api/hr'

// 生成考核周期选项
const generatePeriodOptions = () => {
  const options = []
  const currentYear = new Date().getFullYear()

  // 生成当前年份及前后2年的季度选项
  for (let year = currentYear - 2; year <= currentYear + 2; year++) {
    for (let quarter = 1; quarter <= 4; quarter++) {
      const value = `${year}-Q${quarter}`
      const label = `${year}年第${quarter}季度`
      options.push({ value, label })
    }
  }

  // 按年份倒序排列，最新的在前面
  return options.sort((a, b) => b.value.localeCompare(a.value))
}

// 考核周期选项
const periodOptions = generatePeriodOptions()

// 搜索表单
const searchForm = reactive({
  employeeId: '',
  period: '',
  evaluatorId: '',
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 数据相关
const reviews = ref([])
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const reviewFormRef = ref()
const reviewForm = reactive({
  reviewId: 0,
  employeeId: null,
  period: '',
  score: 0,
  evaluationLevel: '',
  evaluatorId: null,
})

// 表单验证规则
const reviewRules = {
  employeeId: [
    { required: true, message: '请输入员工ID', trigger: 'blur' },
    { type: 'number', message: '员工ID必须为数字', trigger: 'blur' },
  ],
  period: [{ required: true, message: '请选择考核周期', trigger: 'change' }],
  score: [{ required: true, message: '请输入得分', trigger: 'blur' }],
  evaluationLevel: [{ required: true, message: '请选择评级', trigger: 'change' }],
}

// 获取绩效评估数据
const fetchReviews = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...searchForm,
    }

    // 清理空参数
    Object.keys(params).forEach((key) => {
      if (
        params[key] === '' ||
        params[key] === null ||
        (typeof params[key] === 'string' && params[key].trim() === '')
      ) {
        delete params[key]
      }
    })

    const response = await getEmployeeReviews(params)
    // 修改数据处理逻辑，兼容不同的响应格式
    if (response && response.data) {
      if (Array.isArray(response.data)) {
        // 如果data是数组，直接使用
        reviews.value = response.data
        pagination.total = response.data.length
      } else if (response.data.items) {
        // 如果data包含items属性，使用items和total
        reviews.value = response.data.items
        pagination.total = response.data.total || 0
      } else {
        // 其他情况，直接使用data
        reviews.value = [response.data]
        pagination.total = 1
      }
    } else if (Array.isArray(response)) {
      // 如果响应本身就是数组
      reviews.value = response
      pagination.total = response.length
    } else {
      // 默认空数组
      reviews.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取绩效评估数据失败:', error)
    ElMessage.error('获取绩效评估数据失败')
    reviews.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  pagination.currentPage = 1
  fetchReviews()
}

// 重置搜索
const handleReset = () => {
  searchForm.employeeId = ''
  searchForm.period = ''
  searchForm.evaluatorId = ''
  pagination.currentPage = 1
  fetchReviews()
}

// 处理分页变化
const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchReviews()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchReviews()
}

// 处理创建
const handleCreate = () => {
  dialogTitle.value = '新增绩效评估'
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑绩效评估'
  isEdit.value = true
  Object.assign(reviewForm, {
    reviewId: row.reviewId,
    employeeId: row.employeeId,
    period: row.period,
    score: row.score,
    evaluationLevel: row.evaluationLevel,
    evaluatorId: row.evaluatorId,
  })
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除绩效评估记录 "${row.reviewId}" 吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteEmployeeReview(row.reviewId)
        ElMessage.success('删除成功')
        fetchReviews()
      } catch (error) {
        console.error('删除失败:', error)
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      // 用户取消删除
    })
}

// 重置表单
const resetForm = () => {
  Object.assign(reviewForm, {
    reviewId: 0,
    employeeId: null,
    period: '',
    score: 0,
    evaluationLevel: '',
    evaluatorId: null,
  })
}

// 提交表单
const submitForm = async () => {
  if (!reviewFormRef.value) return

  await reviewFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      if (isEdit.value) {
        // 编辑
        await updateEmployeeReview(reviewForm.reviewId, reviewForm)
        ElMessage.success('更新成功')
      } else {
        // 创建
        await createEmployeeReview(reviewForm)
        ElMessage.success('创建成功')
      }

      dialogVisible.value = false
      fetchReviews()
    } catch (error) {
      console.error('保存失败:', error)
      ElMessage.error('保存失败')
    }
  })
}

// 根据得分获取标签类型
const getScoreTagType = (score) => {
  if (score >= 90) return 'success'
  if (score >= 75) return 'primary'
  if (score >= 60) return 'warning'
  return 'danger'
}

// 根据评级获取标签类型
const getLevelTagType = (level) => {
  switch (level) {
    case 'Excellent':
      return 'success'
    case 'Good':
      return 'primary'
    case 'Qualified':
      return 'warning'
    case 'Unqualified':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取评级文本
const getLevelText = (level) => {
  switch (level) {
    case 'Excellent':
      return '优秀'
    case 'Good':
      return '良好'
    case 'Qualified':
      return '合格'
    case 'Unqualified':
      return '不合格'
    default:
      return level || '未知'
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

// 组件挂载时获取数据
onMounted(() => {
  fetchReviews()
})
</script>

<style scoped>
.performance-evaluations {
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
</style>

<template>
  <div class="refund-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>退票管理</h2>
      <p>管理和处理游客退票申请</p>
    </div>

    <!-- 搜索和操作区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="申请单号">
          <el-input v-model="searchForm.refundId" placeholder="请输入申请单号" clearable />
        </el-form-item>
        <el-form-item label="游客姓名">
          <el-input v-model="searchForm.visitorName" placeholder="请输入游客姓名" clearable />
        </el-form-item>
        <el-form-item label="申请状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
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
        <el-button type="success" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
        <el-button type="info" @click="handleStatistics">
          <el-icon><DataAnalysis /></el-icon>
          退票统计
        </el-button>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="refundId" label="申请单号" width="140" />
        <el-table-column prop="visitorName" label="游客姓名" width="120" />
        <el-table-column prop="ticketType" label="票种" width="120" />
        <el-table-column prop="originalAmount" label="原价金额" width="100">
          <template #default="{ row }"> ¥{{ row.originalAmount }} </template>
        </el-table-column>
        <el-table-column prop="refundAmount" label="退款金额" width="100">
          <template #default="{ row }"> ¥{{ row.refundAmount }} </template>
        </el-table-column>
        <el-table-column prop="reason" label="退票原因" width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)"> 查看 </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              @click="handleApprove(row)"
            >
              审核
            </el-button>
            <el-button
              v-if="row.status === 'approved'"
              type="warning"
              size="small"
              @click="handleRefund(row)"
            >
              退款
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

    <!-- 审核对话框 -->
    <el-dialog v-model="approveDialogVisible" title="退票审核" width="500px">
      <el-form :model="approveForm" label-width="80px">
        <el-form-item label="申请单号">
          <el-input v-model="approveForm.refundId" disabled />
        </el-form-item>
        <el-form-item label="游客姓名">
          <el-input v-model="approveForm.visitorName" disabled />
        </el-form-item>
        <el-form-item label="退款金额">
          <el-input-number
            v-model="approveForm.refundAmount"
            :min="0"
            :max="approveForm.originalAmount"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="审核结果">
          <el-radio-group v-model="approveForm.result">
            <el-radio label="approved">通过</el-radio>
            <el-radio label="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input
            v-model="approveForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入审核备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitApprove">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  refundId: '',
  visitorName: '',
  status: '',
  dateRange: [],
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0,
})

// 审核对话框
const approveDialogVisible = ref(false)
const approveForm = reactive({
  refundId: '',
  visitorName: '',
  originalAmount: 0,
  refundAmount: 0,
  result: 'approved',
  remark: '',
})

// 模拟数据
const mockData = [
  {
    refundId: 'RF001',
    visitorName: '张三',
    ticketType: '成人票',
    originalAmount: 150,
    refundAmount: 120,
    reason: '行程变更',
    status: 'pending',
    applyTime: '2024-01-15 10:30:00',
  },
  {
    refundId: 'RF002',
    visitorName: '李四',
    ticketType: '儿童票',
    originalAmount: 80,
    refundAmount: 64,
    reason: '身体不适',
    status: 'approved',
    applyTime: '2024-01-16 14:20:00',
  },
  {
    refundId: 'RF003',
    visitorName: '王五',
    ticketType: '学生票',
    originalAmount: 100,
    refundAmount: 0,
    reason: '重复购买',
    status: 'rejected',
    applyTime: '2024-01-17 09:15:00',
  },
]

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    refunded: 'info',
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    refunded: '已退款',
  }
  return statusMap[status] || '未知'
}

// 搜索
const handleSearch = () => {
  console.log('搜索条件:', searchForm)
  loadData()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    refundId: '',
    visitorName: '',
    status: '',
    dateRange: [],
  })
  loadData()
}

// 导出数据
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 退票统计
const handleStatistics = () => {
  ElMessage.info('退票统计功能开发中...')
}

// 查看详情
const handleView = (row) => {
  ElMessage.info(`查看退票申请 ${row.refundId} 的详细信息`)
}

// 审核退票
const handleApprove = (row) => {
  Object.assign(approveForm, {
    refundId: row.refundId,
    visitorName: row.visitorName,
    originalAmount: row.originalAmount,
    refundAmount: row.refundAmount,
    result: 'approved',
    remark: '',
  })
  approveDialogVisible.value = true
}

// 提交审核
const handleSubmitApprove = () => {
  // 这里应该调用API提交审核结果
  ElMessage.success('审核提交成功')
  approveDialogVisible.value = false
  loadData()
}

// 执行退款
const handleRefund = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要为申请单 ${row.refundId} 执行退款操作吗？`, '确认退款', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 这里应该调用API执行退款
    ElMessage.success('退款操作成功')
    loadData()
  } catch {
    // 用户取消操作
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
.refund-management {
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

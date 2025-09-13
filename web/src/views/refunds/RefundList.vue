<template>
  <PageTemplate title="退票列表" description="查询、查看和处理所有退票申请记录" icon="List">
    <el-form :inline="true" :model="queryParams" @submit.prevent="handleSearch" class="search-bar">
      <el-form-item label="搜索方式">
        <el-radio-group v-model="searchType" @change="handleSearchTypeChange">
          <el-radio value="keyword">关键词搜索</el-radio>
          <el-radio value="visitorId">游客ID搜索</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="searchType === 'keyword'" label="关键词">
        <el-input v-model="queryParams.keyword" placeholder="票号/退票单号" clearable />
      </el-form-item>

      <el-form-item v-if="searchType === 'visitorId'" label="游客ID">
        <el-input
          v-model="queryParams.visitorId"
          placeholder="请输入游客ID"
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>

      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="选择状态" clearable>
          <el-option label="待处理" value="Pending" />
          <el-option label="已批准" value="Approved" />
          <el-option label="已驳回" value="Rejected" />
          <el-option label="已完成" value="Completed" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch" :loading="loading">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 游客信息显示 -->
    <el-card shadow="never" class="visitor-info-card" v-if="currentVisitorInfo">
      <template #header>
        <div class="card-header">
          <h3>当前查询游客信息</h3>
          <el-button size="small" @click="clearVisitorInfo">清除</el-button>
        </div>
      </template>
      <el-descriptions :column="4" border>
        <el-descriptions-item label="游客ID">{{ currentVisitorInfo.user.userId }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ currentVisitorInfo.user.displayName }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentVisitorInfo.user.username }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentVisitorInfo.user.email || '未填写' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-table :data="refunds.list" border stripe v-loading="loading">
      <el-table-column prop="refundId" label="退票单号" width="100" />
      <el-table-column prop="ticketId" label="关联票号" width="100" />
      <el-table-column label="游客信息" width="200">
        <template #default="{ row }">
          <div>
            <div><strong>ID:</strong> {{ row.visitorId }}</div>
            <div><strong>姓名:</strong> {{ row.visitorName }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="ticketSerialNumber" label="票据编号" width="180" />
      <el-table-column prop="refundTime" label="申请时间" width="160">
        <template #default="{ row }">
          {{ formatDate(row.refundTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="refundAmount" label="退款金额" width="100">
        <template #default="{ row }">
          ¥{{ row.refundAmount }}
        </template>
      </el-table-column>
      <el-table-column prop="refundReason" label="退票原因" width="150" show-overflow-tooltip />
      <el-table-column prop="refundStatus" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.refundStatus)">{{ getStatusText(row.refundStatus) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" align="center" width="180">
        <template #default="{ row }">
          <el-button size="small" type="primary" link icon="View" @click="viewDetails(row.refundId)">
            详情
          </el-button>
          <el-tooltip content="批准或驳回申请" placement="top">
            <el-button
              v-if="row.refundStatus === 'Pending'"
              size="small"
              type="primary"
              link
              icon="Finished"
              @click="process(row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="refunds.total"
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.size"
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>
  </PageTemplate>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRefundStore } from '@/stores/tickets.js'
import { storeToRefs } from 'pinia'
import PageTemplate from '@/components/PageTemplate.vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getVisitorById } from '@/api/visitors.js'
import { searchTicketSales } from '@/api/ticket.js'

const refundStore = useRefundStore()
const { refunds } = storeToRefs(refundStore)
const loading = ref(false)
const searchType = ref('keyword') // 'keyword' 或 'visitorId'
const currentVisitorInfo = ref(null) // 当前查询的游客信息
const queryParams = reactive({
  keyword: '',
  visitorId: '',
  status: '',
  page: 1,
  size: 10
})

// 搜索方式切换
const handleSearchTypeChange = () => {
  // 清空搜索条件
  queryParams.keyword = ''
  queryParams.visitorId = ''
  currentVisitorInfo.value = null
}

// 清除游客信息
const clearVisitorInfo = () => {
  currentVisitorInfo.value = null
  queryParams.visitorId = ''
  searchType.value = 'keyword'
}

// 重置搜索
const handleReset = () => {
  queryParams.keyword = ''
  queryParams.visitorId = ''
  queryParams.status = ''
  queryParams.page = 1
  currentVisitorInfo.value = null
  searchType.value = 'keyword'
  loadData()
}

const getStatusType = (status) => {
  const statusMap = {
    'Pending': 'warning',
    'Approved': 'success',
    'Rejected': 'danger',
    'Completed': 'success'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    'Pending': '待处理',
    'Approved': '已批准',
    'Rejected': '已驳回',
    'Completed': '已完成'
  }
  return statusMap[status] || status
}

const loadData = async () => {
  loading.value = true

  try {
    if (searchType.value === 'visitorId' && queryParams.visitorId) {
      // 游客ID搜索模式
      await handleVisitorIdSearch()
    } else {
      // 关键词搜索模式
      await refundStore.fetchRefunds({
        keyword: queryParams.keyword,
        status: queryParams.status,
        page: queryParams.page,
        size: queryParams.size
      })
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败，请重试')
  } finally {
    loading.value = false
  }
}

// 游客ID搜索处理
const handleVisitorIdSearch = async () => {
  try {
    // 第一步：获取游客信息
    const visitorData = await getVisitorById(queryParams.visitorId)
    if (!visitorData || !visitorData.user) {
      ElMessage.error('未找到该游客信息')
      currentVisitorInfo.value = null
      return
    }

    currentVisitorInfo.value = visitorData

    // 第二步：使用游客用户名搜索门票
    const ticketResponse = await searchTicketSales({
      keyword: visitorData.user.username,
      pageSize: 100 // 获取该游客的所有门票
    })

    if (ticketResponse.ticketSales && ticketResponse.ticketSales.length > 0) {
      // 第三步：使用票据ID搜索退票记录
      const ticketIds = ticketResponse.ticketSales.map(ticket => ticket.ticketId)

      // 这里需要调用退票搜索API，传入票据ID列表
      // 由于当前API可能不支持批量票据ID搜索，我们使用关键词搜索作为替代
      await refundStore.fetchRefunds({
        keyword: visitorData.user.username, // 使用用户名作为关键词
        status: queryParams.status,
        page: queryParams.page,
        size: queryParams.size
      })

      ElMessage.success(`找到游客 "${visitorData.user.displayName}" 的退票记录`)
    } else {
      // 没有门票，清空退票列表
      refundStore.refunds.list = []
      refundStore.refunds.total = 0
      ElMessage.warning(`游客 "${visitorData.user.displayName}" 暂无门票记录`)
    }

  } catch (error) {
    console.error('游客ID搜索失败:', error)
    ElMessage.error('搜索失败，请重试')
    currentVisitorInfo.value = null
  }
}

const handleSearch = () => {
  queryParams.page = 1
  loadData()
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

const viewDetails = (id) => {
  ElMessage.info(`查看详情功能待实现，ID: ${id}`)
}

const process = (row) => {
  ElMessageBox.confirm(`处理退票单 ${row.refundId}，请选择操作：`, '处理退票', {
    distinguishCancelAndClose: true,
    confirmButtonText: '批准申请',
    cancelButtonText: '驳回申请',
  })
    .then(() => {
      refundStore.processRefundRequest({
        refundId: row.refundId,
        isApproved: true,
        notes: '管理员批准通过',
      })
    })
    .catch((action) => {
      if (action === 'cancel') {
        ElMessageBox.prompt('请输入驳回理由', '驳回申请').then(({ value }) => {
          refundStore.processRefundRequest({
            refundId: row.refundId,
            isApproved: false,
            notes: value || '管理员驳回',
          })
        })
      }
    })
}

onMounted(loadData)
</script>

<style scoped>
.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.visitor-info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #303133;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-bar {
    padding: 15px;
  }

  .el-form--inline .el-form-item {
    display: block;
    margin-bottom: 15px;
  }

  .el-descriptions {
    font-size: 14px;
  }
}
</style>

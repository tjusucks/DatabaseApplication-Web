<template>
  <PageTemplate title="申请退票" description="为游客提交一张或多张门票的退票申请" icon="CirclePlus">
    <!-- 游客查询表单 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" :rules="searchRules" ref="searchFormRef" label-width="120px" @submit.prevent="handleSearchTickets">
        <el-form-item label="游客ID" prop="visitorId">
          <el-input
            v-model="searchForm.visitorId"
            placeholder="请输入游客ID"
            clearable
            @keyup.enter="handleSearchTickets"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearchTickets" :loading="isSearching" icon="Search">
            查询门票
          </el-button>
          <el-button @click="resetSearchForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 游客信息和门票列表 -->
    <el-card shadow="never" class="tickets-card" v-if="visitorInfo">
      <template #header>
        <div class="card-header">
          <h3>游客信息</h3>
        </div>
      </template>

      <div class="visitor-info">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="游客ID">{{ visitorInfo.user.userId }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ visitorInfo.user.displayName }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ visitorInfo.user.username }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ visitorInfo.user.email || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ visitorInfo.user.phoneNumber || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ formatDate(visitorInfo.user.registerTime) }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="tickets-section" v-if="visitorTickets.length > 0">
        <h4>可退票门票列表</h4>
        <el-table :data="refundableTickets" border stripe>
          <el-table-column prop="ticketId" label="票据ID" width="80" />
          <el-table-column prop="serialNumber" label="票据编号" width="180" />
          <el-table-column prop="ticketTypeName" label="票种类型" width="120" />
          <el-table-column prop="actualPrice" label="票价" width="100">
            <template #default="scope">
              ¥{{ scope.row.actualPrice }}
            </template>
          </el-table-column>
          <el-table-column prop="actualStatus" label="实际状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.actualStatus)">
                {{ getStatusText(scope.row.actualStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="salesDate" label="购买时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.salesDate) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="selectTicketForRefund(scope.row)"
                :disabled="!canRefund(scope.row)"
              >
                申请退票
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-else class="no-tickets">
        <el-empty description="该游客暂无门票记录" />
      </div>
    </el-card>

    <!-- 退票申请表单 -->
    <el-card shadow="never" class="form-card" v-if="selectedTicket">
      <template #header>
        <div class="card-header">
          <h3>退票申请</h3>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="选中票据">
          <div class="selected-ticket-info">
            <el-tag type="info" size="large">
              {{ selectedTicket.serialNumber }} - {{ selectedTicket.ticketTypeName }} (¥{{ selectedTicket.actualPrice }})
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item label="退票原因" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入详细的退票原因"
          />
        </el-form-item>
        <el-form-item class="form-footer">
          <el-button @click="cancelRefund">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">
            提交退票申请
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </PageTemplate>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRefundStore } from '@/stores/tickets.js'
import { useUserStore } from '@/stores/user.js'
import PageTemplate from '@/components/PageTemplate.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getVisitorById } from '@/api/visitors.js'
import { searchTicketSales, getTicketTypes, requestRefund } from '@/api/ticket.js'
import { searchEntryRecords } from '@/api/entryRecords.js'

const refundStore = useRefundStore()
const userStore = useUserStore()
const formRef = ref(null)
const searchFormRef = ref(null)
const isSubmitting = ref(false)
const isSearching = ref(false)

// 搜索表单
const searchForm = reactive({ visitorId: '' })
const searchRules = reactive({
  visitorId: [
    { required: true, message: '请输入游客ID', trigger: 'blur' },
    { pattern: /^\d+$/, message: '游客ID必须是数字', trigger: 'blur' }
  ]
})

// 游客信息和门票数据
const visitorInfo = ref(null)
const visitorTickets = ref([])
const selectedTicket = ref(null)
const ticketTypes = ref([])
const usedTicketIds = ref(new Set()) // 存储已使用的票据ID

// 退票申请表单
const form = reactive({ reason: '' })
const rules = reactive({
  reason: [{ required: true, message: '请输入退票原因', trigger: 'blur' }],
})

// 计算可退票的门票（已出票和已使用的票都可以退票，但排除已退款的票）
const refundableTickets = computed(() => {
  return visitorTickets.value.filter(ticket => {
    const actualStatus = getActualTicketStatus(ticket)
    // 已出票和已使用的票都可以退票，但不能退已过期、已退款、已取消的票
    // 特别注意：如果票据状态已经是 "Refunded"，则不能再次退票
    if (ticket.status === 'Refunded') {
      return false
    }
    return actualStatus === 'Issued' || actualStatus === 'Used'
  }).map(ticket => {
    // 增强票据信息
    return {
      ...ticket,
      actualStatus: getActualTicketStatus(ticket),
      actualPrice: getActualTicketPrice(ticket)
    }
  })
})

// 查询游客门票
const handleSearchTickets = async () => {
  if (!searchFormRef.value) return

  await searchFormRef.value.validate(async (valid) => {
    if (valid) {
      isSearching.value = true
      try {
        // 第一步：获取游客信息
        const visitorData = await getVisitorById(searchForm.visitorId)
        if (!visitorData || !visitorData.user) {
          ElMessage.error('未找到该游客信息')
          return
        }

        visitorInfo.value = visitorData

        // 第二步：获取票据类型信息（用于获取正确价格）
        const ticketTypesResponse = await getTicketTypes()
        ticketTypes.value = ticketTypesResponse || []

        // 第三步：检查游客的入园记录（用于判断票据实际状态）
        const entryRecords = await searchEntryRecords({
          visitorId: searchForm.visitorId,
          pageSize: 50
        })

        // 记录已使用的票据ID
        usedTicketIds.value.clear()
        if (entryRecords.items && entryRecords.items.length > 0) {
          entryRecords.items.forEach(record => {
            if (record.ticketId) {
              usedTicketIds.value.add(record.ticketId)
            }
          })
        }

        // 第四步：使用游客用户名搜索门票
        const response = await searchTicketSales({
          keyword: visitorData.user.username,
          pageSize: 50
        })

        if (response.ticketSales && response.ticketSales.length > 0) {
          visitorTickets.value = response.ticketSales

          console.log('🎫 门票查询结果:')
          console.log('  - 门票数量:', response.ticketSales.length)
          console.log('  - 已使用票据ID:', Array.from(usedTicketIds.value))
          console.log('  - 票据类型:', ticketTypes.value)

          ElMessage.success(`找到游客 "${visitorData.user.displayName}" 的 ${response.ticketSales.length} 张门票`)
        } else {
          visitorTickets.value = []
          ElMessage.warning(`游客 "${visitorData.user.displayName}" 暂无门票记录`)
        }

        // 清空之前选中的票据
        selectedTicket.value = null

      } catch (error) {
        console.error('查询门票失败:', error)
        ElMessage.error('查询门票失败，请重试')
        visitorInfo.value = null
        visitorTickets.value = []
      } finally {
        isSearching.value = false
      }
    }
  })
}

// 选择票据进行退票
const selectTicketForRefund = (ticket) => {
  selectedTicket.value = ticket
  form.reason = '' // 清空退票原因
}

// 取消退票
const cancelRefund = () => {
  selectedTicket.value = null
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 获取票据的实际状态（基于入园记录）
const getActualTicketStatus = (ticket) => {
  if (usedTicketIds.value.has(ticket.ticketId)) {
    return 'Used' // 已使用
  }
  return ticket.status // 保持原状态
}

// 获取票据的实际价格（从票据类型获取）
const getActualTicketPrice = (ticket) => {
  if (ticket.basePrice && ticket.basePrice > 0) {
    return ticket.basePrice // 如果票据记录中有价格，使用票据价格
  }

  // 否则从票据类型中获取价格
  const ticketType = ticketTypes.value.find(type => type.typeName === ticket.ticketTypeName)
  return ticketType ? ticketType.basePrice : 0
}

// 检查票据是否可以退票（已出票和已使用的票都可以退票，但排除已退款的票）
const canRefund = (ticket) => {
  // 如果票据状态已经是 "Refunded"，则不能再次退票
  if (ticket.status === 'Refunded') {
    return false
  }
  const actualStatus = getActualTicketStatus(ticket)
  return actualStatus === 'Issued' || actualStatus === 'Used' // 已出票和已使用的票都可以退票
}

// 提交退票申请
const handleSubmit = async () => {
  if (!formRef.value || !selectedTicket.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const confirmResult = await ElMessageBox.confirm(
          `确认为票据 "${selectedTicket.value.serialNumber}" 申请退票吗？`,
          '退票确认',
          {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )

        if (confirmResult === 'confirm') {
          isSubmitting.value = true

          const refundData = {
            ticketId: selectedTicket.value.ticketId,
            requestingVisitorId: visitorInfo.value.user.userId, // 票据所属游客ID
            refundReason: form.reason,
            isAdminRequest: true // 管理员申请，直接批准
            // 不设置processorId，让后端处理
          }

          console.log('🎫 提交退票申请:', refundData)

          // 直接调用API，确保参数完整传递
          const response = await requestRefund(refundData)

          console.log('✅ 退票申请成功:', response)
          ElMessage.success('退票申请提交成功！管理员申请已自动批准')

          // 重新查询门票状态
          await handleSearchTickets()
          // 清空选中的票据
          selectedTicket.value = null
          if (formRef.value) {
            formRef.value.resetFields()
          }
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('提交退票申请失败:', error)
          ElMessage.error('提交退票申请失败，请重试')
        }
      } finally {
        isSubmitting.value = false
      }
    }
  })
}

// 重置搜索表单
const resetSearchForm = () => {
  if (searchFormRef.value) {
    searchFormRef.value.resetFields()
  }
  visitorInfo.value = null
  visitorTickets.value = []
  selectedTicket.value = null
  ticketTypes.value = []
  usedTicketIds.value.clear()
}

// 工具方法
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

const getStatusType = (status) => {
  const statusMap = {
    'Issued': 'success',
    'Used': 'info',
    'Expired': 'warning',
    'Refunded': 'danger',
    'Cancelled': 'info'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    'Issued': '已出票',
    'Used': '已使用',
    'Expired': '已过期',
    'Refunded': '已退款',
    'Cancelled': '已取消'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.search-card {
  margin-bottom: 20px;
}

.tickets-card {
  margin-bottom: 20px;
}

.form-card {
  max-width: 700px;
  margin: 0 auto;
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

.visitor-info {
  margin-bottom: 20px;
}

.tickets-section {
  margin-top: 20px;
}

.tickets-section h4 {
  margin: 0 0 15px 0;
  color: #606266;
  font-size: 16px;
}

.no-tickets {
  text-align: center;
  padding: 40px 0;
}

.selected-ticket-info {
  padding: 10px 0;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-card {
    max-width: 100%;
  }

  .el-descriptions {
    font-size: 14px;
  }
}
</style>

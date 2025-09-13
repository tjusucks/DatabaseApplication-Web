<template>
  <PageTemplate title="入园检票" description="输入游客ID查询门票并进行入园/出园操作">
    <el-card shadow="never" class="entry-card">
      <el-form :model="entryForm" :rules="rules" ref="entryFormRef" label-width="120px">
        <el-form-item label="游客ID" prop="visitorId">
          <el-input
            v-model.number="entryForm.visitorId"
            placeholder="请输入游客ID"
            type="number"
            size="large"
            clearable
            @keyup.enter="handleQueryTickets"
          >
            <template #append>
              <el-button @click="handleQueryTickets" type="primary" :loading="isQuerying">
                <el-icon><Search /></el-icon>
                查询门票
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        
        <!-- 游客入园状态 -->
        <div v-if="visitorInfo" class="visitor-status-section">
          <el-divider content-position="left">
            <span style="color: #67c23a; font-weight: bold;">游客状态</span>
          </el-divider>

          <el-descriptions :column="3" border>
            <el-descriptions-item label="游客姓名">{{ visitorInfo.user.displayName }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ visitorInfo.user.username }}</el-descriptions-item>
            <el-descriptions-item label="入园状态">
              <el-tag :type="visitorInfo.isInPark ? 'success' : 'info'">
                {{ visitorInfo.isInPark ? '在园内' : '不在园内' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>

          <!-- 出园按钮 -->
          <div v-if="visitorInfo.isInPark" style="margin-top: 15px;">
            <el-button
              type="warning"
              size="large"
              @click="handleVisitorExit"
              :loading="isProcessing"
            >
              <el-icon><Back /></el-icon>
              游客出园
            </el-button>
          </div>
        </div>

        <!-- 门票信息显示区域 -->
        <div v-if="visitorTickets.length > 0" class="tickets-section">
          <el-divider content-position="left">
            <span style="color: #409eff; font-weight: bold;">游客门票信息</span>
          </el-divider>

          <el-table :data="visitorTickets" style="width: 100%" border>
            <el-table-column prop="ticketId" label="票据ID" width="80" />
            <el-table-column prop="serialNumber" label="票据编号" width="160" />
            <el-table-column prop="ticketTypeName" label="票种类型" width="100" />
            <el-table-column prop="status" label="状态" width="90">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="salesDate" label="购买时间" width="160">
              <template #default="scope">
                {{ formatDate(scope.row.salesDate) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="150">
              <template #default="scope">
                <el-button
                  v-if="scope.row.status === 'Issued' && !isTicketUsed(scope.row)"
                  type="success"
                  size="small"
                  @click="handleTicketEntry(scope.row, 'entry')"
                  :loading="isProcessing"
                >
                  入园
                </el-button>
                <span v-else-if="scope.row.status === 'Used' || isTicketUsed(scope.row)" style="color: #67c23a;">
                  已使用
                </span>
                <span v-else style="color: #909399;">
                  不可使用
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-divider v-if="visitorTickets.length > 0" />

        <!-- 最近检票记录 -->
        <div v-if="recentRecords.length > 0" class="recent-records">
          <el-divider content-position="left">
            <span style="color: #67c23a; font-weight: bold;">最近检票记录</span>
          </el-divider>
          
          <el-table :data="recentRecords" style="width: 100%" size="small">
            <el-table-column prop="ticketId" label="票据ID" width="80" />
            <el-table-column prop="visitorName" label="游客姓名" width="120" />
            <el-table-column prop="action" label="操作" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.action === '入园' ? 'success' : 'warning'" size="small">
                  {{ scope.row.action }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="操作时间" />
          </el-table>
        </div>
      </el-form>
    </el-card>
  </PageTemplate>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Back } from '@element-plus/icons-vue'
import PageTemplate from '@/components/PageTemplate.vue'
import { searchTicketSales } from '@/api/ticket.js'
import { getVisitorById } from '@/api/visitors.js'
import { createEntryRecord, searchEntryRecords } from '@/api/entryRecords.js'

// 响应式数据
const isQuerying = ref(false)
const isProcessing = ref(false)
const entryFormRef = ref(null)
const visitorInfo = ref(null)
const visitorTickets = ref([])
const recentRecords = ref([])
const usedTickets = ref(new Set()) // 存储已使用的票据ID

const entryForm = reactive({
  visitorId: ''
})

const rules = reactive({
  visitorId: [
    { required: true, message: '请输入游客ID', trigger: 'blur' },
    { type: 'number', message: '游客ID必须为数字', trigger: 'blur' }
  ]
})

// 查询游客门票
const handleQueryTickets = async () => {
  if (!entryFormRef.value) return

  entryFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      isQuerying.value = true

      // 第一步：根据游客ID获取游客信息
      const visitorData = await getVisitorById(entryForm.visitorId)
      if (!visitorData || !visitorData.user) {
        ElMessage.error('游客不存在')
        visitorTickets.value = []
        visitorInfo.value = null
        return
      }

      // 第二步：检查游客入园状态
      const entryRecords = await searchEntryRecords({
        visitorId: entryForm.visitorId,
        pageSize: 10, // 获取更多记录以确保找到活跃记录
        sortBy: 'EntryTime',
        descending: true
      })

      // 判断游客是否在园内（只检查最新的记录）
      let isInPark = false
      if (entryRecords.items && entryRecords.items.length > 0) {
        // 按时间排序，只检查最新的记录
        const latestRecord = entryRecords.items[0] // 已按EntryTime降序排列
        isInPark = latestRecord.exitTime === null

        console.log('🔍 入园记录查询结果:')
        console.log('  - 总记录数:', entryRecords.items.length)
        console.log('  - 最新记录:', latestRecord)
        console.log('  - 最新记录入园时间:', latestRecord.entryTime)
        console.log('  - 最新记录出园时间:', latestRecord.exitTime)
        console.log('  - 是否在园内:', isInPark)

        // 显示所有记录用于调试
        console.log('  - 所有记录:', entryRecords.items.map(r => ({
          id: r.entryRecordId,
          entryTime: r.entryTime,
          exitTime: r.exitTime,
          isActive: r.isActive
        })))
      } else {
        console.log('🔍 没有找到入园记录')
      }

      visitorInfo.value = {
        ...visitorData,
        isInPark: isInPark
      }

      // 第三步：使用游客用户名搜索门票
      const response = await searchTicketSales({
        keyword: visitorData.user.username, // 使用用户名作为关键词搜索
        pageSize: 50 // 获取该游客的所有门票
      })

      if (response.ticketSales && response.ticketSales.length > 0) {
        visitorTickets.value = response.ticketSales

        // 第四步：检查哪些票据已经被使用过（通过入园记录）
        if (entryRecords.items && entryRecords.items.length > 0) {
          entryRecords.items.forEach(record => {
            if (record.ticketId) {
              usedTickets.value.add(record.ticketId)
            }
          })
        }

        ElMessage.success(`找到游客 "${visitorData.user.displayName}" 的 ${response.ticketSales.length} 张门票`)
      } else {
        visitorTickets.value = []
        ElMessage.warning(`游客 "${visitorData.user.displayName}" 暂无门票记录`)
      }
    } catch (error) {
      console.error('查询门票失败:', error)
      ElMessage.error('查询门票失败，请重试')
      visitorTickets.value = []
    } finally {
      isQuerying.value = false
    }
  })
}

// 处理检票入园/出园
const handleTicketEntry = async (ticket, entryType) => {
  try {
    isProcessing.value = true

    // 检查票据是否已被使用
    if (entryType === 'entry' && isTicketUsed(ticket)) {
      ElMessage.error('该票据已被使用，不能重复入园')
      return
    }

    // 检查游客是否已在园内（对于入园操作）
    if (entryType === 'entry' && visitorInfo.value?.isInPark) {
      ElMessage.error('游客已在园内，不能重复入园')
      return
    }

    const action = entryType === 'entry' ? '入园' : '出园'
    const confirmResult = await ElMessageBox.confirm(
      `确认为游客 "${ticket.visitorName}" 使用票据 "${ticket.serialNumber}" ${action}吗？`,
      `${action}确认`,
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info',
      }
    )

    if (confirmResult === 'confirm') {
      // 调用入园/出园API
      await createEntryRecord({
        VisitorId: entryForm.visitorId,
        Type: entryType, // "entry" 或 "exit"
        GateName: 'Main Gate',
        TicketId: entryType === 'entry' ? ticket.ticketId : null
      })

      // 如果是入园，标记票据为已使用
      if (entryType === 'entry') {
        usedTickets.value.add(ticket.ticketId)
      }

      ElMessage.success(`${action}成功！`)

      // 添加到最近记录
      recentRecords.value.unshift({
        id: Date.now(),
        ticketId: ticket.ticketId,
        visitorName: ticket.visitorName,
        action: action,
        time: new Date().toLocaleString()
      })

      // 保持最多10条记录
      if (recentRecords.value.length > 10) {
        recentRecords.value = recentRecords.value.slice(0, 10)
      }

      // 重新查询门票状态和游客状态
      await handleQueryTickets()
    }
  } catch (error) {
    console.error(`${entryType === 'entry' ? '入园' : '出园'}失败:`, error)
    ElMessage.error(error.message || `${entryType === 'entry' ? '入园' : '出园'}失败，请重试`)
  } finally {
    isProcessing.value = false
  }
}

// 处理游客出园（不需要票据）
const handleVisitorExit = async () => {
  try {
    isProcessing.value = true

    const confirmResult = await ElMessageBox.confirm(
      `确认为游客 "${visitorInfo.value.user.displayName}" 办理出园手续吗？`,
      '出园确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    if (confirmResult === 'confirm') {
      // 调用出园API
      await createEntryRecord({
        VisitorId: entryForm.visitorId,
        Type: 'exit',
        GateName: 'Main Gate'
      })

      ElMessage.success('出园成功！')

      // 添加到最近记录
      recentRecords.value.unshift({
        id: Date.now(),
        ticketId: '-',
        visitorName: visitorInfo.value.user.displayName,
        action: '出园',
        time: new Date().toLocaleString()
      })

      // 保持最多10条记录
      if (recentRecords.value.length > 10) {
        recentRecords.value = recentRecords.value.slice(0, 10)
      }

      // 重新查询游客状态
      console.log('出园成功，重新查询游客状态...')
      await handleQueryTickets()
      console.log('状态查询完成，当前游客状态:', visitorInfo.value)
    }
  } catch (error) {
    console.error('出园失败:', error)
    ElMessage.error(error.message || '出园失败，请重试')
  } finally {
    isProcessing.value = false
  }
}

// 检查票据是否已被使用
const isTicketUsed = (ticket) => {
  return usedTickets.value.has(ticket.ticketId)
}

// 工具方法
const getStatusType = (status) => {
  const statusMap = {
    'Issued': 'success',    // 已出票
    'Used': 'warning',      // 已使用
    'Expired': 'info',      // 已过期
    'Refunded': 'danger',   // 已退款
    'Cancelled': 'info'     // 已取消
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
  return statusMap[status] || status || '未知'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString()
}

// 重置表单
const resetForm = () => {
  if (entryFormRef.value) {
    entryFormRef.value.resetFields()
  }
  visitorInfo.value = null
  visitorTickets.value = []
  usedTickets.value.clear() // 清空已使用票据记录
}

onMounted(() => {
  // 组件挂载时的初始化逻辑
})
</script>

<style scoped>
.entry-card {
  margin-bottom: 20px;
}

.visitor-status-section {
  margin: 20px 0;
}

.tickets-section {
  margin: 20px 0;
}

.recent-records {
  margin-top: 20px;
}

.el-table {
  margin-top: 10px;
}
</style>

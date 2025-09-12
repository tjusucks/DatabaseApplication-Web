<template>
  <div class="visitor-detail">
    <div class="page-header">
      <div class="header-left">
        <h2>游客详情</h2>
        <p v-if="visitorData">
          {{ visitorData.user?.displayName || `游客 ${visitorData.visitorId}` }}
        </p>
      </div>
      <div class="header-actions">
        <el-button @click="handleEdit" type="primary" v-if="visitorData">
          <el-icon><Edit /></el-icon>
          编辑信息
        </el-button>
        <el-button @click="$router.go(-1)">
          <el-icon><Back /></el-icon>
          返回
        </el-button>
      </div>
    </div>

    <div v-loading="loading">
      <!-- 基本信息卡片 -->
      <el-card class="info-card" v-if="visitorData">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <div class="status-tags">
              <el-tag :type="visitorData.visitorType === 'Member' ? 'success' : 'info'">
                {{ visitorData.visitorType === 'Member' ? '会员' : '普通游客' }}
              </el-tag>
              <el-tag v-if="visitorData.isBlacklisted" type="danger">已拉黑</el-tag>
            </div>
          </div>
        </template>

        <el-row :gutter="24">
          <el-col :span="12">
            <div class="info-item">
              <label>游客ID：</label>
              <span>{{ visitorData.visitorId }}</span>
            </div>
            <div class="info-item">
              <label>姓名：</label>
              <span>{{ visitorData.user?.displayName || '-' }}</span>
            </div>
            <div class="info-item">
              <label>邮箱：</label>
              <span>{{ visitorData.user?.email || '-' }}</span>
            </div>
            <div class="info-item">
              <label>电话：</label>
              <span>{{ visitorData.user?.phoneNumber || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>身高：</label>
              <span>{{ visitorData.height }}cm</span>
            </div>
            <div class="info-item">
              <label>性别：</label>
              <span>{{ formatGender(visitorData.user?.gender) }}</span>
            </div>
            <div class="info-item">
              <label>生日：</label>
              <span>{{ formatDate(visitorData.user?.birthDate) }}</span>
            </div>
            <div class="info-item">
              <label>注册时间：</label>
              <span>{{ formatDate(visitorData.user?.createdAt) }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 会员信息卡片 -->
      <el-card class="info-card" v-if="visitorData && visitorData.visitorType === 'Member'">
        <template #header>
          <div class="card-header">
            <span>会员信息</span>
            <div class="member-actions">
              <el-button size="small" @click="handlePointsOperation('add')">
                <el-icon><Plus /></el-icon>
                加积分
              </el-button>
              <el-button size="small" @click="handlePointsOperation('deduct')">
                <el-icon><Minus /></el-icon>
                扣积分
              </el-button>
            </div>
          </div>
        </template>

        <el-row :gutter="24">
          <el-col :span="8">
            <div class="member-stat">
              <div class="stat-value">{{ visitorData.points || 0 }}</div>
              <div class="stat-label">当前积分</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="member-stat">
              <div class="stat-value">
                <el-tag :type="getMemberLevelType(visitorData.memberLevel)">
                  {{ formatMemberLevel(visitorData.memberLevel) }}
                </el-tag>
              </div>
              <div class="stat-label">会员等级</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="member-stat">
              <div class="stat-value">
                {{ formatDate(visitorData.memberSince) }}
              </div>
              <div class="stat-label">入会时间</div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 入园历史卡片 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>入园历史</span>
            <el-button size="small" @click="refreshEntryRecords">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </template>

        <el-table :data="entryRecords" v-loading="entryRecordsLoading" stripe>
          <el-table-column label="入园时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.entryTime) }}
            </template>
          </el-table-column>
          <el-table-column label="出园时间" width="180">
            <template #default="{ row }">
              {{ row.exitTime ? formatDate(row.exitTime) : '未出园' }}
            </template>
          </el-table-column>
          <el-table-column prop="entryGate" label="入园门" width="120" />
          <el-table-column prop="exitGate" label="出园门" width="120" />
          <el-table-column label="游玩时长" width="120">
            <template #default="{ row }">
              {{ calculateDuration(row.entryTime, row.exitTime) }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.exitTime ? 'info' : 'success'">
                {{ row.exitTime ? '已出园' : '在园中' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container" v-if="entryRecords.length > 0">
          <el-pagination
            :current-page="entryPagination.currentPage"
            :page-size="entryPagination.pageSize"
            :total="entryPagination.total"
            layout="prev, pager, next"
            @current-change="handleEntryPageChange"
          />
        </div>
      </el-card>

      <!-- 操作记录卡片 -->
      <el-card class="info-card">
        <template #header>
          <span>操作记录</span>
        </template>

        <el-timeline>
          <el-timeline-item
            v-for="record in operationRecords"
            :key="record.id"
            :timestamp="formatDate(record.timestamp)"
            :type="getOperationType(record.type)"
          >
            {{ record.description }}
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>

    <!-- 空状态 -->
    <el-card v-if="!loading && !visitorData">
      <el-empty description="游客不存在或已被删除">
        <el-button type="primary" @click="$router.go(-1)">返回列表</el-button>
      </el-empty>
    </el-card>

    <!-- 积分操作对话框 -->
    <el-dialog
      v-model="pointsDialogVisible"
      :title="pointsOperation === 'add' ? '增加积分' : '扣除积分'"
      width="400px"
    >
      <el-form :model="pointsForm" label-width="80px">
        <el-form-item label="积分数量" required>
          <el-input-number v-model="pointsForm.points" :min="1" :max="10000" style="width: 100%" />
        </el-form-item>
        <el-form-item label="操作原因">
          <el-input
            v-model="pointsForm.reason"
            type="textarea"
            placeholder="请输入操作原因"
            :rows="3"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="pointsDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePointsSubmit" :loading="pointsSubmitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getVisitorById, addPoints, deductPoints, updateVisitor } from '@/api/visitors'
import { searchEntryRecords } from '@/api/entryRecords'

const route = useRoute()
const router = useRouter()

// 数据状态
const loading = ref(false)
const visitorData = ref(null)
const entryRecords = ref([])
const entryRecordsLoading = ref(false)
const operationRecords = ref([])

// 分页
const entryPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 积分操作
const pointsDialogVisible = ref(false)
const pointsOperation = ref('add') // 'add' or 'deduct'
const pointsSubmitting = ref(false)
const pointsForm = reactive({
  points: 100,
  reason: '',
})

// 获取游客ID
const visitorId = computed(() => route.params.id)

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 格式化性别
const formatGender = (gender) => {
  const genderMap = {
    0: '男',
    1: '女',
    2: '其他',
  }
  return genderMap[gender] || '-'
}

// 格式化会员等级
const formatMemberLevel = (level) => {
  const levelMap = {
    Bronze: '青铜',
    Silver: '白银',
    Gold: '黄金',
    Platinum: '铂金',
  }
  return levelMap[level] || level
}

// 获取会员等级标签类型
const getMemberLevelType = (level) => {
  const typeMap = {
    Bronze: '',
    Silver: 'info',
    Gold: 'warning',
    Platinum: 'success',
  }
  return typeMap[level] || ''
}

// 计算游玩时长
const calculateDuration = (entryTime, exitTime) => {
  if (!exitTime) return '-'

  const entry = new Date(entryTime)
  const exit = new Date(exitTime)
  const duration = exit - entry

  const hours = Math.floor(duration / (1000 * 60 * 60))
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}

// 获取操作类型
const getOperationType = (type) => {
  const typeMap = {
    create: 'primary',
    update: 'info',
    blacklist: 'danger',
    unblacklist: 'success',
    member: 'warning',
    points: 'success',
  }
  return typeMap[type] || 'info'
}

// 加载游客数据
const loadVisitorData = async () => {
  try {
    loading.value = true

    const response = await getVisitorById(visitorId.value)
    visitorData.value = response

    // 加载入园记录
    await loadEntryRecords()

    // 模拟操作记录
    operationRecords.value = [
      {
        id: 1,
        type: 'create',
        description: '游客注册',
        timestamp: visitorData.value.user?.createdAt,
      },
    ]

    if (visitorData.value.memberSince) {
      operationRecords.value.push({
        id: 2,
        type: 'member',
        description: '升级为会员',
        timestamp: visitorData.value.memberSince,
      })
    }
  } catch (error) {
    console.error('加载游客数据失败:', error)
    ElMessage.error('加载游客数据失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 加载入园记录
const loadEntryRecords = async () => {
  try {
    entryRecordsLoading.value = true
    const response = await searchEntryRecords({
      visitorId: visitorId.value,
      page: entryPagination.currentPage,
      pageSize: entryPagination.pageSize,
    })

    if (response) {
      entryRecords.value = response.items || response
      entryPagination.total = response.totalCount || response.length || 0
    }
  } catch (error) {
    console.error('加载入园记录失败:', error)
    ElMessage.error('加载入园记录失败：' + error.message)
  } finally {
    entryRecordsLoading.value = false
  }
}

// 刷新入园记录
const refreshEntryRecords = () => {
  entryPagination.currentPage = 1
  loadEntryRecords()
}

// 入园记录分页
const handleEntryPageChange = (page) => {
  entryPagination.currentPage = page
  loadEntryRecords()
}

// 编辑游客
const handleEdit = () => {
  router.push(`/visitors/${visitorId.value}/edit`)
}

// 积分操作
const handlePointsOperation = (operation) => {
  pointsOperation.value = operation
  pointsForm.points = 100
  pointsForm.reason = ''
  pointsDialogVisible.value = true
}

// 提交积分操作
const handlePointsSubmit = async () => {
  try {
    pointsSubmitting.value = true

    const data = {
      points: pointsForm.points,
      reason: pointsForm.reason,
    }

    if (pointsOperation.value === 'add') {
      await addPoints(visitorId.value, data)
      ElMessage.success('积分增加成功')
    } else {
      await deductPoints(visitorId.value, data)
      ElMessage.success('积分扣除成功')
    }

    pointsDialogVisible.value = false
    await loadVisitorData() // 重新加载数据
  } catch (error) {
    ElMessage.error('积分操作失败：' + error.message)
  } finally {
    pointsSubmitting.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  if (visitorId.value) {
    loadVisitorData()
  }
})
</script>

<style scoped>
.visitor-detail {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-left h2 {
  margin: 0 0 4px 0;
  font-size: 24px;
  color: #303133;
}

.header-left p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-tags {
  display: flex;
  gap: 8px;
}

.member-actions {
  display: flex;
  gap: 8px;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
  align-items: center;
}

.info-item label {
  font-weight: 500;
  color: #606266;
  width: 80px;
  flex-shrink: 0;
}

.info-item span {
  color: #303133;
}

.member-stat {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .el-button {
    flex: 1;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .status-tags,
  .member-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-item label {
    width: auto;
    margin-bottom: 4px;
  }
}
</style>

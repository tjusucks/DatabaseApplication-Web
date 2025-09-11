<template>
  <div class="visitor-list">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>游客列表</h2>
      <p>管理和查看所有游客信息</p>
    </div>

    <!-- 搜索和操作区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="姓名、电话、邮箱" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="游客类型">
          <el-select v-model="searchForm.visitorType" placeholder="请选择" clearable style="width: 120px">
            <el-option v-for="option in visitorTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="黑名单状态">
          <el-select v-model="searchForm.isBlacklisted" placeholder="请选择" clearable style="width: 120px">
            <el-option v-for="option in blacklistOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="会员等级">
          <el-select v-model="searchForm.memberLevel" placeholder="请选择" clearable style="width: 120px">
            <el-option v-for="option in memberLevelOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="注册时间">
          <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" style="width: 240px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon>
              <Refresh />
            </el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd">
          <el-icon>
            <Plus />
          </el-icon>
          新增游客
        </el-button>
        <el-button type="success" @click="handleExport">
          <el-icon>
            <Download />
          </el-icon>
          导出数据
        </el-button>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="visitorId" label="游客ID" width="100" />
        <el-table-column label="姓名" width="120">
          <template #default="{ row }">
            {{ row.user?.displayName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="联系方式" width="200">
          <template #default="{ row }">
            <div v-if="row.user?.email || row.user?.phoneNumber">
              <div v-if="row.user?.email" class="contact-item">{{ row.user.email }}</div>
              <div v-if="row.user?.phoneNumber" class="contact-item">{{ row.user.phoneNumber }}</div>
            </div>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="游客类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.visitorType === 'Member' || row.visitorType === 1 ? 'success' : 'info'">
              {{ row.visitorType === 'Member' || row.visitorType === 1 ? '会员' : '普通' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="会员等级" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.memberLevel" :type="getMemberLevelType(row.memberLevel)">
              {{ formatMemberLevel(row.memberLevel) }}
            </el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="积分" width="80">
          <template #default="{ row }">
            {{ row.points || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="身高" width="80">
          <template #default="{ row }">
            {{ row.height }}cm
          </template>
        </el-table-column>
        <el-table-column label="黑名单状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.isBlacklisted ? 'danger' : 'success'">
              {{ row.isBlacklisted ? '已拉黑' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.user?.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="380" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="handleView(row)">
                查看
              </el-button>
              <el-button type="warning" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button
                v-if="row.visitorType !== 'Member' && row.visitorType !== 1"
                type="success"
                size="small"
                @click="handleMembershipToggle(row)">
                升级会员
              </el-button>
              <el-button
                v-else-if="row.visitorType === 'Member' || row.visitorType === 1"
                type="info"
                size="small"
                @click="handleMembershipToggle(row)">
                取消会员
              </el-button>
              <el-button
                :type="row.isBlacklisted ? 'success' : 'danger'"
                size="small"
                @click="handleToggleBlacklist(row)">
                {{ row.isBlacklisted ? '解除拉黑' : '拉黑' }}
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  getVisitors,
  searchVisitors,
  blacklistVisitor,
  unblacklistVisitor,
  upgradeToMember,
  removeMembership,
  deleteVisitor
} from '@/api/visitors'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  visitorType: '',
  isBlacklisted: '',
  memberLevel: '',
  dateRange: []
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

// 游客类型选项
const visitorTypeOptions = [
  { label: '全部', value: '' },
  { label: '普通游客', value: 0 },
  { label: '会员', value: 1 }
]

// 黑名单状态选项
const blacklistOptions = [
  { label: '全部', value: '' },
  { label: '正常', value: false },
  { label: '已拉黑', value: true }
]

// 会员等级选项
const memberLevelOptions = [
  { label: '全部', value: '' },
  { label: '青铜', value: 'Bronze' },
  { label: '白银', value: 'Silver' },
  { label: '黄金', value: 'Gold' },
  { label: '铂金', value: 'Platinum' }
]

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 格式化会员等级
const formatMemberLevel = (level) => {
  const levelMap = {
    'Bronze': '青铜',
    'Silver': '白银',
    'Gold': '黄金',
    'Platinum': '铂金'
  }
  return levelMap[level] || level
}

// 获取会员等级标签类型
const getMemberLevelType = (level) => {
  const typeMap = {
    'Bronze': 'info',
    'Silver': 'primary',
    'Gold': 'warning',
    'Platinum': 'success'
  }
  return typeMap[level] || 'info'
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    visitorType: '',
    isBlacklisted: '',
    memberLevel: '',
    dateRange: []
  })
  pagination.currentPage = 1
  loadData()
}

// 新增游客
const handleAdd = () => {
  router.push('/visitors/create')
}

// 导出数据
const handleExport = async () => {
  try {
    ElMessage.info('正在导出数据...')
    // TODO: 实现导出功能
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败：' + error.message)
  }
}

// 查看详情
const handleView = (row) => {
  router.push(`/visitors/${row.visitorId}`)
}

// 编辑游客
const handleEdit = (row) => {
  router.push(`/visitors/${row.visitorId}/edit`)
}

// 切换黑名单状态
const handleToggleBlacklist = async (row) => {
  const action = row.isBlacklisted ? '解除拉黑' : '拉黑'
  try {
    let reason = ''
    if (!row.isBlacklisted) {
      const { value } = await ElMessageBox.prompt(
        '请输入拉黑原因：',
        `${action}游客 ${row.user?.displayName || row.visitorId}`,
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /.+/,
          inputErrorMessage: '请输入拉黑原因'
        }
      )
      reason = value
    } else {
      await ElMessageBox.confirm(
        `确定要${action}游客 ${row.user?.displayName || row.visitorId} 吗？`,
        '确认操作',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    }

    loading.value = true
    if (row.isBlacklisted) {
      await unblacklistVisitor(row.visitorId)
    } else {
      await blacklistVisitor(row.visitorId, { reason })
    }

    ElMessage.success(`${action}成功`)
    await loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败：` + error.message)
    }
  } finally {
    loading.value = false
  }
}

// 会员管理
const handleMembershipToggle = async (row) => {
  const action = (row.visitorType === 'Member' || row.visitorType === 1) ? '取消会员' : '升级会员'
  try {
    await ElMessageBox.confirm(
      `确定要${action} ${row.user?.displayName || row.visitorId} 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    if (row.visitorType === 'Member' || row.visitorType === 1) {
      await removeMembership(row.visitorId)
    } else {
      await upgradeToMember(row.visitorId)
    }

    ElMessage.success(`${action}成功`)
    await loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(`${action}失败:`, error)

      // 处理具体的错误信息
      let errorMessage = `${action}失败`

      if (error.response?.data?.error) {
        // 后端返回的具体错误信息
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        // 检查是否是联系方式相关的错误
        if (error.message.includes('Email or phone number is required') ||
            error.message.includes('联系方式') ||
            error.message.includes('邮箱') ||
            error.message.includes('电话')) {
          errorMessage = '升级会员失败：该游客没有邮箱或电话号码，请先编辑游客信息添加联系方式'
        } else if (error.message.includes('blacklisted')) {
          errorMessage = '升级会员失败：黑名单用户无法升级为会员'
        } else {
          errorMessage = `${action}失败：${error.message}`
        }
      }

      ElMessage.error(errorMessage)
    }
  } finally {
    loading.value = false
  }
}

// 删除游客
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除游客 ${row.user?.displayName || row.visitorId} 吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    loading.value = true
    await deleteVisitor(row.visitorId)
    ElMessage.success('删除成功')
    await loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + error.message)
    }
  } finally {
    loading.value = false
  }
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  loadData()
}

// 当前页改变
const handleCurrentChange = (page) => {
  pagination.currentPage = page
  loadData()
}

// 加载数据
const loadData = async () => {
  try {
    loading.value = true

    // 构建查询参数
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    }

    // 添加搜索条件
    if (searchForm.keyword) {
      params.keyword = searchForm.keyword
    }
    if (searchForm.visitorType) {
      params.visitorType = searchForm.visitorType
    }
    if (searchForm.isBlacklisted !== '') {
      params.isBlacklisted = searchForm.isBlacklisted
    }
    if (searchForm.memberLevel) {
      params.memberLevel = searchForm.memberLevel
    }
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0].toISOString()
      params.endDate = searchForm.dateRange[1].toISOString()
    }

    const response = await searchVisitors(params)

    if (response) {
      tableData.value = response.items || response
      pagination.total = response.totalCount || response.length || 0
    } else {
      tableData.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('加载游客数据失败:', error)
    ElMessage.error('加载数据失败：' + error.message)
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.visitor-list {
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

.search-form .el-form-item {
  margin-bottom: 12px;
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

.contact-item {
  font-size: 12px;
  line-height: 1.4;
}

.text-muted {
  color: #909399;
}

.action-buttons {
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  align-items: center;
}

.action-buttons .el-button {
  margin-left: 0 !important;
  margin-right: 0 !important;
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .search-form {
    flex-wrap: wrap;
  }

  .search-form .el-form-item {
    margin-right: 8px;
  }
}

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

  .el-table {
    font-size: 12px;
  }
}
</style>

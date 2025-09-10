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
        <el-form-item label="游客姓名">
          <el-input v-model="searchForm.name" placeholder="请输入游客姓名" clearable />
        </el-form-item>
        <el-form-item label="电话号码">
          <el-input v-model="searchForm.phone" placeholder="请输入电话号码" clearable />
        </el-form-item>
        <el-form-item label="注册时间">
          <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" />
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
        <el-table-column prop="id" label="游客ID" width="100" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="phone" label="电话号码" width="140" />
        <el-table-column prop="registerTime" label="注册时间" width="180" />
        <el-table-column prop="isBlacklisted" label="黑名单状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.isBlacklisted ? 'danger' : 'success'">
              {{ row.isBlacklisted ? '已拉黑' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button type="warning" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button :type="row.isBlacklisted ? 'success' : 'danger'" size="small"
              @click="handleToggleBlacklist(row)">
              {{ row.isBlacklisted ? '解除拉黑' : '拉黑' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  searchVisitors,
  updateVisitorBlacklistStatus,
  deleteVisitor,
  getVisitorsByBlacklistStatus,
  searchVisitorsByName,
  searchVisitorsByPhone
} from '@/api/visitors'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  name: '',
  phone: '',
  dateRange: [],
  visitorType: '',
  isBlacklisted: ''
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

// 搜索
const handleSearch = () => {
  console.log('搜索条件:', searchForm)
  loadData()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    phone: '',
    dateRange: []
  })
  loadData()
}

// 新增游客
const handleAdd = () => {
  ElMessage.info('新增游客功能开发中...')
}

// 导出数据
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 查看详情
const handleView = (row) => {
  ElMessage.info(`查看游客 ${row.name} 的详细信息`)
}

// 编辑游客
const handleEdit = (row) => {
  ElMessage.info(`编辑游客 ${row.name} 的信息`)
}

// 切换黑名单状态
const handleToggleBlacklist = async (row) => {
  const action = row.isBlacklisted ? '解除拉黑' : '拉黑'
  try {
    await ElMessageBox.confirm(
      `确定要${action}游客 ${row.name} 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    row.isBlacklisted = !row.isBlacklisted
    ElMessage.success(`${action}成功`)
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

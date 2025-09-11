<template>
  <div class="visitor-statistics">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>游客统计分析</h2>
      <p>游客数据统计分析，包括访客类型分布、会员等级分布、入园趋势等</p>
    </div>

    <!-- 时间范围选择 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline class="filter-form">
        <el-form-item label="统计时间">
          <el-date-picker 
            v-model="filterForm.dateRange" 
            type="daterange" 
            range-separator="至" 
            start-placeholder="开始日期"
            end-placeholder="结束日期" 
            style="width: 300px"
            @change="handleDateRangeChange"
          />
        </el-form-item>
        <el-form-item label="快速选择">
          <el-radio-group v-model="filterForm.quickSelect" @change="handleQuickSelectChange">
            <el-radio-button label="today">今日</el-radio-button>
            <el-radio-button label="week">本周</el-radio-button>
            <el-radio-button label="month">本月</el-radio-button>
            <el-radio-button label="quarter">本季度</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleRefreshData" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
          <el-button @click="handleExportReport">
            <el-icon><Download /></el-icon>
            导出报表
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 核心指标卡片 -->
    <el-row :gutter="20" class="metrics-row">
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric-content">
            <div class="metric-value">{{ metrics.totalVisitors }}</div>
            <div class="metric-label">总游客数</div>
            <div class="metric-change" :class="getChangeClass(metrics.visitorChange)">
              <el-icon><TrendCharts /></el-icon>
              {{ formatChange(metrics.visitorChange) }}
            </div>
          </div>
          <el-icon class="metric-icon" color="#409eff"><UserFilled /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric-content">
            <div class="metric-value">{{ metrics.totalMembers }}</div>
            <div class="metric-label">会员总数</div>
            <div class="metric-change" :class="getChangeClass(metrics.memberChange)">
              <el-icon><TrendCharts /></el-icon>
              {{ formatChange(metrics.memberChange) }}
            </div>
          </div>
          <el-icon class="metric-icon" color="#67c23a"><Star /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric-content">
            <div class="metric-value">{{ metrics.totalEntries }}</div>
            <div class="metric-label">总入园次数</div>
            <div class="metric-change" :class="getChangeClass(metrics.entryChange)">
              <el-icon><TrendCharts /></el-icon>
              {{ formatChange(metrics.entryChange) }}
            </div>
          </div>
          <el-icon class="metric-icon" color="#e6a23c"><LocationInformation /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric-content">
            <div class="metric-value">{{ formatDuration(metrics.avgStayTime) }}</div>
            <div class="metric-label">平均停留时间</div>
            <div class="metric-change" :class="getChangeClass(metrics.stayTimeChange)">
              <el-icon><TrendCharts /></el-icon>
              {{ formatChange(metrics.stayTimeChange) }}
            </div>
          </div>
          <el-icon class="metric-icon" color="#f56c6c"><Timer /></el-icon>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <!-- 游客类型分布 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>游客类型分布</span>
              <el-tag type="info">{{ filterForm.dateRange ? '时间段内' : '全部' }}</el-tag>
            </div>
          </template>
          <div class="chart-container" ref="visitorTypeChartRef">
            <div class="chart-placeholder">
              <el-icon size="64" color="#ddd"><PieChart /></el-icon>
              <p>游客类型分布图</p>
              <div class="chart-data">
                <div class="data-item">
                  <span class="data-label">普通游客:</span>
                  <span class="data-value">{{ chartData.visitorTypes.regular }}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">会员:</span>
                  <span class="data-value">{{ chartData.visitorTypes.member }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 会员等级分布 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>会员等级分布</span>
              <el-tag type="success">仅会员</el-tag>
            </div>
          </template>
          <div class="chart-container" ref="memberLevelChartRef">
            <div class="chart-placeholder">
              <el-icon size="64" color="#ddd"><TrendCharts /></el-icon>
              <p>会员等级分布图</p>
              <div class="chart-data">
                <div class="data-item">
                  <span class="data-label">青铜:</span>
                  <span class="data-value">{{ chartData.memberLevels.bronze }}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">白银:</span>
                  <span class="data-value">{{ chartData.memberLevels.silver }}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">黄金:</span>
                  <span class="data-value">{{ chartData.memberLevels.gold }}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">铂金:</span>
                  <span class="data-value">{{ chartData.memberLevels.platinum }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 入园趋势图 -->
    <el-row :gutter="20" class="trend-row">
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>入园趋势分析</span>
              <div class="chart-controls">
                <el-radio-group v-model="trendType" size="small">
                  <el-radio-button label="daily">按日</el-radio-button>
                  <el-radio-button label="weekly">按周</el-radio-button>
                  <el-radio-button label="monthly">按月</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>
          <div class="chart-container large" ref="trendChartRef">
            <div class="chart-placeholder">
              <el-icon size="64" color="#ddd"><DataLine /></el-icon>
              <p>入园趋势图表</p>
              <p>显示选定时间范围内的入园趋势变化</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细统计表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <span>详细统计数据</span>
          <el-button size="small" @click="handleExportTable">
            <el-icon><Download /></el-icon>
            导出表格
          </el-button>
        </div>
      </template>
      
      <el-table :data="statisticsTable" v-loading="tableLoading" stripe border>
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="totalVisitors" label="总游客数" width="100" />
        <el-table-column prop="newVisitors" label="新增游客" width="100" />
        <el-table-column prop="memberVisitors" label="会员游客" width="100" />
        <el-table-column prop="totalEntries" label="入园次数" width="100" />
        <el-table-column prop="avgStayTime" label="平均停留时间" width="120">
          <template #default="{ row }">
            {{ formatDuration(row.avgStayTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="revenue" label="相关收入" width="120">
          <template #default="{ row }">
            ¥{{ row.revenue.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="satisfaction" label="满意度" width="100">
          <template #default="{ row }">
            <el-rate v-model="row.satisfaction" disabled show-score />
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          :current-page="tablePagination.currentPage"
          :page-size="tablePagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="tablePagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleTableSizeChange"
          @current-change="handleTableCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getVisitorStats,
  getGroupedVisitorStats
} from '@/api/visitors'
import {
  getEntryRecordStats,
  getGroupedEntryRecordStats
} from '@/api/entryRecords'

// 加载状态
const loading = ref(false)
const tableLoading = ref(false)

// 筛选表单
const filterForm = reactive({
  dateRange: [],
  quickSelect: 'month'
})

// 趋势类型
const trendType = ref('daily')

// 核心指标
const metrics = reactive({
  totalVisitors: 0,
  totalMembers: 0,
  totalEntries: 0,
  avgStayTime: 0,
  visitorChange: 0,
  memberChange: 0,
  entryChange: 0,
  stayTimeChange: 0
})

// 图表数据
const chartData = reactive({
  visitorTypes: {
    regular: 0,
    member: 0
  },
  memberLevels: {
    bronze: 0,
    silver: 0,
    gold: 0,
    platinum: 0
  },
  trendData: []
})

// 统计表格数据
const statisticsTable = ref([])
const tablePagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 图表引用
const visitorTypeChartRef = ref(null)
const memberLevelChartRef = ref(null)
const trendChartRef = ref(null)

// 格式化时长
const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return '-'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}小时${mins}分钟`
  } else {
    return `${mins}分钟`
  }
}

// 格式化变化百分比
const formatChange = (change) => {
  if (change === 0) return '0%'
  const sign = change > 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}%`
}

// 获取变化样式类
const getChangeClass = (change) => {
  if (change > 0) return 'positive'
  if (change < 0) return 'negative'
  return 'neutral'
}

// 日期范围变化
const handleDateRangeChange = (dateRange) => {
  if (dateRange) {
    filterForm.quickSelect = ''
  }
  loadAllData()
}

// 快速选择变化
const handleQuickSelectChange = (value) => {
  const now = new Date()
  let startDate, endDate = new Date()

  switch (value) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'week':
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay())
      startDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate())
      break
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'quarter':
      const quarterStart = Math.floor(now.getMonth() / 3) * 3
      startDate = new Date(now.getFullYear(), quarterStart, 1)
      break
    default:
      return
  }

  filterForm.dateRange = [startDate, endDate]
  loadAllData()
}

// 刷新数据
const handleRefreshData = () => {
  loadAllData()
}

// 导出报表
const handleExportReport = () => {
  ElMessage.info('导出报表功能开发中...')
}

// 导出表格
const handleExportTable = () => {
  ElMessage.info('导出表格功能开发中...')
}

// 表格分页
const handleTableSizeChange = (size) => {
  tablePagination.pageSize = size
  tablePagination.currentPage = 1
  loadStatisticsTable()
}

const handleTableCurrentChange = (page) => {
  tablePagination.currentPage = page
  loadStatisticsTable()
}

// 加载核心指标
const loadMetrics = async () => {
  try {
    const params = {}
    if (filterForm.dateRange && filterForm.dateRange.length === 2) {
      params.startDate = filterForm.dateRange[0].toISOString()
      params.endDate = filterForm.dateRange[1].toISOString()
    }

    const [visitorStatsResponse, entryStatsResponse] = await Promise.all([
      getVisitorStats({ ...params, includeChanges: true }),
      getEntryRecordStats({ ...params, includeChanges: true })
    ])

    if (visitorStatsResponse) {
      metrics.totalVisitors = visitorStatsResponse.totalVisitors || 0
      metrics.totalMembers = visitorStatsResponse.totalMembers || 0
      metrics.visitorChange = visitorStatsResponse.visitorChange || 0
      metrics.memberChange = visitorStatsResponse.memberChange || 0
    }

    if (entryStatsResponse) {
      metrics.totalEntries = entryStatsResponse.totalEntries || 0
      metrics.avgStayTime = entryStatsResponse.avgStayTime || 0
      metrics.entryChange = entryStatsResponse.entryChange || 0
      metrics.stayTimeChange = entryStatsResponse.stayTimeChange || 0
    }

  } catch (error) {
    console.error('加载核心指标失败:', error)
    // 使用模拟数据
    metrics.totalVisitors = 1250
    metrics.totalMembers = 380
    metrics.totalEntries = 2100
    metrics.avgStayTime = 180
    metrics.visitorChange = 12.5
    metrics.memberChange = 8.3
    metrics.entryChange = 15.2
    metrics.stayTimeChange = -2.1
  }
}

// 加载图表数据
const loadChartData = async () => {
  try {
    const params = {}
    if (filterForm.dateRange && filterForm.dateRange.length === 2) {
      params.startDate = filterForm.dateRange[0].toISOString()
      params.endDate = filterForm.dateRange[1].toISOString()
    }

    const [visitorGroupedResponse, entryGroupedResponse] = await Promise.all([
      getGroupedVisitorStats({ ...params, groupBy: 'type' }),
      getGroupedEntryRecordStats({ ...params, groupBy: trendType.value })
    ])

    if (visitorGroupedResponse) {
      const data = visitorGroupedResponse
      chartData.visitorTypes.regular = data.regular || 0
      chartData.visitorTypes.member = data.member || 0

      if (data.memberLevels) {
        chartData.memberLevels.bronze = data.memberLevels.bronze || 0
        chartData.memberLevels.silver = data.memberLevels.silver || 0
        chartData.memberLevels.gold = data.memberLevels.gold || 0
        chartData.memberLevels.platinum = data.memberLevels.platinum || 0
      }
    }

    if (entryGroupedResponse) {
      chartData.trendData = entryGroupedResponse.items || []
    }

  } catch (error) {
    console.error('加载图表数据失败:', error)
    // 使用模拟数据
    chartData.visitorTypes.regular = 870
    chartData.visitorTypes.member = 380
    chartData.memberLevels.bronze = 180
    chartData.memberLevels.silver = 120
    chartData.memberLevels.gold = 60
    chartData.memberLevels.platinum = 20
  }
}

// 加载统计表格
const loadStatisticsTable = async () => {
  try {
    tableLoading.value = true

    // 模拟统计表格数据
    const mockData = []
    const now = new Date()

    for (let i = 0; i < 30; i++) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)

      mockData.push({
        date: date.toLocaleDateString('zh-CN'),
        totalVisitors: Math.floor(Math.random() * 100) + 50,
        newVisitors: Math.floor(Math.random() * 20) + 5,
        memberVisitors: Math.floor(Math.random() * 40) + 15,
        totalEntries: Math.floor(Math.random() * 150) + 80,
        avgStayTime: Math.floor(Math.random() * 120) + 120,
        revenue: Math.floor(Math.random() * 50000) + 20000,
        satisfaction: (Math.random() * 2 + 3).toFixed(1)
      })
    }

    statisticsTable.value = mockData.slice(
      (tablePagination.currentPage - 1) * tablePagination.pageSize,
      tablePagination.currentPage * tablePagination.pageSize
    )
    tablePagination.total = mockData.length

  } catch (error) {
    console.error('加载统计表格失败:', error)
    ElMessage.error('加载统计表格失败：' + error.message)
  } finally {
    tableLoading.value = false
  }
}

// 加载所有数据
const loadAllData = async () => {
  try {
    loading.value = true
    await Promise.all([
      loadMetrics(),
      loadChartData(),
      loadStatisticsTable()
    ])
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  // 默认选择本月
  handleQuickSelectChange('month')
})
</script>

<style scoped>
.visitor-statistics {
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

.filter-card {
  margin-bottom: 20px;
}

.filter-form .el-form-item {
  margin-bottom: 12px;
}

.metrics-row {
  margin-bottom: 20px;
}

.metric-card {
  position: relative;
  overflow: hidden;
}

.metric-card .el-card__body {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.metric-change {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.metric-change.positive {
  color: #67c23a;
}

.metric-change.negative {
  color: #f56c6c;
}

.metric-change.neutral {
  color: #909399;
}

.metric-icon {
  font-size: 40px;
  opacity: 0.8;
}

.charts-row {
  margin-bottom: 20px;
}

.trend-row {
  margin-bottom: 20px;
}

.chart-card {
  min-height: 400px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.chart-container {
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container.large {
  height: 400px;
}

.chart-placeholder {
  text-align: center;
  color: #909399;
}

.chart-placeholder p {
  margin: 8px 0;
}

.chart-data {
  margin-top: 16px;
  text-align: left;
  display: inline-block;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  min-width: 120px;
}

.data-label {
  font-size: 14px;
  color: #606266;
}

.data-value {
  font-weight: bold;
  font-size: 16px;
  color: #303133;
  margin-left: 12px;
}

.table-card {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .filter-form {
    flex-wrap: wrap;
  }

  .filter-form .el-form-item {
    margin-right: 8px;
  }

  .charts-row .el-col {
    margin-bottom: 16px;
  }
}

@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
  }

  .metrics-row .el-col {
    margin-bottom: 16px;
  }

  .metric-card .el-card__body {
    padding: 16px;
  }

  .metric-value {
    font-size: 24px;
  }

  .metric-icon {
    font-size: 32px;
  }

  .chart-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .chart-controls {
    width: 100%;
    justify-content: flex-start;
  }

  .chart-container {
    height: 280px;
  }

  .chart-container.large {
    height: 320px;
  }

  .table-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .el-table {
    font-size: 12px;
  }
}
</style>

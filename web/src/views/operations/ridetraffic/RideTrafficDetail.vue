<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ rideName || '游乐设施流量详情' }}</h2>
      <p>查看 {{ rideName || '设施' }} 的实时和历史流量数据</p>
    </div>

    <div class="ride-traffic-detail" v-loading="loading">
      <!-- 设施基本信息 -->
      <el-card class="ride-info-card">
        <template #header>
          <div class="card-header">
            <span>设施信息</span>
            <div class="header-controls">
              <el-button type="primary" @click="updateRideData" :loading="updating" size="small">
                <el-icon><Refresh /></el-icon>
                更新实时数据
              </el-button>
              <el-button
                :type="isAutoRefresh ? 'success' : 'info'"
                @click="toggleAutoRefresh"
                size="small"
              >
                <el-icon>
                  <component :is="isAutoRefresh ? 'VideoPlay' : 'VideoPause'" />
                </el-icon>
                {{ isAutoRefresh ? '停止自动刷新' : '开始自动刷新' }}
              </el-button>
              <el-select
                v-model="refreshIntervalTime"
                @change="changeRefreshInterval"
                size="small"
                style="width: 120px"
              >
                <el-option :value="1000" label="1秒刷新" />
                <el-option :value="2000" label="2秒刷新" />
                <el-option :value="3000" label="3秒刷新" />
                <el-option :value="5000" label="5秒刷新" />
                <el-option :value="10000" label="10秒刷新" />
              </el-select>
            </div>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">设施ID:</span>
              <span class="info-value">{{ currentRide.rideId || 'N/A' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">设施名称:</span>
              <span class="info-value">{{ currentRide.rideName || 'N/A' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">最后更新:</span>
              <span class="info-value">{{ formatDate(currentRide.recordTime) || 'N/A' }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 实时数据面板 -->
      <el-row :gutter="20" class="realtime-stats">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <span class="stat-label">当前游客数</span>
              <span class="stat-value" :class="getVisitorCountClass(currentRide.visitorCount)">
                {{ currentRide.visitorCount || 0 }}
              </span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <span class="stat-label">队列长度</span>
              <span class="stat-value" :class="getQueueLengthClass(currentRide.queueLength)">
                {{ currentRide.queueLength || 0 }}
              </span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <span class="stat-label">预计等待</span>
              <span class="stat-value" :class="getWaitingTimeClass(currentRide.waitingTime)">
                {{ currentRide.waitingTime || 0 }}分钟
              </span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <span class="stat-label">拥挤状态</span>
              <span class="stat-value">
                <el-tag :type="currentRide.isCrowded ? 'danger' : 'success'">
                  {{ currentRide.isCrowded ? '拥挤' : '正常' }}
                </el-tag>
              </span>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表展示 -->
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>流量趋势</span>
            <div class="chart-controls">
              <el-button @click="refreshChart" size="small">
                <el-icon><Refresh /></el-icon>
                刷新图表
              </el-button>
            </div>
          </div>
        </template>

        <div class="chart-container">
          <div ref="chartContainer" style="width: 100%; height: 500px"></div>
        </div>
      </el-card>

      <!-- 历史数据表格 -->
      <el-card class="history-table-card">
        <template #header>
          <div class="card-header">
            <span>历史流量数据</span>
            <div class="table-controls">
              <el-button @click="exportHistoryData" size="small">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </div>
          </div>
        </template>

        <!-- 搜索和过滤控件 -->
        <div class="search-filters">
          <el-row :gutter="10" class="filter-row">
            <el-col :span="4">
              <el-input
                v-model="searchFilters.keyword"
                placeholder="关键词搜索"
                clearable
                @keyup.enter="fetchHistoricalData"
              />
            </el-col>
            <el-col :span="3">
              <el-select
                v-model="searchFilters.isCrowded"
                placeholder="拥挤状态"
                clearable
                @change="fetchHistoricalData"
              >
                <el-option label="拥挤" :value="true" />
                <el-option label="正常" :value="false" />
              </el-select>
            </el-col>
            <el-col :span="3">
              <el-select
                v-model="searchFilters.sortOrder"
                placeholder="排序方式"
                @change="fetchHistoricalData"
              >
                <el-option label="时间倒序" value="desc" />
                <el-option label="时间正序" value="asc" />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-input
                v-model.number="searchFilters.minVisitorCount"
                placeholder="最小游客数"
                type="number"
                @change="fetchHistoricalData"
              />
            </el-col>
            <el-col :span="6">
              <el-input
                v-model.number="searchFilters.maxVisitorCount"
                placeholder="最大游客数"
                type="number"
                @change="fetchHistoricalData"
              />
            </el-col>
            <el-col :span="2">
              <el-button type="primary" @click="fetchHistoricalData">
                <el-icon><Search /></el-icon>
              </el-button>
            </el-col>
          </el-row>

          <el-row :gutter="10" class="filter-row">
            <el-col :span="4">
              <el-date-picker
                v-model="searchFilters.recordTimeFrom"
                type="datetime"
                placeholder="开始时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                @change="fetchHistoricalData"
              />
            </el-col>
            <el-col :span="4">
              <el-date-picker
                v-model="searchFilters.recordTimeTo"
                type="datetime"
                placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                @change="fetchHistoricalData"
              />
            </el-col>
            <el-col :span="4">
              <el-input
                v-model.number="searchFilters.minQueueLength"
                placeholder="最小队列长度"
                type="number"
                @change="fetchHistoricalData"
              />
            </el-col>
            <el-col :span="4">
              <el-input
                v-model.number="searchFilters.maxQueueLength"
                placeholder="最大队列长度"
                type="number"
                @change="fetchHistoricalData"
              />
            </el-col>
            <el-col :span="4">
              <el-input
                v-model.number="searchFilters.minWaitingTime"
                placeholder="最小等待时间"
                type="number"
                @change="fetchHistoricalData"
              />
            </el-col>
            <el-col :span="4">
              <el-input
                v-model.number="searchFilters.maxWaitingTime"
                placeholder="最大等待时间"
                type="number"
                @change="fetchHistoricalData"
              />
            </el-col>
          </el-row>

          <el-row :gutter="10" class="filter-row">
            <el-col :span="24">
              <div class="filter-actions">
                <el-button @click="resetFilters" size="small"> 重置筛选 </el-button>
              </div>
            </el-col>
          </el-row>
        </div>

        <el-table :data="historicalData" stripe style="width: 100%" height="400">
          <el-table-column prop="recordTime" label="记录时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.recordTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="visitorCount" label="游客数量" width="100">
            <template #default="{ row }">
              <el-tag :type="getVisitorCountTagType(row.visitorCount)">
                {{ row.visitorCount }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="queueLength" label="队列长度" width="100" />
          <el-table-column prop="waitingTime" label="等待时间(分钟)" width="120" />
          <el-table-column label="拥挤状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.isCrowded ? 'danger' : 'success'">
                {{ row.isCrowded ? '拥挤' : '正常' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div class="table-pagination">
          <el-pagination
            v-model:current-page="historyPage"
            v-model:page-size="historyPageSize"
            :page-sizes="[10, 20, 50]"
            :total="historyTotal"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleHistorySizeChange"
            @current-change="handleHistoryPageChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import * as rideTrafficApi from '@/api/rideTraffic'

// Router
const route = useRoute()
const router = useRouter()

// Reactive data
const loading = ref(false)
const updating = ref(false)
const currentRide = ref({})
const historicalData = ref([])
const chart = ref(null)
const chartContainer = ref(null)
const dateRange = ref([])
const historyPage = ref(1)
const historyPageSize = ref(20)
const historyTotal = ref(0)

// Search and filter data
const searchFilters = ref({
  keyword: '',
  isCrowded: null,
  sortOrder: 'desc',
  minVisitorCount: null,
  maxVisitorCount: null,
  minQueueLength: null,
  maxQueueLength: null,
  minWaitingTime: null,
  maxWaitingTime: null,
  recordTimeFrom: null,
  recordTimeTo: null,
})

// Chart date range
const chartDateRange = ref([])

// 实时更新相关
const refreshInterval = ref(null)
const isAutoRefresh = ref(false)
const refreshIntervalTime = ref(1000) // 1秒刷新一次
const isUpdating = ref(false) // 防抖标志

// Computed
const rideId = computed(() => route.params.id)
const rideName = computed(() => currentRide.value.rideName)

// Methods
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const getVisitorCountClass = (count) => {
  if (count > 100) return 'high-value'
  if (count > 50) return 'medium-value'
  return 'normal-value'
}

const getQueueLengthClass = (length) => {
  if (length > 50) return 'high-value'
  if (length > 20) return 'medium-value'
  return 'normal-value'
}

const getWaitingTimeClass = (time) => {
  if (time > 60) return 'high-value'
  if (time > 30) return 'medium-value'
  return 'normal-value'
}

const getVisitorCountTagType = (count) => {
  if (count > 100) return 'danger'
  if (count > 50) return 'warning'
  return 'success'
}

// 实时更新方法
const startAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }

  if (isAutoRefresh.value) {
    refreshInterval.value = setInterval(() => {
      if (!loading.value && !updating.value) {
        fetchRideRealTimeData()
      }
    }, refreshIntervalTime.value)
  }
}

// 优化的实时更新方法，只更新数据部分
const updateRealTimeRideData = async () => {
  if (!isAutoRefresh.value || loading.value || updating.value || isUpdating.value || !rideId.value)
    return

  isUpdating.value = true
  try {
    const response = await rideTrafficApi.getRealTimeRideTraffic(rideId.value)
    if (response) {
      // 只更新数据，不触发页面重新渲染
      currentRide.value = response
      updateChart()
    }
  } catch (error) {
    console.error('获取设施实时数据失败:', error)
  } finally {
    isUpdating.value = false
  }
}

// 优化的自动刷新方法
const startOptimizedAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }

  if (isAutoRefresh.value) {
    refreshInterval.value = setInterval(() => {
      updateRealTimeRideData()
    }, refreshIntervalTime.value)
  }
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

const toggleAutoRefresh = () => {
  isAutoRefresh.value = !isAutoRefresh.value
  if (isAutoRefresh.value) {
    startAutoRefresh()
    ElMessage.success('已开启自动刷新')
  } else {
    stopAutoRefresh()
    ElMessage.info('已关闭自动刷新')
  }
}

const changeRefreshInterval = () => {
  stopAutoRefresh()
  startAutoRefresh()
  ElMessage.success(`刷新间隔已设置为 ${refreshIntervalTime.value / 1000} 秒`)
}

// API calls
const fetchRideRealTimeData = async () => {
  if (!rideId.value) return

  try {
    loading.value = true
    const response = await rideTrafficApi.getRealTimeRideTraffic(rideId.value)
    currentRide.value = response || {}
    updateChart()
  } catch (error) {
    console.error('获取设施实时数据失败:', error)
    ElMessage.error('获取设施实时数据失败')
  } finally {
    loading.value = false
  }
}

const fetchHistoricalData = async () => {
  if (!rideId.value) return

  try {
    loading.value = true
    const params = {
      rideId: rideId.value,
      page: historyPage.value,
      pageSize: historyPageSize.value,
      // Add sorting parameter
      descending: searchFilters.value.sortOrder === 'desc',
    }

    // Add search filters
    if (searchFilters.value.keyword) {
      params.keyword = searchFilters.value.keyword
    }

    if (searchFilters.value.isCrowded !== null) {
      params.isCrowded = searchFilters.value.isCrowded
    }

    if (searchFilters.value.minVisitorCount !== null) {
      params.minVisitorCount = searchFilters.value.minVisitorCount
    }

    if (searchFilters.value.maxVisitorCount !== null) {
      params.maxVisitorCount = searchFilters.value.maxVisitorCount
    }

    if (searchFilters.value.minQueueLength !== null) {
      params.minQueueLength = searchFilters.value.minQueueLength
    }

    if (searchFilters.value.maxQueueLength !== null) {
      params.maxQueueLength = searchFilters.value.maxQueueLength
    }

    if (searchFilters.value.minWaitingTime !== null) {
      params.minWaitingTime = searchFilters.value.minWaitingTime
    }

    if (searchFilters.value.maxWaitingTime !== null) {
      params.maxWaitingTime = searchFilters.value.maxWaitingTime
    }

    if (searchFilters.value.recordTimeFrom) {
      params.recordTimeFrom = searchFilters.value.recordTimeFrom
    }

    if (searchFilters.value.recordTimeTo) {
      params.recordTimeTo = searchFilters.value.recordTimeTo
    }

    // Also check dateRange for backward compatibility
    if (dateRange.value && dateRange.value.length === 2) {
      if (!params.recordTimeFrom) params.recordTimeFrom = dateRange.value[0]
      if (!params.recordTimeTo) params.recordTimeTo = dateRange.value[1]
    }

    const response = await rideTrafficApi.searchRideTraffic(params)
    historicalData.value = response.rideTrafficStats || []
    historyTotal.value = response.totalCount || 0
    updateChart()
  } catch (error) {
    console.error('获取历史数据失败:', error)
    ElMessage.error('获取历史数据失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  searchFilters.value = {
    keyword: '',
    isCrowded: null,
    sortOrder: 'desc',
    minVisitorCount: null,
    maxVisitorCount: null,
    minQueueLength: null,
    maxQueueLength: null,
    minWaitingTime: null,
    maxWaitingTime: null,
    recordTimeFrom: null,
    recordTimeTo: null,
  }
  dateRange.value = []
  fetchHistoricalData()
}

const refreshChart = () => {
  updateChart()
}

const updateRideData = async () => {
  if (!rideId.value) return

  try {
    updating.value = true
    await rideTrafficApi.updateRideTraffic(rideId.value, {
      recordTime: new Date().toISOString(),
    })
    await fetchRideRealTimeData()
    ElMessage.success('数据更新成功')
  } catch (error) {
    console.error('更新设施数据失败:', error)
    ElMessage.error('更新设施数据失败')
  } finally {
    updating.value = false
  }
}

const exportHistoryData = () => {
  ElMessage.info('导出功能待实现')
}

const handleHistorySizeChange = (val) => {
  historyPageSize.value = val
  fetchHistoricalData()
}

const handleHistoryPageChange = (val) => {
  historyPage.value = val
  fetchHistoricalData()
}

// Chart methods
const initChart = () => {
  if (chartContainer.value) {
    chart.value = echarts.init(chartContainer.value)
    updateChart()
  }
}

const updateChart = () => {
  if (!chart.value || !historicalData.value.length) return

  // Always sort data by recordTime to ensure proper chronological order
  // regardless of how history data is sorted
  const sortedData = [...historicalData.value].sort(
    (a, b) => new Date(a.recordTime) - new Date(b.recordTime),
  )

  const xAxisData = sortedData.map((item) => {
    const date = new Date(item.recordTime)
    // Include both date and time in the label
    return date.toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  })

  const visitorData = sortedData.map((item) => item.visitorCount)
  const queueData = sortedData.map((item) => item.queueLength)
  const waitData = sortedData.map((item) => item.waitingTime)

  const option = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['游客数量', '队列长度', '等待时间'],
    },
    grid: {
      left: '8%',
      right: '8%',
      bottom: '20%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData,
      axisLabel: {
        rotate: 45,
        interval: 0,
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 12,
      },
    },
    series: [
      {
        name: '游客数量',
        type: 'line',
        data: visitorData,
        smooth: true,
        symbolSize: 6,
        lineStyle: {
          width: 2,
        },
      },
      {
        name: '队列长度',
        type: 'line',
        data: queueData,
        smooth: true,
        symbolSize: 6,
        lineStyle: {
          width: 2,
        },
      },
      {
        name: '等待时间',
        type: 'line',
        data: waitData,
        smooth: true,
        symbolSize: 6,
        lineStyle: {
          width: 2,
        },
      },
    ],
  }

  chart.value.setOption(option)
}

// Lifecycle
onMounted(() => {
  fetchRideRealTimeData()
  initChart()
  startOptimizedAutoRefresh()

  // Set default date range to last 7 days
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)
  dateRange.value = [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]

  // Set chart date range (can be same as history data or different)
  chartDateRange.value = [
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0],
  ]

  fetchHistoricalData()
})

onUnmounted(() => {
  if (chart.value) {
    chart.value.dispose()
  }
  stopAutoRefresh()
})

// Watch for route changes
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchRideRealTimeData()
      fetchHistoricalData()
    }
  },
)

// Watch for window resize to resize chart
window.addEventListener('resize', () => {
  if (chart.value) {
    chart.value.resize()
  }
})
</script>

<style scoped>
.ride-traffic-detail {
  width: 100%;
}

.ride-info-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-item {
  margin-bottom: 10px;
}

.info-label {
  display: inline-block;
  width: 100px;
  color: #606266;
}

.info-value {
  color: #303133;
  font-weight: 500;
}

.realtime-stats {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.normal-value {
  color: #67c23a;
}

.medium-value {
  color: #e6a23c;
}

.high-value {
  color: #f56c6c;
}

.chart-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.chart-controls {
  display: flex;
  align-items: center;
}

.history-table-card {
  border-radius: 8px;
}

.search-filters {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.filter-row {
  margin-bottom: 10px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.table-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

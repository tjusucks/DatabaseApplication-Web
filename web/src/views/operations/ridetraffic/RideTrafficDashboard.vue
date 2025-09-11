<template>
  <div class="page-container">
    <div class="page-header">
      <h2>游乐设施流量监控</h2>
      <p>实时监控园区内所有游乐设施的流量情况</p>
    </div>

    <div class="ride-traffic-dashboard">
      <!-- 控制面板 -->
      <div class="control-panel">
        <el-card class="control-card">
          <div class="control-header">
            <h3>控制面板</h3>
            <el-button 
              type="primary" 
              @click="updateAllRealTimeData"
              :loading="updatingAll"
              size="small"
            >
              <el-icon><Refresh /></el-icon>
              更新全部数据
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 实时数据概览 -->
      <el-row :gutter="20" class="stats-overview">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <span class="stat-label">总设施</span>
              <span class="stat-value">{{ stats.totalRides || 0 }}</span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <span class="stat-label">拥挤设施</span>
              <span class="stat-value" :class="{ 'high-crowd': stats.crowdedRides > 0 }">
                {{ stats.crowdedRides || 0 }}
              </span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <span class="stat-label">平均等待</span>
              <span class="stat-value">{{ stats.avgWaitingTime || 0 }}分钟</span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <span class="stat-label">最后更新</span>
              <span class="stat-value">{{ formatLastUpdate }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 实时流量表格 -->
      <el-card class="traffic-table-card">
        <template #header>
          <div class="table-header">
            <span>实时流量数据</span>
            <div class="table-controls">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索设施名称"
                clearable
                style="width: 200px; margin-right: 10px;"
                @keyup.enter="filterRides"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button @click="refreshData" :loading="loading" size="small">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>
        </template>

        <el-table 
          :data="filteredRides" 
          v-loading="loading"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="rideId" label="设施ID" width="80" />
          <el-table-column prop="rideName" label="设施名称" min-width="150">
            <template #default="{ row }">
              <el-link type="primary" @click="goToRideDetail(row.rideId)">
                {{ row.rideName }}
              </el-link>
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
          <el-table-column prop="waitingTime" label="等待时间(分钟)" width="120">
            <template #default="{ row }">
              <span :class="{ 'high-waiting': row.waitingTime > 30 }">
                {{ row.waitingTime }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="拥挤状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.isCrowded ? 'danger' : 'success'">
                {{ row.isCrowded ? '拥挤' : '正常' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="recordTime" label="记录时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.recordTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button 
                size="small" 
                type="primary" 
                @click="updateRideData(row.rideId)"
                :loading="updatingRideId === row.rideId"
              >
                更新
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="table-pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalRides"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as rideTrafficApi from '@/api/rideTraffic'

// Router
const router = useRouter()

// Reactive data
const rides = ref([])
const loading = ref(false)
const updatingAll = ref(false)
const updatingRideId = ref(null)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalRides = ref(0)
const lastUpdate = ref(new Date())

// Statistics
const stats = computed(() => {
  const totalRides = rides.value.length
  const crowdedRides = rides.value.filter(ride => ride.isCrowded).length
  const avgWaitingTime = totalRides > 0 
    ? Math.round(rides.value.reduce((sum, ride) => sum + ride.waitingTime, 0) / totalRides)
    : 0
  
  return {
    totalRides,
    crowdedRides,
    avgWaitingTime
  }
})

// Computed
const filteredRides = computed(() => {
  if (!searchKeyword.value) {
    return rides.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return rides.value.filter(ride => 
    ride.rideName.toLowerCase().includes(keyword)
  )
})

const formatLastUpdate = computed(() => {
  return formatDate(lastUpdate.value)
})

// Methods
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const getVisitorCountTagType = (count) => {
  if (count > 100) return 'danger'
  if (count > 50) return 'warning'
  return 'success'
}

const filterRides = () => {
  // Filtering is handled by computed property
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchRealTimeData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchRealTimeData()
}

// API calls
const fetchRealTimeData = async () => {
  try {
    loading.value = true
    const response = await rideTrafficApi.getAllRealTimeRideTraffic()
    rides.value = response || []
    totalRides.value = rides.value.length
    lastUpdate.value = new Date()
  } catch (error) {
    console.error('获取实时流量数据失败:', error)
    ElMessage.error('获取实时流量数据失败')
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  fetchRealTimeData()
}

const updateAllRealTimeData = async () => {
  try {
    updatingAll.value = true
    await rideTrafficApi.updateAllRideTraffic({
      recordTime: new Date().toISOString()
    })
    await fetchRealTimeData()
    ElMessage.success('全部数据更新成功')
  } catch (error) {
    console.error('更新全部数据失败:', error)
    ElMessage.error('更新全部数据失败')
  } finally {
    updatingAll.value = false
  }
}

const updateRideData = async (rideId) => {
  try {
    updatingRideId.value = rideId
    await rideTrafficApi.updateRideTraffic(rideId, {
      recordTime: new Date().toISOString()
    })
    await fetchRealTimeData()
    ElMessage.success('设施数据更新成功')
  } catch (error) {
    console.error('更新设施数据失败:', error)
    ElMessage.error('更新设施数据失败')
  } finally {
    updatingRideId.value = null
  }
}

const goToRideDetail = (rideId) => {
  router.push(`/operations/ridetraffic/${rideId}`)
}

// Lifecycle
onMounted(() => {
  fetchRealTimeData()
})

// Refresh data every 30 seconds
let refreshInterval = null
onMounted(() => {
  refreshInterval = setInterval(() => {
    fetchRealTimeData()
  }, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.ride-traffic-dashboard {
  width: 100%;
}

.control-panel {
  margin-bottom: 20px;
}

.control-card {
  border-radius: 8px;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-overview {
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

.high-crowd {
  color: #f56c6c;
}

.high-waiting {
  color: #f56c6c;
  font-weight: bold;
}

.traffic-table-card {
  border-radius: 8px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-controls {
  display: flex;
  align-items: center;
}

.table-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
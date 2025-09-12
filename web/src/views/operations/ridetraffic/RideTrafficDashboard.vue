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
            <div class="control-buttons">
              <el-button
                type="primary"
                @click="updateAllRealTimeData"
                :loading="updatingAll"
                size="small"
              >
                <el-icon><Refresh /></el-icon>
                更新全部数据
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
                style="width: 200px; margin-right: 10px"
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

        <el-table :data="filteredRides" v-loading="loading" stripe style="width: 100%">
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
              <el-tag 
                :type="getVisitorCountTagType(row.visitorCount)"
                :class="{
                  'flash-increase': getItemChangeType(row.rideId, 'visitorCount', row.visitorCount) === 'increase',
                  'flash-decrease': getItemChangeType(row.rideId, 'visitorCount', row.visitorCount) === 'decrease'
                }"
              >
                {{ row.visitorCount }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="queueLength" label="队列长度" width="100">
            <template #default="{ row }">
              <span 
                :class="{
                  'flash-increase': getItemChangeType(row.rideId, 'queueLength', row.queueLength) === 'increase',
                  'flash-decrease': getItemChangeType(row.rideId, 'queueLength', row.queueLength) === 'decrease'
                }"
              >
                {{ row.queueLength }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="waitingTime" label="等待时间(分钟)" width="120">
            <template #default="{ row }">
              <span 
                :class="{
                  'high-waiting': row.waitingTime > 30,
                  'flash-increase': getItemChangeType(row.rideId, 'waitingTime', row.waitingTime) === 'increase',
                  'flash-decrease': getItemChangeType(row.rideId, 'waitingTime', row.waitingTime) === 'decrease'
                }"
              >
                {{ row.waitingTime }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="拥挤状态" width="100">
            <template #default="{ row }">
              <el-tag 
                :type="row.isCrowded ? 'danger' : 'success'"
                :class="{
                  'flash-increase': getItemChangeType(row.rideId, 'isCrowded', row.isCrowded) === 'increase',
                  'flash-decrease': getItemChangeType(row.rideId, 'isCrowded', row.isCrowded) === 'decrease'
                }"
              >
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

// Store item-specific change tracking
const itemChanges = ref({})

// Statistics
const stats = computed(() => {
  const totalRides = rides.value.length
  const crowdedRides = rides.value.filter((ride) => ride.isCrowded).length
  const avgWaitingTime =
    totalRides > 0
      ? Math.round(rides.value.reduce((sum, ride) => sum + ride.waitingTime, 0) / totalRides)
      : 0

  return {
    totalRides,
    crowdedRides,
    avgWaitingTime,
  }
})

// Computed
const filteredRides = computed(() => {
  if (!searchKeyword.value) {
    return rides.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return rides.value.filter((ride) => ride.rideName.toLowerCase().includes(keyword))
})

const formatLastUpdate = computed(() => {
  return formatDate(lastUpdate.value)
})

// Methods
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

// 检查项目是否有变化用于动画
const hasItemChanges = (rideId, field) => {
  const changes = itemChanges.value[rideId]
  if (!changes) return false
  if (field) {
    return changes[field] !== undefined
  }
  return true
}

// 获取变化类型（用于颜色动画）
const getItemChangeType = (rideId, field, currentValue) => {
  const changes = itemChanges.value[rideId]
  if (!changes || !changes[field]) return ''
  
  const change = changes[field]
  if (change.from < change.to) return 'increase'
  if (change.from > change.to) return 'decrease'
  return ''
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
      recordTime: new Date().toISOString(),
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
      recordTime: new Date().toISOString(),
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

// 实时更新相关
const refreshInterval = ref(null)
const isAutoRefresh = ref(false)
const refreshIntervalTime = ref(1000) // 1秒刷新一次

// Lifecycle
onMounted(() => {
  fetchRealTimeData()
  startOptimizedAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})

// 实时更新方法
const startAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }

  if (isAutoRefresh.value) {
    refreshInterval.value = setInterval(() => {
      if (!loading.value) {
        fetchRealTimeData()
      }
    }, refreshIntervalTime.value)
  }
}

// 防抖标志
const isUpdating = ref(false)

// 实时更新方法，使用增量更新避免UI闪烁
const updateRealTimeStats = async () => {
  if (!isAutoRefresh.value || loading.value || isUpdating.value) return

  isUpdating.value = true
  try {
    const response = await rideTrafficApi.getAllRealTimeRideTraffic()
    if (response && Array.isArray(response)) {
      // 增量更新方式，避免整个数组替换导致的闪烁
      const newRides = response
      const currentRides = rides.value
      
      // 创建一个新的数组来存储更新后的数据
      const updatedRides = []
      
      // 处理每个新数据项
      for (let i = 0; i < newRides.length; i++) {
        const newRide = newRides[i]
        
        // 查找对应的当前项
        const currentIndex = currentRides.findIndex(ride => ride.rideId === newRide.rideId)
        const currentRide = currentIndex >= 0 ? currentRides[currentIndex] : null
        
        if (currentRide) {
          // 检查哪些字段发生了变化
          const changes = {}
          let hasChanges = false
          
          Object.keys(newRide).forEach(key => {
            if (currentRide[key] !== newRide[key]) {
              changes[key] = {
                from: currentRide[key],
                to: newRide[key]
              }
              hasChanges = true
            }
          })
          
          // 如果有变化，更新当前项并标记变化
          if (hasChanges) {
            // 更新当前项的值
            Object.assign(currentRide, newRide)
            
            // 记录变化用于动画
            itemChanges.value[newRide.rideId] = {
              ...changes,
              timestamp: Date.now()
            }
            
            // 清除变化标记（1秒后）
            setTimeout(() => {
              if (itemChanges.value[newRide.rideId]) {
                delete itemChanges.value[newRide.rideId]
              }
            }, 1000)
            
            updatedRides.push(currentRide)
          } else {
            // 没有变化，直接使用当前项
            updatedRides.push(currentRide)
          }
        } else {
          // 新增项
          itemChanges.value[newRide.rideId] = {
            isNew: true,
            timestamp: Date.now()
          }
          
          setTimeout(() => {
            if (itemChanges.value[newRide.rideId]) {
              delete itemChanges.value[newRide.rideId]
            }
          }, 1000)
          
          updatedRides.push({...newRide})
        }
      }
      
      // 更新引用而不是替换整个数组
      rides.value.splice(0, rides.value.length, ...updatedRides)
      
      totalRides.value = newRides.length
      lastUpdate.value = new Date()
    }
  } catch (error) {
    console.error('获取实时流量数据失败:', error)
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
      updateRealTimeStats()
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

.control-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
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

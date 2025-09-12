<template>
  <div class="facility-monitoring">
    <!-- 页面头部 -->
    <div class="monitoring-header">
      <div class="header-content">
        <div class="header-left">
          <div class="status-indicator">
            <div class="pulse-dot"></div>
            <span class="status-text">实时监控中</span>
          </div>
          <h1 class="page-title">设施实时监控</h1>
          <p class="page-subtitle">智能感知 · 精准预警 · 安全保障</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="fetchMonitoringData" class="refresh-btn">
            <span class="refresh-icon">🔄</span>
            刷新数据
          </el-button>
          <div class="last-update">最后更新: {{ lastUpdateTime }}</div>
        </div>
      </div>

      <!-- 状态卡片组 -->
      <div class="status-cards">
        <div class="status-card status-normal">
          <div class="card-icon">✅</div>
          <div class="card-content">
            <div class="card-title">正常运行</div>
            <div class="card-value">{{ statusCounts.normal }}</div>
          </div>
          <div class="card-wave"></div>
        </div>

        <div class="status-card status-warning">
          <div class="card-icon">⚠️</div>
          <div class="card-content">
            <div class="card-title">预警状态</div>
            <div class="card-value">{{ statusCounts.warning }}</div>
          </div>
          <div class="card-wave"></div>
        </div>

        <div class="status-card status-danger">
          <div class="card-icon">🚨</div>
          <div class="card-content">
            <div class="card-title">异常状态</div>
            <div class="card-value">{{ statusCounts.danger }}</div>
          </div>
          <div class="card-wave"></div>
        </div>

        <div class="status-card status-offline">
          <div class="card-icon">🔌</div>
          <div class="card-content">
            <div class="card-title">离线设备</div>
            <div class="card-value">{{ statusCounts.offline }}</div>
          </div>
          <div class="card-wave"></div>
        </div>
      </div>
    </div>

    <!-- 主要监控区域 -->
    <div class="monitoring-content">
      <!-- 实时数据图表区 -->
      <el-row :gutter="20" class="charts-row">
        <el-col :span="12">
          <div class="chart-container temperature-chart">
            <div class="chart-header">
              <div class="chart-title">
                <div class="title-icon">🌡️</div>
                <span>温度监控</span>
                <div class="real-time-badge">实时</div>
              </div>
              <div class="chart-value">
                <span class="current-value">{{ currentData.temperature }}°C</span>
                <span class="trend-indicator" :class="temperatureTrend">
                  {{ temperatureTrend === 'up' ? '📈' : temperatureTrend === 'down' ? '📉' : '➡️' }}
                </span>
              </div>
            </div>
            <div ref="temperatureChart" class="chart"></div>
            <div class="chart-footer">
              <div class="threshold-info">
                <span class="threshold-label">安全范围:</span>
                <span class="threshold-range">18°C - 35°C</span>
              </div>
            </div>
          </div>
        </el-col>

        <el-col :span="12">
          <div class="chart-container flow-chart">
            <div class="chart-header">
              <div class="chart-title">
                <div class="title-icon">💧</div>
                <span>流量监控</span>
                <div class="real-time-badge">实时</div>
              </div>
              <div class="chart-value">
                <span class="current-value">{{ currentData.flowRate }} L/min</span>
                <span class="trend-indicator" :class="flowTrend">
                  {{ flowTrend === 'up' ? '📈' : flowTrend === 'down' ? '📉' : '➡️' }}
                </span>
              </div>
            </div>
            <div ref="flowRateChart" class="chart"></div>
            <div class="chart-footer">
              <div class="threshold-info">
                <span class="threshold-label">标准范围:</span>
                <span class="threshold-range">50-200 L/min</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 第二行图表 -->
      <el-row :gutter="20" class="charts-row">
        <el-col :span="8">
          <div class="chart-container pressure-chart">
            <div class="chart-header">
              <div class="chart-title">
                <div class="title-icon">⚡</div>
                <span>压力监控</span>
              </div>
              <div class="chart-value">
                <span class="current-value">{{ currentData.pressure }} kPa</span>
              </div>
            </div>
            <div ref="pressureChart" class="chart small-chart"></div>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="chart-container vibration-chart">
            <div class="chart-header">
              <div class="chart-title">
                <div class="title-icon">📳</div>
                <span>振动监控</span>
              </div>
              <div class="chart-value">
                <span class="current-value">{{ currentData.vibration }} Hz</span>
              </div>
            </div>
            <div ref="vibrationChart" class="chart small-chart"></div>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="chart-container power-chart">
            <div class="chart-header">
              <div class="chart-title">
                <div class="title-icon">🔋</div>
                <span>功耗监控</span>
              </div>
              <div class="chart-value">
                <span class="current-value">{{ currentData.power }} kW</span>
              </div>
            </div>
            <div ref="powerChart" class="chart small-chart"></div>
          </div>
        </el-col>
      </el-row>

      <!-- 设备列表和实时日志 -->
      <el-row :gutter="20" class="bottom-row">
        <el-col :span="16">
          <div class="device-list-container">
            <div class="section-title">
              <span class="title-text">设备状态列表</span>
              <div class="device-count">{{ devices.length }} 台设备</div>
            </div>

            <div class="device-grid">
              <div
                v-for="device in devices"
                :key="device.id"
                :class="['device-item', `status-${device.status}`]"
                @click="selectDevice(device)"
              >
                <div class="device-info">
                  <div class="device-name">{{ device.name }}</div>
                  <div class="device-id">ID: {{ device.id }}</div>
                </div>
                <div class="device-status">
                  <div class="status-dot"></div>
                  <span class="status-text">{{ getStatusText(device.status) }}</span>
                </div>
                <div class="device-metrics">
                  <div class="metric">
                    <span class="metric-label">温度:</span>
                    <span class="metric-value">{{ device.temperature }}°C</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">运行:</span>
                    <span class="metric-value">{{ device.runtime }}h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="log-container">
            <div class="section-title">
              <span class="title-text">实时日志</span>
              <div class="log-controls">
                <el-button size="small" @click="clearLogs">清空</el-button>
                <el-button
                  size="small"
                  @click="pauseLogs"
                  :type="logsPaused ? 'success' : 'warning'"
                >
                  {{ logsPaused ? '继续' : '暂停' }}
                </el-button>
              </div>
            </div>

            <div class="log-list" ref="logList">
              <div v-for="log in logs" :key="log.id" :class="['log-item', `log-${log.type}`]">
                <div class="log-time">{{ formatTime(log.timestamp) }}</div>
                <div class="log-content">
                  <span class="log-level">{{ log.level }}</span>
                  <span class="log-message">{{ log.message }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useRoute } from 'vue-router'
import { searchRides, getRideStats } from '@/api/facilities'

const route = useRoute()

// 图表引用
const temperatureChart = ref(null)
const flowRateChart = ref(null)
const pressureChart = ref(null)
const vibrationChart = ref(null)
const powerChart = ref(null)
const logList = ref(null)

// 图表实例
let temperatureChartInstance = null
let flowRateChartInstance = null
let pressureChartInstance = null
let vibrationChartInstance = null
let powerChartInstance = null

// 响应式数据
const lastUpdateTime = ref(new Date().toLocaleTimeString())
const logsPaused = ref(false)

const statusCounts = ref({
  normal: 8,
  warning: 2,
  danger: 1,
  offline: 0,
})

const currentData = ref({
  temperature: 23.5,
  flowRate: 125,
  pressure: 150,
  vibration: 2.3,
  power: 45.2,
})

const temperatureTrend = ref('up')
const flowTrend = ref('stable')

const devices = ref([
  { id: 'DEV001', name: '过山车主控', status: 'normal', temperature: 23.5, runtime: 156 },
  { id: 'DEV002', name: '摩天轮驱动', status: 'normal', temperature: 25.1, runtime: 203 },
  { id: 'DEV003', name: '海盗船摆臂', status: 'warning', temperature: 31.2, runtime: 89 },
  { id: 'DEV004', name: '旋转木马', status: 'normal', temperature: 22.8, runtime: 178 },
  { id: 'DEV005', name: '激流勇进', status: 'danger', temperature: 38.5, runtime: 45 },
  { id: 'DEV006', name: '碰碰车电源', status: 'normal', temperature: 24.3, runtime: 134 },
])

const logs = ref([
  {
    id: 1,
    timestamp: Date.now() - 5000,
    level: 'INFO',
    type: 'info',
    message: '系统启动完成，开始监控',
  },
  {
    id: 2,
    timestamp: Date.now() - 3000,
    level: 'WARN',
    type: 'warning',
    message: 'DEV003 温度超过预警线',
  },
  {
    id: 3,
    timestamp: Date.now() - 1000,
    level: 'ERROR',
    type: 'error',
    message: 'DEV005 温度异常，需要检查',
  },
])

// 定时器
let monitoringInterval = null
let logInterval = null

const initCharts = () => {
  // 温度图表
  temperatureChartInstance = echarts.init(temperatureChart.value)

  // 流量图表
  flowRateChartInstance = echarts.init(flowRateChart.value)

  // 压力图表
  pressureChartInstance = echarts.init(pressureChart.value)

  // 振动图表
  vibrationChartInstance = echarts.init(vibrationChart.value)

  // 功耗图表
  powerChartInstance = echarts.init(powerChart.value)

  // 设置图表主题色
  const theme = {
    textStyle: { color: '#fff' },
    backgroundColor: 'transparent',
  }

  // 初始化所有图表
  updateCharts({
    timestamps: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'],
    temperatures: [22, 23, 24, 23.5, 25, 24.2, 23.5],
    flowRates: [120, 125, 130, 125, 135, 128, 125],
    pressures: [145, 150, 148, 152, 150, 149, 150],
    vibrations: [2.1, 2.3, 2.2, 2.4, 2.3, 2.5, 2.3],
    powers: [42, 45, 43, 46, 45.2, 44, 45.2],
  })
}

const updateCharts = (data) => {
  const commonConfig = {
    backgroundColor: 'transparent',
    textStyle: { color: '#fff' },
    grid: {
      top: 20,
      right: 20,
      bottom: 40,
      left: 40,
      containLabel: true,
    },
  }

  // 温度图表配置
  const temperatureOption = {
    ...commonConfig,
    xAxis: {
      type: 'category',
      data: data.timestamps,
      axisLine: { lineStyle: { color: '#64b5f6' } },
      axisLabel: { color: '#fff' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#64b5f6' } },
      axisLabel: { color: '#fff' },
    },
    series: [
      {
        data: data.temperatures,
        type: 'line',
        smooth: true,
        lineStyle: { color: '#ff6b6b', width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 107, 107, 0.3)' },
              { offset: 1, color: 'rgba(255, 107, 107, 0)' },
            ],
          },
        },
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#ff6b6b' },
      },
    ],
  }

  // 流量图表配置
  const flowRateOption = {
    ...commonConfig,
    xAxis: {
      type: 'category',
      data: data.timestamps,
      axisLine: { lineStyle: { color: '#4ecdc4' } },
      axisLabel: { color: '#fff' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#4ecdc4' } },
      axisLabel: { color: '#fff' },
    },
    series: [
      {
        data: data.flowRates,
        type: 'line',
        smooth: true,
        lineStyle: { color: '#4ecdc4', width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(78, 205, 196, 0.3)' },
              { offset: 1, color: 'rgba(78, 205, 196, 0)' },
            ],
          },
        },
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#4ecdc4' },
      },
    ],
  }

  // 压力图表（仪表盘）
  const pressureOption = {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        radius: '80%',
        axisLine: {
          lineStyle: {
            width: 20,
            color: [
              [0.3, '#ff6b6b'],
              [0.7, '#ffa726'],
              [1, '#4ecdc4'],
            ],
          },
        },
        pointer: { itemStyle: { color: '#fff' } },
        axisTick: { distance: -20, lineStyle: { color: '#fff', width: 1 } },
        splitLine: { distance: -20, lineStyle: { color: '#fff', width: 2 } },
        axisLabel: { color: '#fff', distance: -40 },
        detail: {
          valueAnimation: true,
          formatter: '{value} kPa',
          color: '#fff',
          fontSize: 14,
        },
        data: [{ value: currentData.value.pressure, name: '压力' }],
      },
    ],
  }

  // 振动图表（波形）
  const vibrationOption = {
    ...commonConfig,
    xAxis: { type: 'category', data: data.timestamps, axisLabel: { color: '#fff' } },
    yAxis: { type: 'value', axisLabel: { color: '#fff' } },
    series: [
      {
        data: data.vibrations,
        type: 'bar',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#ffa726' },
              { offset: 1, color: '#ff8a65' },
            ],
          },
        },
        barWidth: '60%',
      },
    ],
  }

  // 功耗图表
  const powerOption = {
    ...commonConfig,
    xAxis: { type: 'category', data: data.timestamps, axisLabel: { color: '#fff' } },
    yAxis: { type: 'value', axisLabel: { color: '#fff' } },
    series: [
      {
        data: data.powers,
        type: 'line',
        smooth: true,
        lineStyle: { color: '#9c27b0', width: 2 },
        symbol: 'diamond',
        symbolSize: 8,
        itemStyle: { color: '#9c27b0' },
      },
    ],
  }

  temperatureChartInstance.setOption(temperatureOption)
  flowRateChartInstance.setOption(flowRateOption)
  pressureChartInstance.setOption(pressureOption)
  vibrationChartInstance.setOption(vibrationOption)
  powerChartInstance.setOption(powerOption)
}

const fetchMonitoringData = async () => {
  try {
    const data = await getRideStats({
      startDate: null,
      endDate: null,
    })

    // 模拟实时数据更新
    const now = new Date()
    const timeLabels = []
    for (let i = 6; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5 * 60 * 1000)
      timeLabels.push(time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))
    }

    updateCharts({
      timestamps: timeLabels,
      temperatures: Array.from({ length: 7 }, () => Math.random() * 10 + 20),
      flowRates: Array.from({ length: 7 }, () => Math.random() * 50 + 100),
      pressures: Array.from({ length: 7 }, () => Math.random() * 20 + 140),
      vibrations: Array.from({ length: 7 }, () => Math.random() * 2 + 1),
      powers: Array.from({ length: 7 }, () => Math.random() * 10 + 40),
    })

    // 更新当前数据
    currentData.value = {
      temperature: (Math.random() * 10 + 20).toFixed(1),
      flowRate: Math.floor(Math.random() * 50 + 100),
      pressure: Math.floor(Math.random() * 20 + 140),
      vibration: (Math.random() * 2 + 1).toFixed(1),
      power: (Math.random() * 10 + 40).toFixed(1),
    }

    lastUpdateTime.value = new Date().toLocaleTimeString()
  } catch (error) {
    console.error('获取监控数据失败:', error)
  }
}

const selectDevice = (device) => {
  console.log('选择设备:', device)
}

const getStatusText = (status) => {
  const statusMap = {
    normal: '正常',
    warning: '预警',
    danger: '异常',
    offline: '离线',
  }
  return statusMap[status] || '未知'
}

const clearLogs = () => {
  logs.value = []
}

const pauseLogs = () => {
  logsPaused.value = !logsPaused.value
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

const addRandomLog = () => {
  if (logsPaused.value) return

  const logTypes = ['info', 'warning', 'error']
  const levels = ['INFO', 'WARN', 'ERROR']
  const messages = [
    '系统运行正常',
    '温度传感器数据更新',
    '设备状态检查完成',
    '流量监控正常',
    '压力值略有波动',
    '振动频率在正常范围内',
  ]

  const type = logTypes[Math.floor(Math.random() * logTypes.length)]
  const newLog = {
    id: Date.now() + Math.random(),
    timestamp: Date.now(),
    level: levels[logTypes.indexOf(type)],
    type,
    message: messages[Math.floor(Math.random() * messages.length)],
  }

  logs.value.unshift(newLog)
  if (logs.value.length > 50) {
    logs.value.pop()
  }

  nextTick(() => {
    if (logList.value) {
      logList.value.scrollTop = 0
    }
  })
}

onMounted(() => {
  initCharts()
  fetchMonitoringData()

  // 启动定时刷新
  monitoringInterval = setInterval(fetchMonitoringData, 30000) // 30秒刷新一次
  logInterval = setInterval(addRandomLog, 5000) // 5秒添加一条日志

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    temperatureChartInstance?.resize()
    flowRateChartInstance?.resize()
    pressureChartInstance?.resize()
    vibrationChartInstance?.resize()
    powerChartInstance?.resize()
  })
})

onUnmounted(() => {
  if (monitoringInterval) clearInterval(monitoringInterval)
  if (logInterval) clearInterval(logInterval)

  temperatureChartInstance?.dispose()
  flowRateChartInstance?.dispose()
  pressureChartInstance?.dispose()
  vibrationChartInstance?.dispose()
  powerChartInstance?.dispose()
})
</script>

<style scoped>
.facility-monitoring {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #667eea 100%);
  min-height: 100vh;
  padding: 20px;
  color: #fff;
}

/* 页面头部样式 */
.monitoring-header {
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-left .status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.pulse-dot {
  width: 12px;
  height: 12px;
  background: #4caf50;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.status-text {
  color: #4caf50;
  font-weight: bold;
}

.page-title {
  font-size: 2.5em;
  font-weight: bold;
  margin: 0 0 8px 0;
  background: linear-gradient(45deg, #fff, #64b5f6, #42a5f5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1em;
  margin: 0;
}

.header-actions {
  text-align: right;
}

.refresh-btn {
  background: linear-gradient(45deg, #4caf50, #45a049);
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 1em;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.refresh-icon {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.last-update {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9em;
}

/* 状态卡片 */
.status-card {
  position: relative;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.status-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.status-card .card-icon {
  font-size: 2em;
}

.status-card .card-content {
  flex: 1;
}

.card-title {
  font-size: 1em;
  opacity: 0.8;
}

.card-value {
  font-size: 1.8em;
  font-weight: bold;
}

.card-wave {
  position: absolute;
  bottom: -20%;
  left: 0;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2), transparent 70%);
  animation: wave 6s linear infinite;
}

@keyframes wave {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

/* 不同状态色彩 */
.status-normal {
  border-left: 5px solid #4caf50;
}
.status-warning {
  border-left: 5px solid #ffc107;
}
.status-danger {
  border-left: 5px solid #f44336;
}
.status-offline {
  border-left: 5px solid #9e9e9e;
}

/* 图表容器 */
.chart-container {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  padding: 15px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
}

.title-icon {
  font-size: 1.2em;
}

.real-time-badge {
  background: #ff6b6b;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.8em;
  font-weight: bold;
}

.chart-value {
  font-size: 1.2em;
  display: flex;
  align-items: center;
  gap: 5px;
}

.trend-indicator.up {
  color: #4caf50;
}
.trend-indicator.down {
  color: #f44336;
}
.trend-indicator.stable {
  color: #ffc107;
}

.chart-footer {
  margin-top: 8px;
  font-size: 0.85em;
  color: rgba(255, 255, 255, 0.7);
}

/* 设备列表 */
.device-list-container {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.device-item {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  padding: 12px;
  transition:
    transform 0.2s,
    background 0.2s;
  cursor: pointer;
}

.device-item:hover {
  transform: translateY(-3px);
  background: rgba(0, 0, 0, 0.35);
}

.device-info {
  font-weight: bold;
}

.device-status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 6px 0;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-normal .status-dot {
  background: #4caf50;
}
.status-warning .status-dot {
  background: #ffc107;
}
.status-danger .status-dot {
  background: #f44336;
}
.status-offline .status-dot {
  background: #9e9e9e;
}

.device-metrics {
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
  opacity: 0.9;
}

/* 实时日志 */
.log-container {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.log-list {
  flex: 1;
  overflow-y: auto;
  margin-top: 10px;
  max-height: 400px;
}

.log-item {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 8px;
  font-size: 0.9em;
}

.log-info {
  border-left: 4px solid #4caf50;
}
.log-warning {
  border-left: 4px solid #ffc107;
}
.log-error {
  border-left: 4px solid #f44336;
}

.log-time {
  font-size: 0.8em;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.log-level {
  font-weight: bold;
  margin-right: 8px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 1.1em;
  margin-bottom: 10px;
}
</style>

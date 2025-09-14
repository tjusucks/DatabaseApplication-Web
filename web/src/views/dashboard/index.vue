<template>
  <div class="dashboard">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <el-card class="welcome-card">
        <div class="welcome-content">
          <div class="welcome-text">
            <h2>欢迎回来，{{ userStore.userName }}！</h2>
            <p>今天是 {{ currentDate }}，祝您工作愉快！</p>
          </div>
          <div class="welcome-avatar">
            <el-avatar :size="60" :src="userStore.avatar">
              <el-icon size="30"><User /></el-icon>
            </el-avatar>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 数据统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6" v-for="stat in statsData" :key="stat.title">
          <el-card class="stat-card" :class="stat.type">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon :size="32">
                  <component :is="stat.icon" />
                </el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-title">{{ stat.title }}</div>
                <div class="stat-change" :class="stat.trend">
                  <el-icon size="12">
                    <ArrowUp v-if="stat.trend === 'up'" />
                    <ArrowDown v-else />
                  </el-icon>
                  {{ stat.change }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图表和快捷操作 -->
    <el-row :gutter="20" class="content-section">
      <!-- 地图区域 -->
      <el-col :xs="24" :lg="16" class="map-column">
        <div class="map-container">
          <img
            src="@/assets/map.jpeg"
            alt="游乐园地图"
            class="park-map-image"
            @error="handleImageError"
          />
        </div>
      </el-col>

      <!-- 快捷操作 -->
      <el-col :xs="24" :lg="8">
        <el-card title="快捷操作" class="quick-actions-card">
          <div class="quick-actions">
            <el-button
              v-for="action in quickActions"
              :key="action.name"
              :type="action.type"
              :icon="action.icon"
              @click="handleQuickAction(action)"
              class="action-btn"
            >
              {{ action.name }}
            </el-button>
          </div>
        </el-card>

        <!-- 最近活动 -->
        <el-card title="最近活动" class="recent-activities-card">
          <div class="activities">
            <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
              <div class="activity-icon">
                <el-icon :color="activity.color">
                  <component :is="activity.icon" />
                </el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

// 当前日期
const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
})

// 统计数据
const statsData = ref([
  {
    title: '今日游客',
    value: '1,234',
    change: '+12.5%',
    trend: 'up',
    icon: 'User',
    type: 'primary',
  },
  {
    title: '今日收入',
    value: '¥45,678',
    change: '+8.2%',
    trend: 'up',
    icon: 'Money',
    type: 'success',
  },
  {
    title: '设施运行',
    value: '28/30',
    change: '-2',
    trend: 'down',
    icon: 'OfficeBuilding',
    type: 'warning',
  },
  {
    title: '员工在岗',
    value: '156',
    change: '+3',
    trend: 'up',
    icon: 'Avatar',
    type: 'info',
  },
])

// 快捷操作
const quickActions = computed(() => {
  const actions = []

  if (userStore.hasAnyRole(['Admin', 'Manager'])) {
    actions.push({
      name: '门票销售',
      type: 'primary',
      icon: 'Ticket',
      path: '/tickets/sales',
    })
  }

  if (userStore.hasAnyRole(['Admin', 'Employee'])) {
    actions.push({
      name: '游客管理',
      type: 'success',
      icon: 'User',
      path: '/visitors/list',
    })
  }

  if (userStore.hasAnyRole(['Admin', 'Manager'])) {
    actions.push({
      name: '设施监控',
      type: 'warning',
      icon: 'Monitor',
      path: '/facilities/monitoring',
    })
  }

  if (userStore.hasAnyRole(['Admin', 'Manager'])) {
    actions.push({
      name: '财务报表',
      type: 'info',
      icon: 'Document',
      path: '/finance/reports',
    })
  }

  return actions
})

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    title: '新增游客预订',
    time: '5分钟前',
    icon: 'Calendar',
    color: '#409EFF',
  },
  {
    id: 2,
    title: '设施维护完成',
    time: '15分钟前',
    icon: 'Tools',
    color: '#67C23A',
  },
  {
    id: 3,
    title: '员工考勤异常',
    time: '30分钟前',
    icon: 'Warning',
    color: '#E6A23C',
  },
  {
    id: 4,
    title: '系统备份完成',
    time: '1小时前',
    icon: 'FolderOpened',
    color: '#909399',
  },
])

// 处理快捷操作
const handleQuickAction = (action) => {
  if (action.path) {
    router.push(action.path)
  } else {
    ElMessage.info(`${action.name}功能开发中...`)
  }
}

// 组件挂载时获取数据
onMounted(() => {
  // 这里可以调用 API 获取实际的统计数据
  console.log('Dashboard mounted, loading data...')
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.welcome-section {
  margin-bottom: 20px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.welcome-card :deep(.el-card__body) {
  padding: 30px;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.welcome-text p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.stats-section {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-card.primary {
  border-left: 4px solid #409eff;
}

.stat-card.success {
  border-left: 4px solid #67c23a;
}

.stat-card.warning {
  border-left: 4px solid #e6a23c;
}

.stat-card.info {
  border-left: 4px solid #909399;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  margin-right: 16px;
  color: #409eff;
}

.stat-card.success .stat-icon {
  color: #67c23a;
}

.stat-card.warning .stat-icon {
  color: #e6a23c;
}

.stat-card.info .stat-icon {
  color: #909399;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.stat-change {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.stat-change.up {
  color: #67c23a;
}

.stat-change.down {
  color: #f56c6c;
}

.content-section {
  margin-bottom: 20px;
}

.map-column {
  margin-bottom: 20px;
}

.map-container {
  width: 100%;
  height: 400px; /* 设置固定高度以充分利用空间 */
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.park-map-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  object-fit: cover; /* 改为cover以填满容器 */
}

.park-map-image:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
}

.quick-actions-card {
  margin-bottom: 20px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  width: 100%;
  height: 40px;
  justify-content: flex-start;
}

.recent-activities-card {
  height: fit-content;
}

.activities {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  margin-right: 12px;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .stat-icon {
    margin-right: 0;
  }

  .map-container {
    height: 300px; /* 移动端稍微降低高度 */
    padding: 15px;
  }
}

/* 大屏幕优化 */
@media (min-width: 1200px) {
  .map-container {
    height: 450px; /* 大屏幕增加高度 */
  }
}
</style>

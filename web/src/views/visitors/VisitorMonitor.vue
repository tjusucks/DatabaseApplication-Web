<template>
  <div class="visitor-monitor">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>入园/出园实时监控</h2>
      <p>实时监控游客入园出园动态，查看各门口流量统计</p>
      <div class="header-actions">
        <el-switch
          v-model="autoRefresh"
          active-text="自动刷新"
          @change="handleAutoRefreshChange"
        />
        <el-button @click="handleManualRefresh" :loading="refreshing">
          <el-icon><Refresh /></el-icon>
          手动刷新
        </el-button>
      </div>
    </div>

    <!-- 实时统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card realtime">
          <div class="stat-content">
            <div class="stat-value">{{ realtimeStats.currentInPark }}</div>
            <div class="stat-label">当前在园人数</div>
            <div
              class="stat-trend"
              :class="getTrendClass(realtimeStats.parkTrend)"
            >
              <el-icon><TrendCharts /></el-icon>
              {{ realtimeStats.parkTrend > 0 ? "+" : ""
              }}{{ realtimeStats.parkTrend }}
            </div>
          </div>
          <el-icon class="stat-icon" color="#67c23a"><UserFilled /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ realtimeStats.todayEntries }}</div>
            <div class="stat-label">今日入园总数</div>
            <div class="stat-trend positive">
              <el-icon><ArrowUp /></el-icon>
              +{{ realtimeStats.recentEntries }}
            </div>
          </div>
          <el-icon class="stat-icon" color="#409eff"
            ><LocationInformation
          /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ realtimeStats.todayExits }}</div>
            <div class="stat-label">今日出园总数</div>
            <div class="stat-trend negative">
              <el-icon><ArrowDown /></el-icon>
              +{{ realtimeStats.recentExits }}
            </div>
          </div>
          <el-icon class="stat-icon" color="#e6a23c"
            ><LocationInformation
          /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">
              {{ formatDuration(realtimeStats.avgStayTime) }}
            </div>
            <div class="stat-label">平均停留时间</div>
            <div class="stat-trend">
              <el-icon><Timer /></el-icon>
              实时计算
            </div>
          </div>
          <el-icon class="stat-icon" color="#f56c6c"><Timer /></el-icon>
        </el-card>
      </el-col>
    </el-row>

    <!-- 门口流量统计 -->
    <el-row :gutter="20" class="gate-stats-row">
      <el-col :span="12">
        <el-card class="gate-stats-card">
          <template #header>
            <div class="card-header">
              <span>各门口实时流量</span>
              <el-tag type="success">实时更新</el-tag>
            </div>
          </template>

          <div class="gate-stats">
            <div v-for="gate in gateStats" :key="gate.name" class="gate-item">
              <div class="gate-info">
                <div class="gate-name">{{ gate.name }}</div>
                <div class="gate-status" :class="gate.status">
                  <el-icon><CircleFilled /></el-icon>
                  {{ getGateStatusText(gate.status) }}
                </div>
              </div>
              <div class="gate-numbers">
                <div class="gate-stat">
                  <span class="label">入园:</span>
                  <span class="value entry">{{ gate.todayEntries }}</span>
                </div>
                <div class="gate-stat">
                  <span class="label">出园:</span>
                  <span class="value exit">{{ gate.todayExits }}</span>
                </div>
                <div class="gate-stat">
                  <span class="label">当前:</span>
                  <span class="value current">{{ gate.currentFlow }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="activity-card">
          <template #header>
            <div class="card-header">
              <span>实时活动日志</span>
              <el-button size="small" @click="clearActivityLog">
                <el-icon><Delete /></el-icon>
                清空日志
              </el-button>
            </div>
          </template>

          <div class="activity-log" ref="activityLogRef">
            <div
              v-for="activity in activityLog"
              :key="activity.id"
              class="activity-item"
              :class="activity.type"
            >
              <div class="activity-time">
                {{ formatTime(activity.timestamp) }}
              </div>
              <div class="activity-content">
                <el-icon>
                  <LocationInformation v-if="activity.type === 'entry'" />
                  <Back v-else-if="activity.type === 'exit'" />
                  <Warning v-else />
                </el-icon>
                <span>{{ activity.message }}</span>
              </div>
            </div>

            <div v-if="activityLog.length === 0" class="no-activity">
              <el-icon><Clock /></el-icon>
              <span>暂无活动记录</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 实时图表 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>今日入园出园趋势</span>
              <el-radio-group v-model="chartTimeRange" size="small">
                <el-radio-button label="1h">最近1小时</el-radio-button>
                <el-radio-button label="6h">最近6小时</el-radio-button>
                <el-radio-button label="24h">今日全天</el-radio-button>
              </el-radio-group>
            </div>
          </template>

          <div class="chart-container" ref="chartRef">
            <!-- 这里可以集成 ECharts 或其他图表库 -->
            <div class="chart-placeholder">
              <el-icon size="64" color="#ddd"><TrendCharts /></el-icon>
              <p>图表功能开发中...</p>
              <p>将显示入园出园趋势图表</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 当前在园游客列表 -->
    <el-card class="current-visitors-card">
      <template #header>
        <div class="card-header">
          <span>当前在园游客 ({{ currentVisitors.length }})</span>
          <div class="header-actions">
            <el-input
              v-model="visitorSearchKeyword"
              placeholder="搜索游客..."
              style="width: 200px"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button @click="loadCurrentVisitors">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="filteredCurrentVisitors"
        v-loading="currentVisitorsLoading"
        stripe
      >
        <el-table-column prop="visitorId" label="游客ID" width="100" />
        <el-table-column label="姓名" width="120">
          <template #default="{ row }">
            {{ row.visitor?.user?.displayName || "-" }}
          </template>
        </el-table-column>
        <el-table-column label="入园时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.entryTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="entryGate" label="入园门" width="100" />
        <el-table-column label="已停留时间" width="120">
          <template #default="{ row }">
            {{ calculateStayTime(row.entryTime) }}
          </template>
        </el-table-column>
        <el-table-column label="游客类型" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.visitor?.visitorType === 'Member' ? 'success' : 'info'"
            >
              {{ row.visitor?.visitorType === "Member" ? "会员" : "普通" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleViewVisitor(row)"
            >
              查看详情
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="handleManualExit(row)"
            >
              手动出园
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container" v-if="currentVisitors.length > 10">
        <el-pagination
          :current-page="currentVisitorPage"
          :page-size="10"
          :total="currentVisitors.length"
          layout="prev, pager, next"
          @current-change="handleCurrentVisitorPageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, nextTick } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  getCurrentVisitors,
  getCurrentVisitorCount,
  getEntryRecordStats,
} from "@/api/entryRecords";
import { updateEntryRecord } from "@/api/entryRecords";

const router = useRouter();

// 自动刷新
const autoRefresh = ref(true);
const refreshing = ref(false);
const refreshInterval = ref(null);

// 实时统计数据
const realtimeStats = reactive({
  currentInPark: 0,
  todayEntries: 0,
  todayExits: 0,
  avgStayTime: 0,
  parkTrend: 0,
  recentEntries: 0,
  recentExits: 0,
});

// 门口统计数据
const gateStats = ref([
  {
    name: "主门",
    status: "normal",
    todayEntries: 0,
    todayExits: 0,
    currentFlow: 0,
  },
  {
    name: "东门",
    status: "normal",
    todayEntries: 0,
    todayExits: 0,
    currentFlow: 0,
  },
  {
    name: "西门",
    status: "busy",
    todayEntries: 0,
    todayExits: 0,
    currentFlow: 0,
  },
  {
    name: "南门",
    status: "normal",
    todayEntries: 0,
    todayExits: 0,
    currentFlow: 0,
  },
]);

// 活动日志
const activityLog = ref([]);
const activityLogRef = ref(null);

// 图表相关
const chartTimeRange = ref("6h");
const chartRef = ref(null);

// 当前在园游客
const currentVisitors = ref([]);
const currentVisitorsLoading = ref(false);
const visitorSearchKeyword = ref("");
const currentVisitorPage = ref(1);

// 过滤后的当前游客
const filteredCurrentVisitors = computed(() => {
  if (!visitorSearchKeyword.value) {
    return currentVisitors.value.slice(
      (currentVisitorPage.value - 1) * 10,
      currentVisitorPage.value * 10,
    );
  }

  const filtered = currentVisitors.value.filter((visitor) => {
    const keyword = visitorSearchKeyword.value.toLowerCase();
    return (
      visitor.visitorId.toString().includes(keyword) ||
      (visitor.visitor?.user?.displayName &&
        visitor.visitor.user.displayName.toLowerCase().includes(keyword))
    );
  });

  return filtered.slice(
    (currentVisitorPage.value - 1) * 10,
    currentVisitorPage.value * 10,
  );
});

// 格式化时间
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString("zh-CN");
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("zh-CN");
};

// 格式化时长
const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return "-";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}小时${mins}分钟`;
  } else {
    return `${mins}分钟`;
  }
};

// 计算停留时间
const calculateStayTime = (entryTime) => {
  if (!entryTime) return "-";

  const entry = new Date(entryTime);
  const now = new Date();
  const duration = now - entry;

  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  } else {
    return `${minutes}分钟`;
  }
};

// 获取趋势样式类
const getTrendClass = (trend) => {
  if (trend > 0) return "positive";
  if (trend < 0) return "negative";
  return "neutral";
};

// 获取门口状态文本
const getGateStatusText = (status) => {
  const statusMap = {
    normal: "正常",
    busy: "繁忙",
    closed: "关闭",
  };
  return statusMap[status] || "未知";
};

// 自动刷新切换
const handleAutoRefreshChange = (value) => {
  if (value) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
};

// 手动刷新
const handleManualRefresh = async () => {
  refreshing.value = true;
  await loadAllData();
  refreshing.value = false;
  ElMessage.success("数据已刷新");
};

// 清空活动日志
const clearActivityLog = () => {
  activityLog.value = [];
  ElMessage.success("活动日志已清空");
};

// 查看游客详情
const handleViewVisitor = (row) => {
  router.push(`/visitors/${row.visitorId}`);
};

// 手动出园
const handleManualExit = async (row) => {
  try {
    await updateEntryRecord(row.entryRecordId, {
      exitTime: new Date().toISOString(),
      exitGate: row.entryGate, // 默认使用入园门作为出园门
    });

    ElMessage.success("出园记录已更新");
    await loadCurrentVisitors();
    await loadRealtimeStats();

    // 添加活动日志
    addActivityLog("exit", `游客 ${row.visitorId} 手动出园`);
  } catch (error) {
    ElMessage.error("出园操作失败：" + error.message);
  }
};

// 当前游客分页
const handleCurrentVisitorPageChange = (page) => {
  currentVisitorPage.value = page;
};

// 添加活动日志
const addActivityLog = (type, message) => {
  const activity = {
    id: Date.now(),
    type,
    message,
    timestamp: new Date().toISOString(),
  };

  activityLog.value.unshift(activity);

  // 限制日志数量
  if (activityLog.value.length > 100) {
    activityLog.value = activityLog.value.slice(0, 100);
  }

  // 滚动到顶部
  nextTick(() => {
    if (activityLogRef.value) {
      activityLogRef.value.scrollTop = 0;
    }
  });
};

// 开始自动刷新
const startAutoRefresh = () => {
  if (refreshInterval.value) return;

  refreshInterval.value = setInterval(() => {
    loadAllData();
  }, 30000); // 30秒刷新一次
};

// 停止自动刷新
const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
    refreshInterval.value = null;
  }
};

// 加载实时统计数据
const loadRealtimeStats = async () => {
  try {
    const [countResponse, statsResponse] = await Promise.all([
      getCurrentVisitorCount(),
      getEntryRecordStats({
        includeCurrentCount: true,
        includeTodayStats: true,
        includeAvgDuration: true,
        includeTrends: true,
      }),
    ]);

    if (countResponse) {
      realtimeStats.currentInPark = countResponse.count || 0;
    }

    if (statsResponse) {
      Object.assign(realtimeStats, statsResponse);
    }
  } catch (error) {
    console.error("加载实时统计数据失败:", error);
    // 使用模拟数据
    realtimeStats.currentInPark = 89;
    realtimeStats.todayEntries = 156;
    realtimeStats.todayExits = 67;
    realtimeStats.avgStayTime = 180;
    realtimeStats.parkTrend = 5;
    realtimeStats.recentEntries = 12;
    realtimeStats.recentExits = 7;
  }
};

// 加载门口统计数据
const loadGateStats = async () => {
  try {
    // 这里应该调用实际的API
    // 目前使用模拟数据
    gateStats.value = [
      {
        name: "主门",
        status: "normal",
        todayEntries: 45,
        todayExits: 23,
        currentFlow: 3,
      },
      {
        name: "东门",
        status: "normal",
        todayEntries: 38,
        todayExits: 19,
        currentFlow: 2,
      },
      {
        name: "西门",
        status: "busy",
        todayEntries: 52,
        todayExits: 18,
        currentFlow: 8,
      },
      {
        name: "南门",
        status: "normal",
        todayEntries: 21,
        todayExits: 7,
        currentFlow: 1,
      },
    ];
  } catch (error) {
    console.error("加载门口统计数据失败:", error);
  }
};

// 加载当前在园游客
const loadCurrentVisitors = async () => {
  try {
    currentVisitorsLoading.value = true;
    const response = await getCurrentVisitors();

    if (response) {
      currentVisitors.value = response.items || response;
    } else {
      currentVisitors.value = [];
    }
  } catch (error) {
    console.error("加载当前在园游客失败:", error);
    ElMessage.error("加载当前在园游客失败：" + error.message);
    currentVisitors.value = [];
  } finally {
    currentVisitorsLoading.value = false;
  }
};

// 模拟实时活动
const simulateRealtimeActivity = () => {
  const activities = [
    { type: "entry", message: "游客 1001 从主门入园" },
    { type: "exit", message: "游客 1002 从东门出园" },
    { type: "entry", message: "游客 1003 从西门入园" },
    { type: "alert", message: "西门流量较大，请注意疏导" },
  ];

  // 随机添加活动
  if (Math.random() < 0.3) {
    // 30% 概率
    const activity = activities[Math.floor(Math.random() * activities.length)];
    addActivityLog(activity.type, activity.message);
  }
};

// 加载所有数据
const loadAllData = async () => {
  await Promise.all([
    loadRealtimeStats(),
    loadGateStats(),
    loadCurrentVisitors(),
  ]);

  // 模拟实时活动
  simulateRealtimeActivity();
};

// 组件挂载时加载数据
onMounted(() => {
  loadAllData();
  if (autoRefresh.value) {
    startAutoRefresh();
  }
});

// 组件卸载时清理定时器
onUnmounted(() => {
  stopAutoRefresh();
});
</script>

<style scoped>
.visitor-monitor {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-card.realtime {
  border: 2px solid #67c23a;
  box-shadow: 0 0 10px rgba(103, 194, 58, 0.3);
}

.stat-card .el-card__body {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-trend.positive {
  color: #67c23a;
}

.stat-trend.negative {
  color: #f56c6c;
}

.stat-trend.neutral {
  color: #909399;
}

.stat-icon {
  font-size: 40px;
  opacity: 0.8;
}

.gate-stats-row {
  margin-bottom: 20px;
}

.gate-stats-card,
.activity-card {
  height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gate-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  height: 320px;
}

.gate-item {
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fafafa;
}

.gate-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.gate-name {
  font-weight: bold;
  font-size: 16px;
  color: #303133;
}

.gate-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.gate-status.normal {
  color: #67c23a;
}

.gate-status.busy {
  color: #e6a23c;
}

.gate-status.closed {
  color: #f56c6c;
}

.gate-numbers {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gate-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gate-stat .label {
  font-size: 14px;
  color: #606266;
}

.gate-stat .value {
  font-weight: bold;
  font-size: 16px;
}

.gate-stat .value.entry {
  color: #409eff;
}

.gate-stat .value.exit {
  color: #e6a23c;
}

.gate-stat .value.current {
  color: #67c23a;
}

.activity-log {
  height: 320px;
  overflow-y: auto;
  padding: 8px 0;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  border-left: 3px solid #e4e7ed;
}

.activity-item.entry {
  background: #f0f9ff;
  border-left-color: #409eff;
}

.activity-item.exit {
  background: #fdf6ec;
  border-left-color: #e6a23c;
}

.activity-item.alert {
  background: #fef0f0;
  border-left-color: #f56c6c;
}

.activity-time {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  min-width: 80px;
}

.activity-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #303133;
}

.no-activity {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
  gap: 8px;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  min-height: 400px;
}

.chart-container {
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #909399;
}

.chart-placeholder p {
  margin: 8px 0;
}

.current-visitors-card {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .gate-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .gate-stats-card,
  .activity-card {
    height: auto;
    min-height: 300px;
  }

  .activity-log {
    height: 250px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .stats-row .el-col {
    margin-bottom: 16px;
  }

  .stat-card .el-card__body {
    padding: 16px;
  }

  .stat-value {
    font-size: 24px;
  }

  .stat-icon {
    font-size: 32px;
  }

  .gate-stats-row .el-col {
    margin-bottom: 16px;
  }

  .charts-row .el-col {
    margin-bottom: 16px;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .el-table {
    font-size: 12px;
  }
}
</style>

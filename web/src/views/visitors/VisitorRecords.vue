<template>
  <div class="visitor-records">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>游客记录管理</h2>
      <p>查看和管理游客的入园出园记录、消费记录、积分变动等历史信息</p>
    </div>

    <!-- 搜索和筛选区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="游客ID">
          <el-input
            v-model="searchForm.visitorId"
            placeholder="请输入游客ID"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="游客姓名">
          <el-input
            v-model="searchForm.visitorName"
            placeholder="请输入游客姓名"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="记录类型">
          <el-select
            v-model="searchForm.recordType"
            placeholder="请选择"
            clearable
            style="width: 120px"
          >
            <el-option label="全部" value="" />
            <el-option label="入园记录" value="entry" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 320px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <div class="action-buttons">
        <el-button type="success" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出记录
        </el-button>
        <el-button type="info" @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalEntries }}</div>
            <div class="stat-label">总入园次数</div>
          </div>
          <el-icon class="stat-icon" color="#409eff"
            ><LocationInformation
          /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ stats.currentInPark }}</div>
            <div class="stat-label">当前在园人数</div>
          </div>
          <el-icon class="stat-icon" color="#67c23a"><UserFilled /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ stats.todayEntries }}</div>
            <div class="stat-label">今日入园</div>
          </div>
          <el-icon class="stat-icon" color="#e6a23c"><Calendar /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">
              {{ formatDuration(stats.avgDuration) }}
            </div>
            <div class="stat-label">平均游玩时长</div>
          </div>
          <el-icon class="stat-icon" color="#f56c6c"><Timer /></el-icon>
        </el-card>
      </el-col>
    </el-row>

    <!-- 入园记录 -->
    <el-card class="records-card">
      <template #header>
        <span>入园记录</span>
      </template>
      <el-table :data="entryRecords" v-loading="entryLoading" stripe border>
        <el-table-column prop="entryRecordId" label="记录ID" width="100" />
        <el-table-column label="游客信息" width="200">
          <template #default="{ row }">
            <div class="visitor-info">
              <div><strong>ID:</strong> {{ row.visitorId }}</div>
              <div v-if="row.visitor?.user?.displayName">
                <strong>姓名:</strong> {{ row.visitor.user.displayName }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="入园时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.entryTime) }}
          </template>
        </el-table-column>
        <el-table-column label="出园时间" width="180">
          <template #default="{ row }">
            {{ row.exitTime ? formatDate(row.exitTime) : "未出园" }}
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
              {{ row.exitTime ? "已出园" : "在园中" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleViewEntryDetail(row)"
            >
              查看详情
            </el-button>
            <el-button
              v-if="!row.exitTime"
              type="warning"
              size="small"
              @click="handleManualExit(row)"
            >
              手动出园
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          :current-page="entryPagination.currentPage"
          :page-size="entryPagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="entryPagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleEntrySizeChange"
          @current-change="handleEntryCurrentChange"
        />
      </div>
    </el-card>

    <!-- 入园记录详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="入园记录详情"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="currentDetailRecord" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="记录ID">
            {{ currentDetailRecord.entryRecordId }}
          </el-descriptions-item>
          <el-descriptions-item label="游客ID">
            {{ currentDetailRecord.visitorId }}
          </el-descriptions-item>
          <el-descriptions-item label="游客姓名" :span="2">
            {{ currentDetailRecord.visitorName }}
          </el-descriptions-item>
          <el-descriptions-item label="入园时间" :span="2">
            {{ formatDateTime(currentDetailRecord.entryTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="出园时间" :span="2">
            {{
              currentDetailRecord.exitTime
                ? formatDateTime(currentDetailRecord.exitTime)
                : "未出园"
            }}
          </el-descriptions-item>
          <el-descriptions-item label="入园门">
            {{ currentDetailRecord.entryGate }}
          </el-descriptions-item>
          <el-descriptions-item label="出园门">
            {{ currentDetailRecord.exitGate || "未出园" }}
          </el-descriptions-item>
          <el-descriptions-item label="门票ID">
            {{ currentDetailRecord.ticketId || "无" }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentDetailRecord.isActive ? 'success' : 'info'">
              {{ currentDetailRecord.isActive ? "在园中" : "已出园" }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="游玩时长" :span="2">
            {{ calculateDuration(currentDetailRecord) }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ formatDateTime(currentDetailRecord.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间" :span="2">
            {{ formatDateTime(currentDetailRecord.updatedAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          v-if="currentDetailRecord?.isActive"
          type="warning"
          @click="handleQuickExit"
        >
          快速出园
        </el-button>
      </template>
    </el-dialog>

    <!-- 手动出园对话框 -->
    <el-dialog v-model="exitDialogVisible" title="手动出园" width="400px">
      <el-form :model="exitForm" label-width="80px">
        <el-form-item label="出园门">
          <el-select
            v-model="exitForm.exitGate"
            placeholder="请选择出园门"
            style="width: 100%"
          >
            <el-option label="主门" value="main" />
            <el-option label="东门" value="east" />
            <el-option label="西门" value="west" />
            <el-option label="南门" value="south" />
          </el-select>
        </el-form-item>
        <el-form-item label="出园时间">
          <el-date-picker
            v-model="exitForm.exitTime"
            type="datetime"
            placeholder="选择出园时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="exitForm.remarks"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="exitDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleExitSubmit"
          :loading="exitSubmitting"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  searchEntryRecords,
  updateEntryRecord,
  getEntryRecordStats,
} from "@/api/entryRecords";
import { searchVisitors } from "@/api/visitors";

// 搜索表单
const searchForm = reactive({
  visitorId: "",
  visitorName: "",
  recordType: "",
  dateRange: [],
});

// 统计数据
const stats = reactive({
  totalEntries: 0,
  currentInPark: 0,
  todayEntries: 0,
  avgDuration: 0,
});

// 入园记录
const entryRecords = ref([]);
const entryLoading = ref(false);
const entryPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0,
});

// 详情对话框
const detailDialogVisible = ref(false);
const currentDetailRecord = ref(null);

// 手动出园对话框
const exitDialogVisible = ref(false);
const exitSubmitting = ref(false);
const currentExitRecord = ref(null);
const exitForm = reactive({
  exitGate: "",
  exitTime: new Date(),
  remarks: "",
});

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("zh-CN");
};

// 格式化日期时间（详细版本）
const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
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

// 计算游玩时长（支持记录对象和单独参数）
const calculateDuration = (entryTimeOrRecord, exitTime = null) => {
  let entryTime, actualExitTime;

  if (typeof entryTimeOrRecord === "object" && entryTimeOrRecord !== null) {
    // 传入的是记录对象
    const record = entryTimeOrRecord;
    if (!record.entryTime) return "-";

    entryTime = new Date(record.entryTime);
    actualExitTime = record.exitTime ? new Date(record.exitTime) : new Date();

    const duration = Math.floor((actualExitTime - entryTime) / (1000 * 60)); // 转换为分钟

    if (duration < 0) return "-";

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (record.exitTime) {
      // 已出园，显示实际时长
      if (hours > 0) {
        return `${hours}小时${minutes}分钟`;
      } else {
        return `${minutes}分钟`;
      }
    } else {
      // 在园中，显示当前时长
      if (hours > 0) {
        return `${hours}小时${minutes}分钟 (在园中)`;
      } else {
        return `${minutes}分钟 (在园中)`;
      }
    }
  } else {
    // 传入的是单独的时间参数（兼容原有调用）
    if (!exitTime) return "-";

    const entry = new Date(entryTimeOrRecord);
    const exit = new Date(exitTime);
    const duration = exit - entry;

    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    } else {
      return `${minutes}分钟`;
    }
  }
};

// 格式化会员等级
const formatMemberLevel = (level) => {
  const levelMap = {
    Bronze: "青铜",
    Silver: "白银",
    Gold: "黄金",
    Platinum: "铂金",
  };
  return levelMap[level] || level;
};

// 获取会员等级标签类型
const getMemberLevelType = (level) => {
  const typeMap = {
    Bronze: "",
    Silver: "info",
    Gold: "warning",
    Platinum: "success",
  };
  return typeMap[level] || "";
};

// 格式化会员操作
const formatMembershipOperation = (operation) => {
  const operationMap = {
    upgrade: "升级会员",
    downgrade: "降级",
    cancel: "取消会员",
    level_change: "等级变更",
  };
  return operationMap[operation] || operation;
};

// 获取会员操作类型
const getMembershipOperationType = (operation) => {
  const typeMap = {
    upgrade: "success",
    downgrade: "warning",
    cancel: "danger",
    level_change: "info",
  };
  return typeMap[operation] || "info";
};

// 搜索
const handleSearch = () => {
  entryPagination.currentPage = 1;
  loadEntryRecords();
};

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    visitorId: "",
    visitorName: "",
    recordType: "",
    dateRange: [],
  });
  handleSearch();
};

// 导出记录
const handleExport = () => {
  ElMessage.info("导出功能开发中...");
};

// 刷新数据
const handleRefresh = () => {
  loadStats();
  loadEntryRecords();
};

// 查看入园详情
const handleViewEntryDetail = (row) => {
  currentDetailRecord.value = row;
  detailDialogVisible.value = true;
};

// 快速出园（从详情对话框）
const handleQuickExit = () => {
  if (!currentDetailRecord.value) return;

  detailDialogVisible.value = false;
  currentExitRecord.value = currentDetailRecord.value;
  exitForm.exitGate = currentDetailRecord.value.entryGate; // 默认使用入园门作为出园门
  exitForm.exitTime = new Date();
  exitForm.remarks = "";
  exitDialogVisible.value = true;
};

// 手动出园
const handleManualExit = (row) => {
  currentExitRecord.value = row;
  exitForm.exitGate = "";
  exitForm.exitTime = new Date();
  exitForm.remarks = "";
  exitDialogVisible.value = true;
};

// 提交出园
const handleExitSubmit = async () => {
  try {
    exitSubmitting.value = true;

    await updateEntryRecord(currentExitRecord.value.entryRecordId, {
      EntryRecordId: currentExitRecord.value.entryRecordId,
      ExitGate: exitForm.exitGate,
      // 出园时间由后端自动设置为当前时间
      // remarks字段暂不支持
    });

    ElMessage.success("出园记录更新成功");
    exitDialogVisible.value = false;
    await loadEntryRecords();
    await loadStats();
  } catch (error) {
    ElMessage.error("出园记录更新失败：" + error.message);
  } finally {
    exitSubmitting.value = false;
  }
};

// 入园记录分页
const handleEntrySizeChange = (size) => {
  entryPagination.pageSize = size;
  entryPagination.currentPage = 1;
  loadEntryRecords();
};

const handleEntryCurrentChange = (page) => {
  entryPagination.currentPage = page;
  loadEntryRecords();
};

// 加载统计数据
const loadStats = async () => {
  try {
    // 获取总体统计
    const totalResponse = await getEntryRecordStats({});

    // 获取今日统计
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

    const todayResponse = await getEntryRecordStats({
      entryTimeStart: todayStart.toISOString(),
      entryTimeEnd: todayEnd.toISOString(),
    });

    if (totalResponse && todayResponse) {
      // 映射后端字段到前端期望的字段
      stats.totalEntries = totalResponse.totalEntries || 0;
      stats.currentInPark = totalResponse.activeEntries || 0; // 当前在园人数
      stats.todayEntries = todayResponse.totalEntries || 0; // 今日入园次数

      // 计算平均游玩时长（基于实际数据）
      if (totalResponse.totalExits > 0) {
        // 获取所有已出园的记录来计算真实的平均时长
        await calculateAvgDuration();
      } else {
        stats.avgDuration = 0;
      }
    }
  } catch (error) {
    console.error("加载统计数据失败:", error);
    // 使用模拟数据
    stats.totalEntries = 0;
    stats.currentInPark = 0;
    stats.todayEntries = 0;
    stats.avgDuration = 0;
  }
};

// 计算平均游玩时长
const calculateAvgDuration = async () => {
  try {
    // 获取所有已出园的记录（不分页，获取全部）
    const response = await searchEntryRecords({
      page: 1,
      pageSize: 1000, // 获取足够多的记录
      IsActive: false, // 只获取已出园的记录（注意大写I）
    });

    if (response && response.items && response.items.length > 0) {
      let totalDuration = 0;
      let validRecords = 0;

      response.items.forEach((record) => {
        if (record.entryTime && record.exitTime) {
          const entryTime = new Date(record.entryTime);
          const exitTime = new Date(record.exitTime);
          const duration = (exitTime - entryTime) / (1000 * 60); // 转换为分钟

          if (duration > 0) {
            totalDuration += duration;
            validRecords++;
          }
        }
      });

      if (validRecords > 0) {
        stats.avgDuration = Math.round(totalDuration / validRecords);
      } else {
        stats.avgDuration = 0;
      }
    } else {
      stats.avgDuration = 0;
    }
  } catch (error) {
    console.error("计算平均游玩时长失败:", error);
    stats.avgDuration = 0;
  }
};

// 加载入园记录
const loadEntryRecords = async () => {
  try {
    entryLoading.value = true;

    const params = {
      page: entryPagination.currentPage,
      pageSize: entryPagination.pageSize,
      includeVisitorInfo: true,
    };

    // 添加搜索条件
    if (searchForm.visitorId) {
      params.visitorId = searchForm.visitorId;
    }
    if (searchForm.visitorName) {
      params.visitorName = searchForm.visitorName;
    }
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0].toISOString();
      params.endDate = searchForm.dateRange[1].toISOString();
    }

    const response = await searchEntryRecords(params);

    if (response) {
      entryRecords.value = response.items || response;
      entryPagination.total = response.totalCount || response.length || 0;
    } else {
      entryRecords.value = [];
      entryPagination.total = 0;
    }
  } catch (error) {
    console.error("加载入园记录失败:", error);
    ElMessage.error("加载入园记录失败：" + error.message);
    entryRecords.value = [];
    entryPagination.total = 0;
  } finally {
    entryLoading.value = false;
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadStats();
  loadEntryRecords();
});
</script>

<style scoped>
.visitor-records {
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

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  overflow: hidden;
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
}

.stat-icon {
  font-size: 40px;
  opacity: 0.8;
}

.records-card {
  margin-bottom: 20px;
}

.visitor-info {
  font-size: 12px;
  line-height: 1.4;
}

.visitor-info div {
  margin-bottom: 2px;
}

.visitor-info div:last-child {
  margin-bottom: 0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 标签页样式 */
.el-tabs {
  margin-top: 0;
}

.el-tab-pane {
  padding-top: 20px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .search-form {
    flex-wrap: wrap;
  }

  .search-form .el-form-item {
    margin-right: 8px;
  }

  .stats-row .el-col {
    margin-bottom: 12px;
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

  .el-table {
    font-size: 12px;
  }

  .visitor-info {
    font-size: 11px;
  }
}
</style>

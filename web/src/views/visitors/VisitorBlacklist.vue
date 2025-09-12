<template>
  <div class="blacklist-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>黑名单管理</h2>
      <p>管理被拉黑的游客信息</p>
    </div>

    <!-- 搜索和操作区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="姓名、电话、邮箱"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="拉黑时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
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
        <el-button type="primary" @click="handleAddToBlacklist">
          <el-icon><Plus /></el-icon>
          添加黑名单
        </el-button>
        <el-button
          type="success"
          @click="handleBatchRemove"
          :disabled="selectedRows.length === 0"
        >
          <el-icon><Check /></el-icon>
          批量解除 ({{ selectedRows.length }})
        </el-button>
        <el-button type="info" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </el-card>

    <!-- 统计信息 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalBlacklisted }}</div>
            <div class="stat-label">总黑名单数</div>
          </div>
          <el-icon class="stat-icon" color="#f56c6c"
            ><CircleCloseFilled
          /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalVisitors }}</div>
            <div class="stat-label">总游客数</div>
          </div>
          <el-icon class="stat-icon" color="#409eff"><User /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ stats.blacklistRate }}%</div>
            <div class="stat-label">黑名单比例</div>
          </div>
          <el-icon class="stat-icon" color="#e6a23c"><PieChart /></el-icon>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="visitorId" label="游客ID" width="100" />
        <el-table-column label="姓名" width="120">
          <template #default="{ row }">
            {{ row.user?.displayName || "-" }}
          </template>
        </el-table-column>
        <el-table-column label="联系方式" width="180">
          <template #default="{ row }">
            <div v-if="row.user?.email || row.user?.phoneNumber">
              <div v-if="row.user?.email" class="contact-item">
                {{ row.user.email }}
              </div>
              <div v-if="row.user?.phoneNumber" class="contact-item">
                {{ row.user.phoneNumber }}
              </div>
            </div>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="拉黑原因" min-width="200">
          <template #default="{ row }">
            <el-tooltip
              :content="row.blacklistReason"
              placement="top"
              v-if="row.blacklistReason"
            >
              <div class="reason-text">{{ row.blacklistReason }}</div>
            </el-tooltip>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="拉黑时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.blacklistedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="会员状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.visitorType === 'Member' ? 'warning' : 'info'">
              {{ row.visitorType === "Member" ? "会员" : "普通" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleViewDetail(row)"
            >
              查看详情
            </el-button>
            <el-button
              type="success"
              size="small"
              @click="handleRemoveFromBlacklist(row)"
            >
              解除拉黑
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="handleEditReason(row)"
            >
              编辑原因
            </el-button>
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
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加黑名单对话框 -->
    <el-dialog v-model="addDialogVisible" title="添加黑名单" width="500px">
      <el-form
        :model="addForm"
        :rules="addRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item label="游客ID" prop="visitorId">
          <el-input
            v-model="addForm.visitorId"
            placeholder="请输入游客ID"
            @blur="handleVisitorIdBlur"
          />
        </el-form-item>
        <el-form-item label="游客信息" v-if="selectedVisitor">
          <div class="visitor-info">
            <p>
              <strong>姓名：</strong
              >{{ selectedVisitor.user?.displayName || "-" }}
            </p>
            <p>
              <strong>联系方式：</strong>{{ getContactInfo(selectedVisitor) }}
            </p>
            <p>
              <strong>类型：</strong
              >{{
                selectedVisitor.visitorType === "Member" ? "会员" : "普通游客"
              }}
            </p>
          </div>
        </el-form-item>
        <el-form-item label="拉黑原因" prop="reason">
          <el-input
            v-model="addForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拉黑原因"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleAddSubmit"
          :loading="addSubmitting"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑原因对话框 -->
    <el-dialog
      v-model="editReasonDialogVisible"
      title="编辑拉黑原因"
      width="400px"
    >
      <el-form :model="editReasonForm" label-width="80px">
        <el-form-item label="拉黑原因">
          <el-input
            v-model="editReasonForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拉黑原因"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editReasonDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleEditReasonSubmit"
          :loading="editReasonSubmitting"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  Refresh,
  Plus,
  Check,
  Download,
  CircleCloseFilled,
  User,
  PieChart,
} from "@element-plus/icons-vue";
import {
  searchVisitors,
  getVisitorById,
  blacklistVisitor,
  unblacklistVisitor,
  getVisitorStats,
} from "@/api/visitors";

const router = useRouter();

// 搜索表单
const searchForm = reactive({
  keyword: "",
  dateRange: [],
});

// 表格数据
const tableData = ref([]);
const loading = ref(false);
const selectedRows = ref([]);

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0,
});

// 统计数据
const stats = reactive({
  totalBlacklisted: 0,
  totalVisitors: 0,
  blacklistRate: 0,
});

// 添加黑名单对话框
const addDialogVisible = ref(false);
const addSubmitting = ref(false);
const selectedVisitor = ref(null);
const addFormRef = ref(null);
const addForm = reactive({
  visitorId: "",
  reason: "",
});

const addRules = {
  visitorId: [{ required: true, message: "请输入游客ID", trigger: "blur" }],
  reason: [{ required: true, message: "请输入拉黑原因", trigger: "blur" }],
};

// 编辑原因对话框
const editReasonDialogVisible = ref(false);
const editReasonSubmitting = ref(false);
const editingVisitor = ref(null);
const editReasonForm = reactive({
  reason: "",
});

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("zh-CN");
};

// 获取联系信息
const getContactInfo = (visitor) => {
  const contacts = [];
  if (visitor.user?.email) contacts.push(visitor.user.email);
  if (visitor.user?.phoneNumber) contacts.push(visitor.user.phoneNumber);
  return contacts.length > 0 ? contacts.join(", ") : "-";
};

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1;
  loadData();
};

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: "",
    dateRange: [],
  });
  pagination.currentPage = 1;
  loadData();
};

// 添加黑名单
const handleAddToBlacklist = () => {
  addForm.visitorId = "";
  addForm.reason = "";
  selectedVisitor.value = null;
  addDialogVisible.value = true;
};

// 游客ID失焦事件
const handleVisitorIdBlur = async () => {
  if (!addForm.visitorId) {
    selectedVisitor.value = null;
    return;
  }

  try {
    const response = await getVisitorById(addForm.visitorId);
    const visitor = response;

    if (visitor.isBlacklisted) {
      ElMessage.warning("该游客已在黑名单中");
      selectedVisitor.value = null;
      return;
    }

    selectedVisitor.value = visitor;
  } catch (error) {
    ElMessage.error("游客不存在");
    selectedVisitor.value = null;
  }
};

// 提交添加黑名单
const handleAddSubmit = async () => {
  try {
    await addFormRef.value.validate();

    if (!selectedVisitor.value) {
      ElMessage.error("请先输入有效的游客ID");
      return;
    }

    addSubmitting.value = true;
    await blacklistVisitor(addForm.visitorId, { reason: addForm.reason });

    ElMessage.success("添加黑名单成功");
    addDialogVisible.value = false;
    await loadData();
    await loadStats();
  } catch (error) {
    if (error.message) {
      ElMessage.error("添加失败：" + error.message);
    }
  } finally {
    addSubmitting.value = false;
  }
};

// 批量解除黑名单
const handleBatchRemove = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要解除选中的 ${selectedRows.value.length} 个游客的黑名单吗？`,
      "确认操作",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    loading.value = true;

    // 并发处理所有解除操作
    const promises = selectedRows.value.map((row) =>
      unblacklistVisitor(row.visitorId),
    );

    await Promise.all(promises);

    ElMessage.success("批量解除黑名单成功");
    selectedRows.value = [];
    await loadData();
    await loadStats();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("批量解除失败：" + error.message);
    }
  } finally {
    loading.value = false;
  }
};

// 导出数据
const handleExport = () => {
  ElMessage.info("导出功能开发中...");
};

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

// 查看详情
const handleViewDetail = (row) => {
  router.push(`/visitors/${row.visitorId}`);
};

// 解除黑名单
const handleRemoveFromBlacklist = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要解除游客 ${row.user?.displayName || row.visitorId} 的黑名单吗？`,
      "确认操作",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    loading.value = true;
    await unblacklistVisitor(row.visitorId);

    ElMessage.success("解除黑名单成功");
    await loadData();
    await loadStats();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("解除失败：" + error.message);
    }
  } finally {
    loading.value = false;
  }
};

// 编辑拉黑原因
const handleEditReason = (row) => {
  editingVisitor.value = row;
  editReasonForm.reason = row.blacklistReason || "";
  editReasonDialogVisible.value = true;
};

// 提交编辑原因
const handleEditReasonSubmit = async () => {
  try {
    editReasonSubmitting.value = true;

    // 先解除黑名单，再重新添加（模拟更新原因）
    await unblacklistVisitor(editingVisitor.value.visitorId);
    await blacklistVisitor(editingVisitor.value.visitorId, {
      reason: editReasonForm.reason,
    });

    ElMessage.success("更新拉黑原因成功");
    editReasonDialogVisible.value = false;
    await loadData();
  } catch (error) {
    ElMessage.error("更新失败：" + error.message);
  } finally {
    editReasonSubmitting.value = false;
  }
};

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.currentPage = 1;
  loadData();
};

// 当前页改变
const handleCurrentChange = (page) => {
  pagination.currentPage = page;
  loadData();
};

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;

    // 构建查询参数
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      isBlacklisted: true, // 只查询黑名单游客
    };

    // 添加搜索条件
    if (searchForm.keyword) {
      params.keyword = searchForm.keyword;
    }
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0].toISOString();
      params.endDate = searchForm.dateRange[1].toISOString();
    }

    const response = await searchVisitors(params);

    if (response) {
      tableData.value = response.items || response;
      pagination.total = response.totalCount || response.length || 0;
    } else {
      tableData.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error("加载黑名单数据失败:", error);
    ElMessage.error("加载数据失败：" + error.message);
    tableData.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 加载统计数据
const loadStats = async () => {
  try {
    // 获取基本统计数据
    const response = await getVisitorStats();

    if (response) {
      // 基本统计数据
      stats.totalBlacklisted = response.blacklistedVisitors || 0;
      stats.totalVisitors = response.totalVisitors || 0;

      // 计算黑名单比例
      if (stats.totalVisitors > 0) {
        stats.blacklistRate =
          Math.round(
            (stats.totalBlacklisted / stats.totalVisitors) * 100 * 10,
          ) / 10;
      } else {
        stats.blacklistRate = 0;
      }
    }
  } catch (error) {
    console.error("加载统计数据失败:", error);
    // 使用基于当前表格数据的统计
    stats.totalBlacklisted = tableData.value.length;
    stats.totalVisitors = 0;
    stats.blacklistRate = 0;
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadData();
  loadStats();
});
</script>

<style scoped>
.blacklist-management {
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

.table-card {
  margin-bottom: 20px;
}

.contact-item {
  font-size: 12px;
  line-height: 1.4;
}

.text-muted {
  color: #909399;
}

.reason-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.visitor-info {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.visitor-info p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #606266;
}

.visitor-info p:last-child {
  margin-bottom: 0;
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

  .reason-text {
    max-width: 120px;
  }
}
</style>

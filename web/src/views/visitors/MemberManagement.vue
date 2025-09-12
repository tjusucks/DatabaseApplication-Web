<template>
  <div class="member-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>会员管理</h2>
      <p>管理会员信息、积分操作和会员等级</p>
    </div>

    <!-- 搜索和筛选区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="会员ID">
          <el-input
            v-model="searchForm.visitorId"
            placeholder="请输入会员ID"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="会员姓名">
          <el-input
            v-model="searchForm.visitorName"
            placeholder="请输入会员姓名"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="会员等级">
          <el-select
            v-model="searchForm.memberLevel"
            placeholder="请选择"
            clearable
            style="width: 120px"
          >
            <el-option label="全部" value="" />
            <el-option label="青铜会员" value="Bronze" />
            <el-option label="白银会员" value="Silver" />
            <el-option label="黄金会员" value="Gold" />
            <el-option label="铂金会员" value="Platinum" />
          </el-select>
        </el-form-item>
        <el-form-item label="积分范围">
          <el-input-number
            v-model="searchForm.minPoints"
            :min="0"
            placeholder="最小积分"
            style="width: 120px"
          />
          <span style="margin: 0 8px">-</span>
          <el-input-number
            v-model="searchForm.maxPoints"
            :min="0"
            placeholder="最大积分"
            style="width: 120px"
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
    </el-card>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalMembers }}</div>
              <div class="stat-label">总会员数</div>
            </div>
            <el-icon class="stat-icon"><User /></el-icon>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalPoints }}</div>
              <div class="stat-label">总积分</div>
            </div>
            <el-icon class="stat-icon"><Star /></el-icon>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.avgPoints }}</div>
              <div class="stat-label">平均积分</div>
            </div>
            <el-icon class="stat-icon"><TrendCharts /></el-icon>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.activeMembers }}</div>
              <div class="stat-label">活跃会员</div>
            </div>
            <el-icon class="stat-icon"><UserFilled /></el-icon>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 会员列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>会员列表</span>
          <div class="header-actions">
            <el-button @click="handleRefresh">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="members" v-loading="loading" stripe border>
        <el-table-column label="会员信息" width="220">
          <template #default="{ row }">
            <div class="member-info">
              <div><strong>ID:</strong> {{ row.visitorId }}</div>
              <div>
                <strong>姓名:</strong> {{ row.user?.displayName || "未知" }}
              </div>
              <div>
                <strong>用户名:</strong> {{ row.user?.username || "未知" }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="联系方式" width="220">
          <template #default="{ row }">
            <div class="contact-info">
              <div v-if="row.user?.email">
                <el-icon><Message /></el-icon>
                {{ row.user.email }}
              </div>
              <div v-if="row.user?.phoneNumber">
                <el-icon><Phone /></el-icon>
                {{ row.user.phoneNumber }}
              </div>
              <div
                v-if="!row.user?.email && !row.user?.phoneNumber"
                class="no-contact"
              >
                无联系方式
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="会员等级" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="getMemberLevelType(row.memberLevel)">
              {{ getMemberLevelText(row.memberLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="积分" width="120" align="center">
          <template #default="{ row }">
            <div class="points-display">
              <el-icon><Star /></el-icon>
              {{ row.points || 0 }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="成为会员时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.memberSince) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isBlacklisted ? 'danger' : 'success'">
              {{ row.isBlacklisted ? "已拉黑" : "正常" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                @click="handlePointsOperation(row, 'add')"
              >
                <el-icon><Plus /></el-icon>
                加积分
              </el-button>
              <el-button
                type="warning"
                size="small"
                @click="handlePointsOperation(row, 'deduct')"
              >
                <el-icon><Minus /></el-icon>
                扣积分
              </el-button>
              <el-button
                type="info"
                size="small"
                @click="handleViewDetail(row)"
              >
                <el-icon><View /></el-icon>
                详情
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
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

    <!-- 积分操作对话框 -->
    <el-dialog
      v-model="pointsDialogVisible"
      :title="pointsDialogTitle"
      width="500px"
      @close="resetPointsForm"
    >
      <el-form
        ref="pointsFormRef"
        :model="pointsForm"
        :rules="pointsRules"
        label-width="100px"
      >
        <el-form-item label="会员信息">
          <div class="member-summary">
            <div>
              <strong>姓名:</strong> {{ selectedMember?.user?.displayName }}
            </div>
            <div>
              <strong>当前积分:</strong> {{ selectedMember?.points || 0 }}
            </div>
          </div>
        </el-form-item>
        <el-form-item label="积分数量" prop="points">
          <el-input-number
            v-model="pointsForm.points"
            :min="1"
            :max="
              pointsOperation === 'deduct' ? selectedMember?.points || 0 : 99999
            "
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="操作原因" prop="reason">
          <el-input
            v-model="pointsForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入操作原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pointsDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handlePointsSubmit"
          :loading="pointsSubmitting"
        >
          确定{{ pointsOperation === "add" ? "添加" : "扣除" }}
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
  User,
  Star,
  TrendCharts,
  Plus,
  Minus,
} from "@element-plus/icons-vue";
import { searchVisitors, addPoints, deductPoints } from "@/api/visitors";

const router = useRouter();

// 响应式数据
const loading = ref(false);
const members = ref([]);
const stats = reactive({
  totalMembers: 0,
  totalPoints: 0,
  avgPoints: 0,
  activeMembers: 0,
});

// 搜索表单
const searchForm = reactive({
  visitorId: "",
  visitorName: "",
  memberLevel: "",
  minPoints: null,
  maxPoints: null,
});

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0,
});

// 积分操作
const pointsDialogVisible = ref(false);
const pointsSubmitting = ref(false);
const pointsOperation = ref("add"); // 'add' or 'deduct'
const selectedMember = ref(null);
const pointsFormRef = ref();

const pointsForm = reactive({
  points: 1,
  reason: "",
});

const pointsRules = {
  points: [
    { required: true, message: "请输入积分数量", trigger: "blur" },
    { type: "number", min: 1, message: "积分数量必须大于0", trigger: "blur" },
  ],
  reason: [
    { required: true, message: "请输入操作原因", trigger: "blur" },
    {
      min: 2,
      max: 200,
      message: "原因长度在 2 到 200 个字符",
      trigger: "blur",
    },
  ],
};

// 计算属性
const pointsDialogTitle = computed(() => {
  return pointsOperation.value === "add" ? "添加积分" : "扣除积分";
});

// 获取会员等级类型
const getMemberLevelType = (level) => {
  const types = {
    Bronze: "info",
    Silver: "primary",
    Gold: "warning",
    Platinum: "success",
  };
  return types[level] || "info";
};

// 获取会员等级文本
const getMemberLevelText = (level) => {
  const texts = {
    Bronze: "青铜会员",
    Silver: "白银会员",
    Gold: "黄金会员",
    Platinum: "铂金会员",
  };
  return texts[level] || level;
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("zh-CN");
};

// 加载会员数据
const loadMembers = async () => {
  try {
    loading.value = true;

    const params = {
      pageNumber: pagination.currentPage,
      pageSize: pagination.pageSize,
      visitorType: 1, // 只查询会员 (Member = 1)
    };

    // 添加搜索条件
    if (searchForm.visitorId) {
      params.visitorId = searchForm.visitorId;
    }
    if (searchForm.visitorName) {
      params.displayName = searchForm.visitorName;
    }
    if (searchForm.memberLevel) {
      params.memberLevel = searchForm.memberLevel;
    }

    const response = await searchVisitors(params);

    if (response && response.items) {
      members.value = response.items;
      pagination.total = response.totalCount;

      // 计算统计数据
      calculateStats(response.items);
    } else {
      members.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error("加载会员数据失败:", error);
    ElMessage.error("加载会员数据失败：" + error.message);
    members.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 计算统计数据
const calculateStats = (memberList) => {
  stats.totalMembers = memberList.length;
  stats.totalPoints = memberList.reduce(
    (sum, member) => sum + (member.points || 0),
    0,
  );
  stats.avgPoints =
    stats.totalMembers > 0
      ? Math.round(stats.totalPoints / stats.totalMembers)
      : 0;
  stats.activeMembers = memberList.filter(
    (member) => !member.isBlacklisted,
  ).length;
};

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1;
  loadMembers();
};

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    visitorId: "",
    visitorName: "",
    memberLevel: "",
    minPoints: null,
    maxPoints: null,
  });
  pagination.currentPage = 1;
  loadMembers();
};

// 刷新数据
const handleRefresh = () => {
  loadMembers();
};

// 分页处理
const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.currentPage = 1;
  loadMembers();
};

const handleCurrentChange = (page) => {
  pagination.currentPage = page;
  loadMembers();
};

// 积分操作
const handlePointsOperation = (member, operation) => {
  selectedMember.value = member;
  pointsOperation.value = operation;
  pointsForm.points = 1;
  pointsForm.reason = "";
  pointsDialogVisible.value = true;
};

// 重置积分表单
const resetPointsForm = () => {
  pointsForm.points = 1;
  pointsForm.reason = "";
  selectedMember.value = null;
};

// 提交积分操作
const handlePointsSubmit = async () => {
  try {
    await pointsFormRef.value.validate();

    pointsSubmitting.value = true;

    const data = {
      points: pointsForm.points,
      reason: pointsForm.reason,
    };

    if (pointsOperation.value === "add") {
      await addPoints(selectedMember.value.visitorId, data);
      ElMessage.success("积分添加成功");
    } else {
      await deductPoints(selectedMember.value.visitorId, data);
      ElMessage.success("积分扣除成功");
    }

    pointsDialogVisible.value = false;
    await loadMembers(); // 重新加载数据
  } catch (error) {
    console.error("积分操作失败:", error);
    ElMessage.error("积分操作失败：" + error.message);
  } finally {
    pointsSubmitting.value = false;
  }
};

// 查看详情
const handleViewDetail = (member) => {
  router.push(`/visitors/${member.visitorId}`);
};

// 组件挂载时加载数据
onMounted(() => {
  loadMembers();
});
</script>

<style scoped>
.member-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin: 0;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-content {
  position: relative;
  z-index: 2;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.stat-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 40px;
  color: #e4e7ed;
  z-index: 1;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.member-info {
  line-height: 1.5;
}

.contact-info {
  line-height: 1.8;
}

.contact-info .el-icon {
  margin-right: 4px;
  color: #909399;
}

.no-contact {
  color: #c0c4cc;
  font-style: italic;
}

.points-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #e6a23c;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: center;
}

.member-summary {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  line-height: 1.6;
}
</style>

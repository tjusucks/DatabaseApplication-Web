<template>
  <div class="employee-detail">
    <div class="page-header">
      <h2>员工详情</h2>
      <p>查看员工详细信息和工作记录</p>
    </div>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>员工基本信息</span>
          <el-button type="primary" @click="handleEdit">编辑信息</el-button>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="员工编号">{{
          employee.staffNumber || "无"
        }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{
          employee.user?.displayName || "无"
        }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{
          employee.departmentName || "无"
        }}</el-descriptions-item>
        <el-descriptions-item label="职位">{{
          employee.position || "无"
        }}</el-descriptions-item>
        <el-descriptions-item label="入职日期">{{
          employee.hireDate ? formatDate(employee.hireDate) : "无"
        }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{
          employee.user?.phoneNumber || "无"
        }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{
          employee.user?.email || "无"
        }}</el-descriptions-item>
        <el-descriptions-item label="员工类型">{{
          employee.staffType !== null ? getStaffType(employee.staffType) : "无"
        }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag
            v-if="employee.employmentStatus !== null"
            :type="getEmploymentStatusType(employee.employmentStatus)"
          >
            {{ getEmploymentStatus(employee.employmentStatus) }}
          </el-tag>
          <span v-else>无</span>
        </el-descriptions-item>
      </el-descriptions>

      <div style="margin-top: 20px">
        <el-tabs type="card">
          <el-tab-pane label="工作记录">
            <el-table :data="workRecords" style="width: 100%">
              <el-table-column prop="date" label="日期" width="120">
                <template #default="scope">
                  {{ scope.row.date ? formatDate(scope.row.date) : "无" }}
                </template>
              </el-table-column>
              <el-table-column prop="type" label="类型" width="120">
                <template #default="scope">
                  {{ scope.row.type || "无" }}
                </template>
              </el-table-column>
              <el-table-column prop="content" label="内容">
                <template #default="scope">
                  {{ scope.row.content || "无" }}
                </template>
              </el-table-column>
              <el-table-column prop="hours" label="工时" width="80">
                <template #default="scope">
                  {{ scope.row.hours || "无" }}
                </template>
              </el-table-column>
            </el-table>
            <div
              v-if="workRecords.length === 0"
              style="text-align: center; padding: 20px; color: #909399"
            >
              暂无工作记录
            </div>
          </el-tab-pane>
          <el-tab-pane label="考勤记录">
            <el-table :data="attendanceRecords" style="width: 100%">
              <el-table-column prop="date" label="日期" width="120">
                <template #default="scope">
                  {{ scope.row.date ? formatDate(scope.row.date) : "无" }}
                </template>
              </el-table-column>
              <el-table-column prop="checkIn" label="上班时间" width="100">
                <template #default="scope">
                  {{ scope.row.checkIn || "无" }}
                </template>
              </el-table-column>
              <el-table-column prop="checkOut" label="下班时间" width="100">
                <template #default="scope">
                  {{ scope.row.checkOut || "无" }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag
                    v-if="scope.row.status"
                    :type="scope.row.status === '正常' ? 'success' : 'warning'"
                  >
                    {{ scope.row.status }}
                  </el-tag>
                  <span v-else>无</span>
                </template>
              </el-table-column>
            </el-table>
            <div
              v-if="attendanceRecords.length === 0"
              style="text-align: center; padding: 20px; color: #909399"
            >
              暂无考勤记录
            </div>
          </el-tab-pane>
          <el-tab-pane label="绩效评估">
            <el-table :data="performanceData" style="width: 100%">
              <el-table-column prop="period" label="考核期间" width="150">
                <template #default="scope">
                  {{ scope.row.period || "无" }}
                </template>
              </el-table-column>
              <el-table-column prop="score" label="评分" width="100">
                <template #default="scope">
                  {{ scope.row.score !== null ? scope.row.score : "无" }}
                </template>
              </el-table-column>
              <el-table-column prop="level" label="等级" width="100">
                <template #default="scope">
                  {{ scope.row.level || "无" }}
                </template>
              </el-table-column>
              <el-table-column prop="comment" label="评语">
                <template #default="scope">
                  {{ scope.row.comment || "无" }}
                </template>
              </el-table-column>
            </el-table>
            <div
              v-if="performanceData.length === 0"
              style="text-align: center; padding: 20px; color: #909399"
            >
              暂无绩效评估记录
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { getEmployeeById } from "@/api/hr";

// 获取路由参数
const route = useRoute();

// 员工数据
const employee = ref({
  employeeId: 0,
  staffNumber: "",
  position: "",
  departmentName: "",
  staffType: null,
  hireDate: "",
  employmentStatus: 0,
  user: {
    displayName: "",
    email: "",
    phoneNumber: "",
  },
});

// 工作记录数据
const workRecords = ref([]);

// 考勤记录数据
const attendanceRecords = ref([]);

// 绩效数据
const performanceData = ref([]);

// 格式化日期
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("zh-CN");
};

// 获取员工状态类型
const getEmploymentStatusType = (status) => {
  switch (status) {
    case 0: // Active
      return "success";
    case 1: // Resigned
      return "danger";
    case 2: // OnLeave
      return "warning";
    default:
      return "info";
  }
};

// 获取员工状态文本
const getEmploymentStatus = (status) => {
  switch (status) {
    case 0:
      return "在职";
    case 1:
      return "已离职";
    case 2:
      return "休假中";
    default:
      return "未知";
  }
};

// 获取员工类型文本
const getStaffType = (type) => {
  switch (type) {
    case 0:
      return "普通员工";
    case 1:
      return "检查员";
    case 2:
      return "技工";
    case 3:
      return "管理人员";
    default:
      return "未知";
  }
};

// 处理编辑操作
const handleEdit = () => {
  // TODO: 实现编辑功能
  console.log("编辑员工信息");
};

// 获取员工详情
const fetchEmployeeDetail = async (id) => {
  try {
    const response = await getEmployeeById(id);
    employee.value = response.data || response;

    // 清空模拟数据
    workRecords.value = [];
    attendanceRecords.value = [];
    performanceData.value = [];
  } catch (error) {
    console.error("获取员工详情失败:", error);
    ElMessage.error("获取员工详情失败: " + (error.message || "未知错误"));
  }
};

// 组件挂载时获取数据
onMounted(() => {
  const employeeId = route.params.id || route.params.employeeId || 1; // 支持不同的参数名称
  fetchEmployeeDetail(employeeId);
});
</script>

<style scoped>
.employee-detail {
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-descriptions {
  margin-top: 20px;
}
</style>

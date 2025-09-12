<template>
  <div class="attendance-statistics">
    <div class="page-header">
      <h2>考勤统计</h2>
      <p>统计分析员工考勤情况</p>
    </div>

    <!-- 统计筛选条件 -->
    <el-card class="filter-card mb-20">
      <el-form
        :model="filterForm"
        label-width="100px"
        @submit.prevent="loadStatistics"
        inline
      >
        <el-form-item label="统计周期">
          <el-select v-model="filterForm.period" @change="handlePeriodChange">
            <el-option label="本周" value="week"></el-option>
            <el-option label="本月" value="month"></el-option>
            <el-option label="本季度" value="quarter"></el-option>
            <el-option label="本年" value="year"></el-option>
            <el-option label="自定义" value="custom"></el-option>
          </el-select>
        </el-form-item>

        <template v-if="filterForm.period === 'custom'">
          <el-form-item label="开始日期">
            <el-date-picker
              v-model="filterForm.startDate"
              type="date"
              placeholder="选择开始日期"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="结束日期">
            <el-date-picker
              v-model="filterForm.endDate"
              type="date"
              placeholder="选择结束日期"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </template>

        <el-form-item>
          <el-button type="primary" @click="loadStatistics" :loading="loading"
            >查询</el-button
          >
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计概览 -->
    <el-row :gutter="20" class="mb-20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ statistics.totalEmployees }}</div>
            <div class="stat-label">总员工数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ statistics.presentRate }}%</div>
            <div class="stat-label">出勤率</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ statistics.lateCount }}</div>
            <div class="stat-label">迟到人次</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ statistics.absentCount }}</div>
            <div class="stat-label">缺勤人次</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 状态分布 -->
    <el-row :gutter="20" class="mb-20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>考勤状态分布</span>
            </div>
          </template>
          <div class="chart-placeholder">
            <el-table :data="statusDistributionData" style="width: 100%">
              <el-table-column prop="name" label="状态" />
              <el-table-column prop="value" label="人数" />
              <el-table-column label="占比">
                <template #default="scope">
                  {{
                    calculatePercentage(
                      scope.row.value,
                      statistics.totalEmployees,
                    )
                  }}%
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>部门出勤率</span>
            </div>
          </template>
          <div class="chart-placeholder">
            <el-table :data="departmentAttendanceData" style="width: 100%">
              <el-table-column prop="name" label="部门" />
              <el-table-column prop="value" label="出勤率">
                <template #default="scope"> {{ scope.row.value }}% </template>
              </el-table-column>
              <el-table-column label="状态">
                <template #default="scope">
                  <el-tag :type="getAttendanceRateType(scope.row.value)">
                    {{ getAttendanceRateLabel(scope.row.value) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细统计表格 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>详细统计</span>
        </div>
      </template>
      <el-table
        :data="detailedStats"
        border
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="department" label="部门" width="150" />
        <el-table-column prop="totalEmployees" label="总人数" width="100" />
        <el-table-column prop="present" label="出勤" width="100" />
        <el-table-column prop="late" label="迟到" width="100" />
        <el-table-column prop="absent" label="缺勤" width="100" />
        <el-table-column prop="leave" label="请假" width="100" />
        <el-table-column prop="attendanceRate" label="出勤率" width="100">
          <template #default="scope">
            {{ scope.row.attendanceRate }}%
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { queryAttendance, getEmployees } from "@/api/hr.js";

// 页面加载状态
const loading = ref(false);

// 筛选表单
const filterForm = reactive({
  period: "month",
  startDate: "",
  endDate: "",
});

// 统计概览数据
const statistics = reactive({
  totalEmployees: 0,
  presentRate: 0,
  lateCount: 0,
  absentCount: 0,
});

// 状态分布数据
const statusDistributionData = ref([]);

// 部门出勤率数据
const departmentAttendanceData = ref([]);

// 详细统计数据
const detailedStats = ref([]);

// 处理周期变化
const handlePeriodChange = (period) => {
  if (period !== "custom") {
    filterForm.startDate = "";
    filterForm.endDate = "";
  }
};

// 重置筛选条件
const resetFilter = () => {
  filterForm.period = "month";
  filterForm.startDate = "";
  filterForm.endDate = "";
  loadStatistics();
};

// 计算百分比
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(1);
};

// 获取出勤率标签类型
const getAttendanceRateType = (rate) => {
  if (rate >= 95) return "success";
  if (rate >= 90) return "warning";
  return "danger";
};

// 获取出勤率标签文本
const getAttendanceRateLabel = (rate) => {
  if (rate >= 95) return "优秀";
  if (rate >= 90) return "良好";
  return "需改进";
};

// 获取日期范围
const getDateRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  switch (filterForm.period) {
    case "week":
      // 本周一到今天
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));

      return {
        startDate: monday.toISOString().split("T")[0],
        endDate: now.toISOString().split("T")[0],
      };

    case "month":
      // 本月1号到今天
      const firstDay = new Date(year, month, 1);
      return {
        startDate: firstDay.toISOString().split("T")[0],
        endDate: now.toISOString().split("T")[0],
      };

    case "quarter":
      // 本季度第一天到今天
      const quarter = Math.floor(month / 3);
      const firstDayOfQuarter = new Date(year, quarter * 3, 1);
      return {
        startDate: firstDayOfQuarter.toISOString().split("T")[0],
        endDate: now.toISOString().split("T")[0],
      };

    case "year":
      // 今年1月1号到今天
      const firstDayOfYear = new Date(year, 0, 1);
      return {
        startDate: firstDayOfYear.toISOString().split("T")[0],
        endDate: now.toISOString().split("T")[0],
      };

    case "custom":
      return {
        startDate: filterForm.startDate,
        endDate: filterForm.endDate,
      };

    default:
      return {
        startDate: now.toISOString().split("T")[0],
        endDate: now.toISOString().split("T")[0],
      };
  }
};

// 加载统计数据
const loadStatistics = async () => {
  loading.value = true;
  try {
    // 获取员工总数
    const employeeResponse = await getEmployees({});
    const employees = Array.isArray(employeeResponse) ? employeeResponse : [];
    statistics.totalEmployees = employees.length;

    // 获取日期范围
    const { startDate, endDate } = getDateRange();

    if (!startDate || !endDate) {
      ElMessage.warning("请选择有效的日期范围");
      loading.value = false;
      return;
    }

    // 获取所有员工的考勤数据
    const attendancePromises = employees.map((employee) => {
      return queryAttendance({
        queryType: "GetEmployeeAttendance", // 使用字符串枚举值
        employeeId: employee.employeeId,
        startDate: startDate,
        endDate: endDate,
      });
    });

    // 等待所有请求完成
    const attendanceResults = await Promise.all(attendancePromises);

    // 处理统计数据
    const stats = {
      total: employees.length,
      present: 0,
      late: 0,
      absent: 0,
      leave: 0,
      departmentStats: {},
    };

    // 初始化部门统计
    employees.forEach((employee) => {
      if (!stats.departmentStats[employee.departmentName]) {
        stats.departmentStats[employee.departmentName] = {
          name: employee.departmentName,
          totalEmployees: 0,
          present: 0,
          late: 0,
          absent: 0,
          leave: 0,
        };
      }
      stats.departmentStats[employee.departmentName].totalEmployees++;
    });

    // 处理每个员工的考勤数据
    attendanceResults.forEach((result, index) => {
      const employee = employees[index];
      const records = Array.isArray(result) ? result : [];
      const department = employee.departmentName;

      records.forEach((record) => {
        switch (record.attendanceStatus) {
          case "Present": // Present
            stats.present++;
            stats.departmentStats[department].present++;
            break;
          case "Late": // Late
            stats.late++;
            stats.departmentStats[department].late++;
            break;
          case "Absent": // Absent
            stats.absent++;
            stats.departmentStats[department].absent++;
            break;
          case "Leave": // Leave
            stats.leave++;
            stats.departmentStats[department].leave++;
            break;
        }
      });
    });

    // 计算出勤率
    const totalAttendance =
      stats.present + stats.late + stats.absent + stats.leave;
    statistics.presentRate =
      totalAttendance > 0
        ? (((stats.present + stats.late) / totalAttendance) * 100).toFixed(1)
        : 0;
    statistics.lateCount = stats.late;
    statistics.absentCount = stats.absent;

    // 更新状态分布数据
    statusDistributionData.value = [
      { name: "正常", value: stats.present },
      { name: "迟到", value: stats.late },
      { name: "缺勤", value: stats.absent },
      { name: "请假", value: stats.leave },
    ];

    // 更新部门出勤率数据
    departmentAttendanceData.value = Object.values(stats.departmentStats).map(
      (dept) => {
        const total = dept.present + dept.late + dept.absent + dept.leave;
        const attendanceRate =
          total > 0
            ? (((dept.present + dept.late) / total) * 100).toFixed(1)
            : 0;

        return {
          name: dept.name,
          value: parseFloat(attendanceRate),
        };
      },
    );

    // 更新详细统计数据
    detailedStats.value = Object.values(stats.departmentStats).map((dept) => {
      const total = dept.present + dept.late + dept.absent + dept.leave;
      const attendanceRate =
        total > 0 ? (((dept.present + dept.late) / total) * 100).toFixed(1) : 0;

      return {
        department: dept.name,
        totalEmployees: dept.totalEmployees,
        present: dept.present,
        late: dept.late,
        absent: dept.absent,
        leave: dept.leave,
        attendanceRate: parseFloat(attendanceRate),
      };
    });

    loading.value = false;
  } catch (error) {
    console.error("加载统计数据失败:", error);
    ElMessage.error(
      "加载统计数据失败: " + (error.response?.data?.message || error.message),
    );
    loading.value = false;
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadStatistics();
});
</script>

<style scoped>
.attendance-statistics {
  padding: 0;
}

.mb-20 {
  margin-bottom: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 500;
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

.stat-card {
  text-align: center;
}

.stat-item .stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-item .stat-label {
  font-size: 14px;
  color: #606266;
}

.chart-placeholder {
  min-height: 300px;
}
</style>

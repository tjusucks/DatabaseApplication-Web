<template>
  <div class="employee-list">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>员工列表</h2>
      <p>管理员工基本信息和档案</p>
    </div>

    <!-- 搜索和操作区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="员工姓名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入员工姓名"
            clearable
          />
        </el-form-item>
        <el-form-item label="部门">
          <el-select
            v-model="searchForm.department"
            placeholder="请选择部门"
            clearable
          >
            <el-option
              v-for="dept in departmentOptions"
              :key="dept"
              :label="dept"
              :value="dept"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="职位">
          <el-input
            v-model="searchForm.position"
            placeholder="请输入职位"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon>
              <Refresh />
            </el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd">
          <el-icon>
            <Plus />
          </el-icon>
          新增员工
        </el-button>
        <el-button type="success" @click="handleExport">
          <el-icon>
            <Download />
          </el-icon>
          导出数据
        </el-button>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="employeeId" label="员工ID" width="100" />
        <el-table-column prop="user.displayName" label="姓名" width="120" />
        <el-table-column prop="departmentName" label="部门" width="150" />
        <el-table-column prop="position" label="职位" width="150" />
        <el-table-column prop="hireDate" label="入职日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.hireDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="user.phoneNumber" label="联系电话" width="140" />
        <el-table-column prop="employmentStatus" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.employmentStatus)">
              {{ formatStatus(row.employmentStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button type="warning" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
              :disabled="row.employmentStatus !== 'Active'"
            >
              离职
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { getEmployees, deleteEmployee } from "@/api/hr";

const router = useRouter();

// 搜索表单
const searchForm = reactive({
  name: "",
  department: "",
  position: "",
});

// 表格数据
const tableData = ref([]);
const loading = ref(false);

// 部门选项
const departmentOptions = ref([]);

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0,
});

// 格式化日期
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("zh-CN");
};

// 格式化状态
const formatStatus = (status) => {
  const statusMap = {
    Active: "在职",
    Resigned: "已离职",
    OnLeave: "请假",
  };
  return statusMap[status] || status;
};

// 获取状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    Active: "success",
    Resigned: "info",
    OnLeave: "warning",
  };
  return typeMap[status] || "info";
};

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1;
  loadData();
};

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    name: "",
    department: "",
    position: "",
  });
  pagination.currentPage = 1;
  loadData();
};

// 新增员工
const handleAdd = () => {
  router.push("/hr/employees/create");
};

// 导出数据
const handleExport = () => {
  ElMessage.info("导出功能开发中...");
};

// 查看详情
const handleView = (row) => {
  router.push(`/hr/employees/${row.employeeId}`);
};

// 编辑员工
const handleEdit = (row) => {
  router.push(`/hr/employees/edit/${row.employeeId}`);
};

// 删除员工（办理离职）
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要为员工 ${row.user.displayName} 办理离职手续吗？`,
      "确认操作",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    // 调用删除接口
    await deleteEmployee(row.employeeId);
    ElMessage.success("办理离职成功");
    loadData();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("操作失败: " + (error.message || "未知错误"));
    }
  }
};

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.pageSize = size;
  loadData();
};

// 当前页改变
const handleCurrentChange = (page) => {
  pagination.currentPage = page;
  loadData();
};

// 获取部门列表
const loadDepartments = async () => {
  try {
    const response = await getEmployees();
    if (Array.isArray(response)) {
      // 从员工数据中提取唯一的部门名称
      const departments = [
        ...new Set(response.map((emp) => emp.departmentName).filter(Boolean)),
      ];
      departmentOptions.value = departments;
    }
  } catch (error) {
    console.error("获取部门列表失败:", error);
  }
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    // 构建搜索关键词
    let keyword = "";
    if (searchForm.name || searchForm.department || searchForm.position) {
      const parts = [
        searchForm.name,
        searchForm.department,
        searchForm.position,
      ];
      keyword = parts.filter((item) => item).join(" ");
    }

    // 调用 API 获取员工数据
    const params = {
      keyword: keyword || undefined,
      departmentName: searchForm.department || undefined,
      // 注意：后端API目前不支持分页，这些参数暂时不使用
      // page: pagination.currentPage,
      // pageSize: pagination.pageSize
    };

    const response = await getEmployees(params);

    // 处理返回的数据
    if (Array.isArray(response)) {
      tableData.value = response;
      pagination.total = response.length;
    } else {
      tableData.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error("数据加载失败:", error);
    ElMessage.error("数据加载失败: " + (error.message || "未知错误"));
    tableData.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadData();
  loadDepartments();
});
</script>

<style scoped>
.employee-list {
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
  margin-bottom: 10px;
}

.action-buttons {
  text-align: right;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>

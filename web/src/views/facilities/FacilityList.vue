<template>
  <div class="facility-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设施列表</span>
          <el-input v-model="searchQuery.keyword" placeholder="搜索设施" clearable @input="fetchFacilities" />
        </div>
      </template>

      <el-table :data="facilities" :loading="loading" @row-click="viewFacilityDetail">
        <el-table-column prop="id" label="设施ID" width="100" />
        <el-table-column prop="name" label="设施名称" />
        <el-table-column prop="status" label="状态" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" @click.stop="viewFacilityDetail(row)">查看详情</el-button>
            <el-button size="small" type="primary" @click.stop="editFacility(row)">更改</el-button>
            <el-button size="small" type="danger" @click.stop="deleteFacility(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="fetchFacilities"
      />

      <el-button type="primary" @click="openAddFacilityDialog">新增设施</el-button>

      <el-dialog title="新增设施" v-model="isAddDialogVisible">
        <el-form :model="newFacility" ref="addFacilityForm">
          <el-form-item label="设施名称" prop="name" :rules="[{ required: true, message: '请输入设施名称', trigger: 'blur' }]">
            <el-input v-model="newFacility.name" />
          </el-form-item>
          <el-form-item label="状态" prop="status" :rules="[{ required: true, message: '请选择状态', trigger: 'change' }]">
            <el-select v-model="newFacility.status" placeholder="请选择状态">
              <el-option label="启用" value="enabled" />
              <el-option label="禁用" value="disabled" />
            </el-select>
          </el-form-item>
          <el-form-item label="位置" prop="location" :rules="[{ required: true, message: '请输入位置', trigger: 'blur' }]">
            <el-input v-model="newFacility.location" />
          </el-form-item>
          <el-form-item label="容量" prop="capacity" :rules="[{ required: true, message: '请输入容量', trigger: 'blur' }]">
            <el-input-number v-model="newFacility.capacity" />
          </el-form-item>
          <el-form-item label="运行时长 (分钟)" prop="duration" :rules="[{ required: true, message: '请输入运行时长', trigger: 'blur' }]">
            <el-input-number v-model="newFacility.duration" />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input type="textarea" v-model="newFacility.description" />
          </el-form-item>
          <el-form-item label="开放日期" prop="openDate">
            <el-date-picker v-model="newFacility.openDate" type="date" />
          </el-form-item>
          <el-form-item label="负责人" prop="managerId">
            <el-input v-model="newFacility.managerId" />
          </el-form-item>
        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="isAddDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addFacility">确 定</el-button>
          </div>
        </template>
      </el-dialog>

      <div class="stats-container">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          placeholder="选择日期范围"
          @change="fetchStats"
        />
        <el-card class="stats-card">
          <div class="stat-item">
            <span>设施总数:</span>
            <span>{{ stats.totalRides }}</span>
          </div>
          <div class="stat-item">
            <span>启用设施:</span>
            <span>{{ stats.operationalRides }}</span>
          </div>
          <div class="stat-item">
            <span>维护中设施:</span>
            <span>{{ stats.maintenanceRides }}</span>
          </div>
          <div class="stat-item">
            <span>关闭设施:</span>
            <span>{{ stats.closedRides }}</span>
          </div>
          <div class="stat-item">
            <span>总容量:</span>
            <span>{{ stats.totalCapacity }}</span>
          </div>
          <div class="stat-item">
            <span>平均容量:</span>
            <span>{{ stats.averageCapacity }}</span>
          </div>
          <div class="stat-item">
            <span>平均运行时长:</span>
            <span>{{ stats.averageDuration }}</span>
          </div>
          <div class="stat-item">
            <span>最早开放日期:</span>
            <span>{{ stats.firstOpenDate }}</span>
          </div>
          <div class="stat-item">
            <span>最近开放日期:</span>
            <span>{{ stats.lastOpenDate }}</span>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { searchRides, deleteRide, createRide, getRideStats } from '@/api/facilities';

const facilities = ref([]);
const loading = ref(false);
const pagination = ref({ page: 1, pageSize: 10, total: 0 });
const isAddDialogVisible = ref(false);
const newFacility = ref({
  rideName: '',
  location: '',
  rideStatus: 1,
  capacity: 10,
  duration: 30,
  heightLimitMin: 120,
  heightLimitMax: 200,
  description: '',
  openDate: null,
  managerId: null,
});
const searchQuery = ref({
  keyword: '',
  status: null,
  location: '',
  managerId: null,
  minCapacity: null,
  maxCapacity: null,
});
const stats = ref({
  totalRides: 0,
  operationalRides: 0,
  maintenanceRides: 0,
  closedRides: 0,
  totalCapacity: 0,
  averageCapacity: 0,
  averageDuration: 0,
  firstOpenDate: null,
  lastOpenDate: null,
});
const dateRange = ref([null, null]);

const fetchFacilities = async () => {
  loading.value = true;
  try {
    const data = await searchRides({
      ...searchQuery.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    });
    facilities.value = data.amusementRides;
    pagination.value.total = data.totalCount;
  } finally {
    loading.value = false;
  }
};

const fetchStats = async () => {
  const [startDate, endDate] = dateRange.value;
  const data = await getRideStats({ startDate, endDate });
  stats.value = data;
};

const viewFacilityDetail = (facility) => {
  console.log('查看设施详情:', facility);
};

const editFacility = (facility) => {
  console.log('编辑设施:', facility);
  // 打开编辑弹窗或跳转到编辑页面
};

const deleteFacility = async (id) => {
  try {
    await deleteRide(id);
    fetchFacilities(); // 重新加载设施列表
  } catch (error) {
    console.error('删除设施失败:', error);
  }
};

const openAddFacilityDialog = () => {
  console.log('打开新增设施弹窗'); // 添加调试信息
  newFacility.value = {
    rideName: '',
    location: '',
    rideStatus: 1,
    capacity: 10,
    duration: 30,
    heightLimitMin: 120,
    heightLimitMax: 200,
    description: '',
    openDate: null,
    managerId: null,
  };
  isAddDialogVisible.value = true;
};

const addFacility = async () => {
  try {
    console.log('新增设施数据:', newFacility.value); // 添加调试信息
    await createRide(newFacility.value);
    isAddDialogVisible.value = false;
    fetchFacilities(); // 重新加载设施列表
  } catch (error) {
    console.error('新增设施失败:', error);
  }
};

const resetSearch = () => {
  searchQuery.value = {
    keyword: '',
    status: null,
    location: '',
    managerId: null,
    minCapacity: null,
    maxCapacity: null,
  };
  fetchFacilities();
};

onMounted(() => {
  fetchFacilities();
  fetchStats();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.stats-container {
  margin-top: 20px;
}
.stats-card {
  padding: 10px;
}
.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
}
</style>

<template>
  <div class="maintenance-schedule">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>维护计划</span>
          <el-input v-model="searchQuery" placeholder="搜索维护计划" clearable @input="fetchSchedules" />
          <el-button type="primary" @click="openAddDialog">新增维护计划</el-button>
        </div>
      </template>

      <el-table :data="schedules" :loading="loading" @row-click="editSchedule">
        <el-table-column prop="id" label="计划ID" width="100" />
        <el-table-column prop="facilityName" label="设施名称" />
        <el-table-column prop="scheduleDate" label="计划日期" />
        <el-table-column prop="personnel" label="负责人" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" @click.stop="editSchedule(row)">编辑</el-button>
            <el-button size="small" type="danger" @click.stop="deleteSchedule(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="fetchSchedules"
      />
    </el-card>

    <el-dialog v-model="isDialogVisible" title="新增维护计划">
      <el-form :model="form">
        <el-form-item label="设施名称">
          <el-input v-model="form.facilityName" />
        </el-form-item>
        <el-form-item label="计划日期">
          <el-date-picker v-model="form.scheduleDate" type="date" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="form.personnel" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSchedule">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getMaintenanceSchedules, addMaintenanceSchedule, deleteMaintenanceSchedule } from '@/api/maintenance';

const schedules = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const pagination = ref({ page: 1, pageSize: 10, total: 0 });
const isDialogVisible = ref(false);
const form = ref({ facilityName: '', scheduleDate: '', personnel: '' });

const fetchSchedules = async () => {
  loading.value = true;
  try {
    const data = await getMaintenanceSchedules({
      query: searchQuery.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    });
    schedules.value = data.items;
    pagination.value.total = data.total;
  } finally {
    loading.value = false;
  }
};

const openAddDialog = () => {
  console.log('打开新增维护计划弹窗');
  form.value = { facilityName: '', scheduleDate: '', personnel: '' };
  isDialogVisible.value = true;
};

const saveSchedule = async () => {
  await addMaintenanceSchedule(form.value);
  isDialogVisible.value = false;
  fetchSchedules();
};

const editSchedule = (schedule) => {
  form.value = { ...schedule };
  isDialogVisible.value = true;
};

const deleteSchedule = async (id) => {
  await deleteMaintenanceSchedule(id);
  fetchSchedules();
};

onMounted(() => {
  fetchSchedules();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
</style>

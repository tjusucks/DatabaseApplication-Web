<template>
  <div class="maintenance-records">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>维护记录</span>
          <el-input v-model="searchQuery" placeholder="搜索维护记录" clearable @input="fetchRecords" />
          <el-button type="primary" @click="openAddDialog">新增维护记录</el-button>
        </div>
      </template>

      <el-table :data="records" :loading="loading" @row-click="viewRecordDetail">
        <el-table-column prop="id" label="记录ID" width="100" />
        <el-table-column prop="facilityName" label="设施名称" />
        <el-table-column prop="maintenanceDate" label="维护日期" />
        <el-table-column prop="personnel" label="维护人员" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" @click.stop="viewRecordDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="fetchRecords"
      />
    </el-card>

    <el-dialog title="新增维护记录" :visible.sync="isDialogVisible">
      <el-form :model="form" ref="formRef">
        <el-form-item label="设施名称" prop="facilityName">
          <el-input v-model="form.facilityName" />
        </el-form-item>
        <el-form-item label="维护日期" prop="maintenanceDate">
          <el-date-picker v-model="form.maintenanceDate" type="date" placeholder="选择维护日期" />
        </el-form-item>
        <el-form-item label="维护人员" prop="personnel">
          <el-input v-model="form.personnel" />
        </el-form-item>
      </el-form>

      <div class="dialog-footer">
        <el-button @click="isDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRecord">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getMaintenanceRecords, addMaintenanceRecord } from '@/api/maintenance';

const records = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const pagination = ref({ page: 1, pageSize: 10, total: 0 });
const isDialogVisible = ref(false);
const form = ref({ facilityName: '', maintenanceDate: '', personnel: '' });

const fetchRecords = async () => {
  loading.value = true;
  try {
    const data = await getMaintenanceRecords({
      query: searchQuery.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    });
    records.value = data.items;
    pagination.value.total = data.total;
  } finally {
    loading.value = false;
  }
};

const viewRecordDetail = (record) => {
  // 跳转到维护记录详情页面
  console.log('查看维护记录详情:', record);
};

const openAddDialog = () => {
  console.log('打开新增维护记录弹窗');
  form.value = { facilityName: '', maintenanceDate: '', personnel: '' };
  isDialogVisible.value = true;
};

const saveRecord = async () => {
  await addMaintenanceRecord(form.value);
  isDialogVisible.value = false;
  fetchRecords();
};

onMounted(() => {
  fetchRecords();
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

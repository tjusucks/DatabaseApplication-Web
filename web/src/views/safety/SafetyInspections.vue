<template>
  <div class="safety-inspections">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>安全检查记录</span>
          <el-input v-model="searchQuery" placeholder="搜索检查记录" clearable @input="fetchInspections" />
          <el-button type="primary" @click="openAddDialog">新增检查记录</el-button>
        </div>
      </template>

      <el-table :data="inspections" :loading="loading" @row-click="editInspection">
        <el-table-column prop="id" label="记录ID" width="100" />
        <el-table-column prop="facilityName" label="设施名称" />
        <el-table-column prop="inspectionDate" label="检查日期" />
        <el-table-column prop="inspector" label="检查人员" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" @click.stop="editInspection(row)">编辑</el-button>
            <el-button size="small" type="danger" @click.stop="deleteInspection(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="fetchInspections"
      />
    </el-card>

    <el-dialog v-model="isDialogVisible" title="新增检查记录">
      <el-form :model="form">
        <el-form-item label="设施名称">
          <el-input v-model="form.facilityName" />
        </el-form-item>
        <el-form-item label="检查日期">
          <el-date-picker v-model="form.inspectionDate" type="date" />
        </el-form-item>
        <el-form-item label="检查人员">
          <el-input v-model="form.inspector" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveInspection">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getSafetyInspections, addSafetyInspection, deleteSafetyInspection } from '@/api/safety';

const inspections = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const pagination = ref({ page: 1, pageSize: 10, total: 0 });
const isDialogVisible = ref(false);
const form = ref({ facilityName: '', inspectionDate: '', inspector: '' });

const fetchInspections = async () => {
  loading.value = true;
  try {
    const data = await getSafetyInspections({
      query: searchQuery.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    });
    inspections.value = data.items;
    pagination.value.total = data.total;
  } finally {
    loading.value = false;
  }
};

const openAddDialog = () => {
  form.value = { facilityName: '', inspectionDate: '', inspector: '' };
  isDialogVisible.value = true;
};

const saveInspection = async () => {
  await addSafetyInspection(form.value);
  isDialogVisible.value = false;
  fetchInspections();
};

const editInspection = (inspection) => {
  form.value = { ...inspection };
  isDialogVisible.value = true;
};

const deleteInspection = async (id) => {
  await deleteSafetyInspection(id);
  fetchInspections();
};

onMounted(() => {
  fetchInspections();
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

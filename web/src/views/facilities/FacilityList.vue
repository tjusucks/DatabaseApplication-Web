<template>
  <div class="facility-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设施列表</span>
          <el-input v-model="searchQuery" placeholder="搜索设施" clearable @input="fetchFacilities" />
        </div>
      </template>

      <el-table :data="facilities" :loading="loading" @row-click="viewFacilityDetail">
        <el-table-column prop="id" label="设施ID" width="100" />
        <el-table-column prop="name" label="设施名称" />
        <el-table-column prop="status" label="状态" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" @click.stop="viewFacilityDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="fetchFacilities"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFacilities } from '@/api/facilities';

const facilities = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const pagination = ref({ page: 1, pageSize: 10, total: 0 });

const fetchFacilities = async () => {
  loading.value = true;
  try {
    const data = await getFacilities({
      query: searchQuery.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    });
    facilities.value = data.items;
    pagination.value.total = data.total;
  } finally {
    loading.value = false;
  }
};

const viewFacilityDetail = (facility) => {
  console.log('查看设施详情:', facility);
};

onMounted(() => {
  fetchFacilities();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

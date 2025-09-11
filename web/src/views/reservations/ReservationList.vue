<template>
  <PageTemplate title="预订列表" description="查询和管理所有游客的预订信息">
    <el-form :inline="true" :model="queryParams" class="search-bar">
      <el-form :inline="true" :model="queryParams" class="search-bar">
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="预订号/手机号/姓名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="reservations.list" stripe border v-loading="loading">
        <el-table :data="reservations.list" stripe border v-loading="loading">
          <el-table-column prop="reservationId" label="预订号" />
          <el-table-column prop="visitor.user.displayName" label="游客姓名" />
          <el-table-column prop="visitor.user.phoneNumber" label="手机号" />
          <el-table-column prop="reservationTime" label="预订时间" />
          <el-table-column prop="totalAmount" label="总金额" />
          <el-table-column label="操作" fixed="right" align="center">
            <el-table-column prop="visitor.user.displayName" label="游客姓名" />
            <el-table-column prop="visitor.user.phoneNumber" label="手机号" />
            <el-table-column prop="reservationTime" label="预订时间" />
            <el-table-column prop="totalAmount" label="总金额" />
            <el-table-column label="操作" fixed="right" align="center">
              <template #default="{ row }">
                <el-button size="small" type="primary" link icon="View" @click="viewDetails(row.reservationId)">
                  查看详情
                </el-button>
              </template>
            </el-table-column>
        </el-table>
        <div class="pagination-container">
          <el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="reservations.total"
            v-model:current-page="queryParams.page" v-model:page-size="queryParams.size" @size-change="loadData"
            @current-change="loadData" />
        </div>
  </PageTemplate>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useReservationStore } from "@/stores/tickets.js";
import { storeToRefs } from "pinia";
import PageTemplate from "@/components/PageTemplate.vue";

const router = useRouter();
const reservationStore = useReservationStore();
const { reservations } = storeToRefs(reservationStore);
const { fetchReservations } = reservationStore;
const loading = ref(false);
const queryParams = reactive({ keyword: "", page: 1, size: 10 });

const handleSearch = () => {
  queryParams.page = 1;
  loadData();
};
const viewDetails = (id) => router.push(`/reservations/${id}`);
const loadData = async () => {
  loading.value = true;
  await fetchReservations(queryParams);
  loading.value = false;
};

onMounted(loadData);
</script>

<style scoped>
.search-bar {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>

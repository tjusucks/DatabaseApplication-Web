<template>
  <PageTemplate title="预订列表" description="查询和管理所有游客的预订信息">
    <el-form :inline="true" :model="queryParams">
      <el-form-item label="关键词">
        <el-input v-model="queryParams.keyword" placeholder="预订号/手机号" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch"
          >查询</el-button
        >
      </el-form-item>
    </el-form>
    <el-table :data="reservations.list" v-loading="loading" border>
      <el-table-column prop="reservationId" label="预订号" />
      <el-table-column prop="visitorName" label="游客姓名" />
      <el-table-column prop="phoneNumber" label="手机号" />
      <el-table-column prop="reservationDate" label="预订时间" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button size="small" @click="viewDetails(row.reservationId)"
            >查看详情</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </PageTemplate>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
// [已修正]
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

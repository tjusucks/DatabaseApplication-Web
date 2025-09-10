<template>
  <PageTemplate
    title="预订管理系统"
    description="查询和管理所有游客的预订信息"
    icon="List"
  >
    <el-form :inline="true" :model="queryParams">
      <el-form-item label="关键词">
        <el-input
          v-model="queryParams.keyword"
          placeholder="预订号/手机号"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="bookings.list" v-loading="loading" style="width: 100%">
      <el-table-column prop="bookingId" label="预订号" />
      <el-table-column prop="ticketName" label="门票名称" />
      <el-table-column prop="quantity" label="数量" />
      <el-table-column prop="totalAmount" label="总金额" />
      <el-table-column prop="visitorPhone" label="手机号" />
      <el-table-column prop="bookingTime" label="预订时间" />
      <el-table-column label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 'CONFIRMED' ? 'success' : 'warning'">
            {{ row.status === "CONFIRMED" ? "已确认" : "待支付" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" @click="handleViewDetails(row)"
            >详情</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="margin-top: 20px"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="bookings.total"
      v-model:current-page="queryParams.page"
      v-model:page-size="queryParams.size"
      @size-change="fetchData"
      @current-change="fetchData"
    />
  </PageTemplate>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useTicketStore } from "@/stores/ticket";
import { storeToRefs } from "pinia";
import PageTemplate from '@/components/PageTemplate.vue'; // 引入通用模板

const ticketStore = useTicketStore();
const { bookings } = storeToRefs(ticketStore);

const loading = ref(false);
const queryParams = reactive({ keyword: "", page: 1, size: 10 });

const fetchData = async () => {
  loading.value = true;
  await ticketStore.fetchBookings(queryParams);
  loading.value = false;
};

const handleSearch = () => {
  queryParams.page = 1;
  fetchData();
};

const handleViewDetails = (row) => {
  console.log("View details for:", row);
};

onMounted(() => {
  fetchData();
});
</script>

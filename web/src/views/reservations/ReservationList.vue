<template>
  <PageTemplate
    title="预订列表"
    description="查询和管理所有游客的预订信息"
    icon="Memo"
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
        <el-button type="primary" icon="Search">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="bookings" border style="width: 100%">
      <el-table-column prop="bookingId" label="预订号" />
      <el-table-column prop="ticketName" label="门票名称" />
      <el-table-column prop="quantity" label="数量" />
      <el-table-column prop="visitorPhone" label="手机号" />
      <el-table-column prop="bookingTime" label="预订时间" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" @click="viewDetails(row.id)"
            >查看详情</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </PageTemplate>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import PageTemplate from "@/components/PageTemplate.vue";

const router = useRouter();
const queryParams = reactive({ keyword: "" });
const bookings = ref([
  {
    id: "R1001",
    bookingId: "BK20240521001",
    ticketName: "成人全天票",
    quantity: 2,
    visitorPhone: "138****1234",
    bookingTime: "2024-05-21 10:30:00",
  },
  {
    id: "R1002",
    bookingId: "BK20240521002",
    ticketName: "家庭套餐",
    quantity: 1,
    visitorPhone: "139****5678",
    bookingTime: "2024-05-21 11:00:00",
  },
]);

const viewDetails = (id) => {
  router.push(`/reservations/${id}`);
};
</script>

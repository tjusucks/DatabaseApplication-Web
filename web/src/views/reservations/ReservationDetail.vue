<template>
  <PageTemplate
    :title="`预订详情 - ${reservationId}`"
    description="查看单个预订的详细信息、票据和游客资料"
    icon="Document"
  >
    <el-descriptions v-if="details" border :column="2">
      <el-descriptions-item label="预订号">{{
        details.bookingId
      }}</el-descriptions-item>
      <el-descriptions-item label="预订状态">
        <el-tag type="success">{{ details.status }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="门票名称">{{
        details.ticketName
      }}</el-descriptions-item>
      <el-descriptions-item label="数量">{{
        details.quantity
      }}</el-descriptions-item>
      <el-descriptions-item label="总金额"
        >¥{{ details.totalAmount }}</el-descriptions-item
      >
      <el-descriptions-item label="预订时间">{{
        details.bookingTime
      }}</el-descriptions-item>
      <el-descriptions-item label="游客手机号">{{
        details.visitorPhone
      }}</el-descriptions-item>
      <el-descriptions-item label="游客姓名">{{
        details.visitorName
      }}</el-descriptions-item>
    </el-descriptions>
    <el-skeleton v-else :rows="5" animated />
  </PageTemplate>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import PageTemplate from "@/components/PageTemplate.vue";

const route = useRoute();
const reservationId = ref(route.params.id);
const details = ref(null);

onMounted(() => {
  // 模拟API调用
  setTimeout(() => {
    details.value = {
      id: reservationId.value,
      bookingId: "BK20240521001",
      status: "已确认",
      ticketName: "成人全天票",
      quantity: 2,
      totalAmount: "360.00",
      bookingTime: "2024-05-21 10:30:00",
      visitorPhone: "138****1234",
      visitorName: "张三",
    };
  }, 300);
});
</script>

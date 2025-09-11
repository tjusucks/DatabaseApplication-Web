<template>
  <PageTemplate title="销售统计" description="查看销售数据、趋势和关键指标">
    <el-row :gutter="20" v-if="statistics">
      <el-col :span="6">
        <el-statistic title="总销售额" :value="statistics.totalRevenue" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="总售出票数" :value="statistics.totalTicketsSold" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="总退款额" :value="statistics.totalRefundAmount" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="总退款数" :value="statistics.totalRefunds" />
      </el-col>
    </el-row>
    <el-skeleton v-else :rows="1" animated />
  </PageTemplate>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useTicketStore } from "@/stores/tickets.js";
import { storeToRefs } from "pinia";
import PageTemplate from "@/components/PageTemplate.vue";

const ticketStore = useTicketStore();
const { statistics } = storeToRefs(ticketStore);
const { fetchStatistics } = ticketStore;
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  await fetchStatistics();
  // 模拟数据
  if (!statistics.value) {
    statistics.value = {
      totalRevenue: 125000,
      totalTicketsSold: 850,
      totalRefundAmount: 3200,
      totalRefunds: 15,
    };
  }
  loading.value = false;
});
</script>

<style scoped>
.el-statistic {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  border-radius: 8px;
  text-align: center;
}
</style>

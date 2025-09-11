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

// /src/views/tickets/TicketStatistics.vue

<script setup>
import { ref, onMounted } from 'vue'
import { useTicketStore } from '@/stores/tickets.js' // 确保路径正确
import { storeToRefs } from 'pinia'
import PageTemplate from '@/components/PageTemplate.vue'

// 1. 初始化 store
const ticketStore = useTicketStore()

// 2. 解构 state (这是正确的)
const { statistics } = storeToRefs(ticketStore)

// 3. [已删除] 错误地解构 action
// const { fetchStatistics } = ticketStore;

// 4. 本地状态
const loading = ref(false)

// 5. 生命周期钩子
onMounted(async () => {
  loading.value = true

  // [最终修正] 直接通过 store 实例调用 action
  await ticketStore.fetchStatistics()

  // 模拟数据部分应移至 store 中，但为保持功能暂时保留
  if (!statistics.value) {
    statistics.value = {
      totalRevenue: 125000,
      totalTicketsSold: 850,
      totalRefundAmount: 3200,
      totalRefunds: 15,
    };
  }

  loading.value = false
})
</script>

<style scoped>
.el-statistic {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  border-radius: 8px;
  text-align: center;
}
</style>

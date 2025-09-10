<template>
  <PageTemplate title="销售统计" description="查看销售数据、趋势和关键指标">
    <el-card shadow="hover" v-if="statistics" v-loading="loading">
      <p>今日销售总额: ¥ {{ statistics.totalRevenue }}</p>
    </el-card>
  </PageTemplate>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// [已修正]
import { useTicketStore } from '@/stores/tickets.js'
import { storeToRefs } from 'pinia'
import PageTemplate from '@/components/PageTemplate.vue'

const ticketStore = useTicketStore()
const { statistics } = storeToRefs(ticketStore)
const { fetchStatistics } = ticketStore
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  await fetchStatistics()
  loading.value = false
})
</script>

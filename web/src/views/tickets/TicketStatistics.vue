<template>
  <PageTemplate title="销售统计" description="查看门票销售数据和统计报表" icon="TrendCharts" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTicketStore } from '@/stores/ticket'
import * as echarts from 'echarts'
import PageTemplate from '@/components/PageTemplate.vue' // 引入通用模板

const ticketStore = useTicketStore()
const statsData = ref(null)
const salesChartRef = ref(null)
let chartInstance = null

const initChart = (data) => {
  if (salesChartRef.value) {
    chartInstance = echarts.init(salesChartRef.value)
    const option = {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: data.labels },
      yAxis: { type: 'value' },
      series: [{ name: '销售额', type: 'line', data: data.values, smooth: true }],
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    }
    chartInstance.setOption(option)
  }
}

onMounted(async () => {
  statsData.value = await ticketStore.fetchStatistics()
  if (statsData.value && statsData.value.trend) {
    initChart(statsData.value.trend)
  }
  window.addEventListener('resize', () => chartInstance?.resize())
})

onUnmounted(() => {
  chartInstance?.dispose()
  window.removeEventListener('resize', () => chartInstance?.resize())
})
</script>

<style scoped>
.stat-item {
  text-align: center;
}
.stat-title {
  color: #909399;
  font-size: 14px;
  margin-bottom: 10px;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
}
</style>

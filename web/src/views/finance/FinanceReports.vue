<template>
  <PageTemplate 
    title="财务报表" 
    description="生成和查看各类财务报表"
    icon="Document"
  >
    <template #header>
      <el-form :inline="true" :model="filterForm" @submit.prevent="loadReports">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="loadReports"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadReports">生成报表</el-button>
        </el-form-item>
      </el-form>
    </template>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="always">
          <div class="stat-card">
            <div class="stat-title">总收入</div>
            <div class="stat-value income">{{ formatCurrency(overview.totalIncome) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="always">
          <div class="stat-card">
            <div class="stat-title">总支出</div>
            <div class="stat-value expense">{{ formatCurrency(overview.totalExpenses) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="always">
          <div class="stat-card">
            <div class="stat-title">净利润</div>
            <div class="stat-value profit">{{ formatCurrency(overview.netProfit) }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <div ref="trendsChart" style="width: 100%; height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <div ref="incomePieChart" style="width: 100%; height: 400px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div ref="expenseBarChart" style="width: 100%; height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>

  </PageTemplate>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import PageTemplate from '@/components/PageTemplate.vue'
import { useFinanceStore } from '@/stores/finance'

const financeStore = useFinanceStore()

const filterForm = reactive({
  dateRange: [],
})

const overview = computed(() => financeStore.overview)
const groupedStats = computed(() => financeStore.groupedStats)

const trendsChart = ref(null)
const incomePieChart = ref(null)
const expenseBarChart = ref(null)

let trendsChartInstance = null
let incomePieChartInstance = null
let expenseBarChartInstance = null

const loadReports = async () => {
  const params = {
    startDate: filterForm.dateRange?.[0] || undefined,
    endDate: filterForm.dateRange?.[1] || undefined,
  }
  await Promise.all([
    financeStore.fetchOverview(params),
    financeStore.fetchGroupedStats({ ...params, groupBy: 'source' }),
  ])
  await nextTick()
  updateCharts()
}

onMounted(() => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 1)
  filterForm.dateRange = [startDate, endDate]
  
  trendsChartInstance = echarts.init(trendsChart.value)
  incomePieChartInstance = echarts.init(incomePieChart.value)
  expenseBarChartInstance = echarts.init(expenseBarChart.value)
  
  loadReports()
  
  window.addEventListener('resize', resizeCharts)
})

watch(groupedStats, updateCharts, { deep: true })

const updateCharts = () => {
  if (!trendsChartInstance || !incomePieChartInstance || !expenseBarChartInstance) return

  // 趋势图
  const dailyStats = financeStore.groupedStats.filter(s => s.groupBy === 'date');
  trendsChartInstance.setOption({
    title: { text: '收支趋势' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['收入', '支出'] },
    xAxis: { type: 'category', data: dailyStats.map(s => s.key) },
    yAxis: { type: 'value' },
    series: [
      { name: '收入', type: 'line', data: dailyStats.map(s => s.totalIncome) },
      { name: '支出', type: 'line', data: dailyStats.map(s => s.totalExpenses) }
    ]
  });

  // 收入构成饼图
  const incomeData = financeStore.groupedStats
    .filter(s => s.transactionType === 'income' && s.groupBy === 'source')
    .map(item => ({ value: item.totalAmount, name: item.key }))
  incomePieChartInstance.setOption({
    title: { text: '收入来源构成', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{ type: 'pie', radius: '50%', data: incomeData }]
  });

  // 支出构成条形图
  const expenseData = financeStore.groupedStats
    .filter(s => s.transactionType === 'expense' && s.groupBy === 'source')
  expenseBarChartInstance.setOption({
    title: { text: '支出分类排行' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: expenseData.map(item => item.key) },
    series: [{ type: 'bar', data: expenseData.map(item => item.totalAmount) }]
  });
}

const resizeCharts = () => {
  trendsChartInstance?.resize()
  incomePieChartInstance?.resize()
  expenseBarChartInstance?.resize()
}

const formatCurrency = (value) => {
  if (typeof value !== 'number') return '¥ 0.00'
  return `¥ ${value.toFixed(2)}`
}

</script>

<style scoped>
.stat-card {
  text-align: center;
}
.stat-title {
  font-size: 16px;
  color: #606266;
  margin-bottom: 10px;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
}
.income {
  color: #67C23A;
}
.expense {
  color: #F56C6C;
}
.profit {
  color: #409EFF;
}
</style>

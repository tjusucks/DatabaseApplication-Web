<template>
  <FinancePageTemplate title="财务报表" description="分析和可视化财务数据" icon="DataAnalysis">
    <template #header>
      <div class="header-controls">
        <el-form :inline="true" :model="filterForm" class="search-form">
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              clearable
              style="width: 240px"
              :shortcuts="dateShortcuts"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter" :icon="Search">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </template>

    <!-- 财务总览 -->
    <el-row :gutter="20" class="overview-cards" v-loading="overviewLoading">
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic
            title="总收入 (元)"
            :value="overviewData.totalIncome || 0"
            :precision="2"
          ></el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic
            title="总支出 (元)"
            :value="overviewData.totalExpense || 0"
            :precision="2"
          ></el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic
            title="净利润 (元)"
            :value="overviewData.netProfit || 0"
            :precision="2"
          ></el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="利润率 (%)" :value="overviewData.profitMargin || 0" :precision="2">
            <template #suffix>%</template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>收支趋势</template>
          <div ref="trendChart" style="height: 400px" v-loading="trendLoading"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>收支构成</template>
          <div ref="compositionChart" style="height: 400px" v-loading="overviewLoading"></div>
        </el-card>
      </el-col>
    </el-row>
  </FinancePageTemplate>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive, nextTick } from 'vue'
import FinancePageTemplate from '@/views/finance/components/FinancePageTemplate.vue'
import { useFinanceStore } from '@/stores/finance'
import { Search } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const financeStore = useFinanceStore()

const filterForm = reactive({
  dateRange: [],
})

const overviewLoading = ref(false)
const trendLoading = ref(false)

const overviewData = ref({})
const trendChart = ref(null)
const compositionChart = ref(null)

let trendChartInstance = null
let compositionChartInstance = null

const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 1)
      return [start, end]
    },
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 3)
      return [start, end]
    },
  },
]

// 辅助函数：将 Date 对象格式化为 'YYYY-MM-DD' 字符串，忽略时区
const formatDateToYYYYMMDD = (date) => {
  if (!date) return undefined
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getQueryParams = () => {
  let startDate, endDate
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    startDate = filterForm.dateRange[0]
    endDate = new Date(filterForm.dateRange[1])
    // 注意：这里不再需要 setHours，因为我们只关心日期部分
  }
  return {
    startDate: formatDateToYYYYMMDD(startDate),
    endDate: formatDateToYYYYMMDD(endDate),
  }
}

const handleFilter = async () => {
  // 使用 Promise.all 并行获取数据，并统一处理 loading 状态
  overviewLoading.value = true
  trendLoading.value = true
  try {
    // fetchOverviewData 和 fetchTrendData 内部会分别设置自己的 loading 为 false
    await Promise.all([fetchOverviewData(), fetchTrendData()])
  } catch (error) {
    // 如果任何一个请求失败，确保 loading 状态被重置
    console.error('查询财务数据时出错:', error)
    overviewLoading.value = false
    trendLoading.value = false
  }
}

const fetchOverviewData = async () => {
  overviewLoading.value = true
  try {
    const params = getQueryParams()
    const data = await financeStore.fetchOverview(params)
    overviewData.value = data
    updateCompositionChart()
  } catch (error) {
    console.error('获取财务概览失败:', error)
    overviewData.value = {} // 清空数据
    updateCompositionChart() // 更新图表以显示“无数据”
  } finally {
    overviewLoading.value = false
  }
}

const fetchTrendData = async () => {
  trendLoading.value = true
  try {
    const queryParams = getQueryParams()
    // 即使没有日期范围，也尝试获取，让后端处理
    const data = await financeStore.fetchTrendDataByDay(queryParams)
    updateTrendChart(data)
  } catch (error) {
    console.error('获取趋势数据失败:', error)
    updateTrendChart([]) // 出错时清空图表
  } finally {
    trendLoading.value = false
  }
}

const initCharts = () => {
  if (trendChart.value) {
    trendChartInstance = echarts.init(trendChart.value)
  }
  if (compositionChart.value) {
    compositionChartInstance = echarts.init(compositionChart.value)
  }
}

const updateTrendChart = (data = []) => {
  if (!trendChartInstance) return

  if (!data || data.length === 0) {
    trendChartInstance.setOption(
      {
        title: { text: '暂无数据', left: 'center', top: 'center', textStyle: { color: '#909399' } },
        xAxis: { show: false },
        yAxis: { show: false },
        series: [],
        tooltip: { show: false },
        legend: { show: false },
      },
      true,
    ) // `true` 清除旧的配置
    return
  }

  const dates = data.map((item) => item.date)
  const incomes = data.map((item) => item.totalIncome)
  const expenses = data.map((item) => item.totalExpense)

  const option = {
    title: { show: false }, // 确保清除“暂无数据”的标题
    tooltip: { trigger: 'axis' },
    legend: { data: ['收入', '支出'], top: 'bottom' },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: dates },
    yAxis: { type: 'value', axisLabel: { formatter: '{value} 元' } },
    series: [
      { name: '收入', type: 'line', smooth: true, data: incomes, itemStyle: { color: '#67C23A' } },
      { name: '支出', type: 'line', smooth: true, data: expenses, itemStyle: { color: '#F56C6C' } },
    ],
  }
  trendChartInstance.setOption(option, true) // `true` 清除旧的配置
}

const updateCompositionChart = () => {
  if (!compositionChartInstance) return

  const totalIncome = overviewData.value.totalIncome || 0
  const totalExpense = overviewData.value.totalExpense || 0

  if (totalIncome === 0 && totalExpense === 0) {
    compositionChartInstance.setOption(
      {
        title: { text: '暂无数据', left: 'center', top: 'center', textStyle: { color: '#909399' } },
        series: [],
        tooltip: { show: false },
        legend: { show: false },
      },
      true,
    ) // `true` 清除旧的配置
    return
  }

  const option = {
    title: { show: false }, // 确保清除“暂无数据”的标题
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c}元 ({d}%)' },
    legend: { top: 'bottom' },
    series: [
      {
        name: '收支构成',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: '20', fontWeight: 'bold' } },
        labelLine: { show: false },
        data: [
          { value: totalIncome, name: '总收入', itemStyle: { color: '#67C23A' } },
          { value: totalExpense, name: '总支出', itemStyle: { color: '#F56C6C' } },
        ],
      },
    ],
  }
  compositionChartInstance.setOption(option, true) // `true` 清除旧的配置
}

const resetFilter = () => {
  filterForm.dateRange = []
  handleFilter()
}

const resizeCharts = () => {
  trendChartInstance?.resize()
  compositionChartInstance?.resize()
}

onMounted(() => {
  // 设置默认查询最近一个月
  const end = new Date()
  const start = new Date()
  start.setMonth(start.getMonth() - 1)
  filterForm.dateRange = [start, end]

  // 初始化时立即显示加载状态
  overviewLoading.value = true
  trendLoading.value = true

  nextTick(() => {
    initCharts()
    handleFilter()
  })

  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  trendChartInstance?.dispose()
  compositionChartInstance?.dispose()
})
</script>

<style scoped>
.header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.search-form .el-form-item {
  margin-bottom: 0;
}
.overview-cards .el-card {
  text-align: center;
}
.overview-cards .el-statistic {
  --el-statistic-title-font-size: 16px;
  --el-statistic-content-font-size: 28px;
}
</style>

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
          <el-form-item label="分组方式">
            <el-select
              v-model="filterForm.groupBy"
              placeholder="请选择分组方式"
              style="width: 120px"
            >
              <el-option
                v-for="option in groupByOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
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
            :value="parseFloat(overviewData.totalIncome || overviewData.income || 0).toFixed(2)"
            :precision="2"
          ></el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic
            title="总支出 (元)"
            :value="parseFloat(overviewData.totalExpense || overviewData.expense || 0).toFixed(2)"
            :precision="2"
          ></el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic
            title="净利润 (元)"
            :value="parseFloat(overviewData.netProfit || overviewData.profit || 0).toFixed(2)"
            :precision="2"
          ></el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic
            title="利润率 (%)"
            :value="parseFloat(overviewData.profitMargin || overviewData.margin || 0).toFixed(2)"
            :precision="2"
          >
            <template #suffix>%</template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 票务销售统计 -->
    <el-row
      :gutter="20"
      class="ticket-stats-cards"
      style="margin-top: 20px"
      v-loading="ticketStatsLoading"
    >
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic
            title="门票销售总额 (元)"
            :value="
              parseFloat(
                ticketStatsData.totalSalesAmount || ticketStatsData.totalAmount || 0,
              ).toFixed(2)
            "
            :precision="2"
          ></el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic
            title="总销售数量"
            :value="parseInt(ticketStatsData.totalSalesCount || ticketStatsData.totalCount || 0)"
          ></el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic
            title="平均票价 (元)"
            :value="
              parseFloat(
                ticketStatsData.averageTicketPrice || ticketStatsData.averagePrice || 0,
              ).toFixed(2)
            "
            :precision="2"
          ></el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic
            title="热门票种"
            :value="
              ticketStatsData.mostPopularTicketType || ticketStatsData.popularTicketType || '无数据'
            "
          ></el-statistic>
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

    <!-- 票务销售趋势图 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>票务销售趋势</template>
          <div ref="ticketTrendChart" style="height: 400px" v-loading="ticketTrendLoading"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 分组统计数据 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card shadow="never" v-loading="groupedStatsLoading">
          <template #header>分组统计数据</template>
          <el-table :data="groupedStatsData" style="width: 100%" max-height="400">
            <el-table-column prop="key" label="分组" min-width="150">
              <template #default="scope">
                {{ scope.row.key || scope.row.name || scope.row.groupName || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="value" label="金额" min-width="120">
              <template #default="scope">
                ¥{{ formatCurrency(scope.row.value || scope.row.total || scope.row.amount || 0) }}
              </template>
            </el-table-column>
            <el-table-column prop="count" label="数量" min-width="100">
              <template #default="scope">
                {{ scope.row.count || scope.row.quantity || scope.row.totalCount || 0 }}
              </template>
            </el-table-column>
            <el-table-column label="平均值" min-width="120">
              <template #default="scope"> ¥{{ calculateAverage(scope.row) }} </template>
            </el-table-column>
          </el-table>
          <div
            v-if="groupedStatsData.length === 0"
            style="text-align: center; padding: 20px; color: #909399"
          >
            暂无数据
          </div>
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
  groupBy: 'Date', // Default grouping by date
})

const groupByOptions = [
  { label: '日期', value: 'Date' },
  { label: '交易类型', value: 'TransactionType' },
  { label: '支付方式', value: 'PaymentMethod' },
]

// Group by options explanation:
// Date: Group financial records by date
// TransactionType: Group by income/expense types
// PaymentMethod: Group by payment methods (cash, card, etc.)

const overviewLoading = ref(false)
const trendLoading = ref(false)
const ticketStatsLoading = ref(false)
const ticketTrendLoading = ref(false)
const groupedStatsLoading = ref(false)

const overviewData = ref({})
const ticketStatsData = ref({})
const groupedStatsData = ref([])
const trendChart = ref(null)
const compositionChart = ref(null)
const ticketTrendChart = ref(null)

let trendChartInstance = null
let compositionChartInstance = null
let ticketTrendChartInstance = null

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
  ticketStatsLoading.value = true
  ticketTrendLoading.value = true
  groupedStatsLoading.value = true
  try {
    // fetchOverviewData 和 fetchTrendData 内部会分别设置自己的 loading 为 false
    await Promise.all([
      fetchOverviewData(),
      fetchTrendData(),
      fetchTicketStatsData(),
      fetchTicketTrendData(),
      fetchGroupedStatsData(),
    ])
  } catch (error) {
    // 如果任何一个请求失败，确保 loading 状态被重置
    console.error('查询财务数据时出错:', error)
    overviewLoading.value = false
    trendLoading.value = false
    ticketStatsLoading.value = false
    ticketTrendLoading.value = false
    groupedStatsLoading.value = false
  }
}

const fetchOverviewData = async () => {
  overviewLoading.value = true
  try {
    const params = getQueryParams()
    const data = await financeStore.fetchOverview(params)
    // Handle different response structures
    if (data && typeof data === 'object') {
      overviewData.value = data
    } else {
      overviewData.value = {}
    }
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
    // Ensure data is an array
    const dataArray = Array.isArray(data) ? data : []
    updateTrendChart(dataArray)
  } catch (error) {
    console.error('获取趋势数据失败:', error)
    updateTrendChart([]) // 出错时清空图表
  } finally {
    trendLoading.value = false
  }
}

const fetchTicketStatsData = async () => {
  ticketStatsLoading.value = true
  try {
    const params = getQueryParams()
    const data = await financeStore.fetchTicketSalesStats(params)
    // Handle different response structures
    if (data && typeof data === 'object') {
      ticketStatsData.value = data
    } else {
      ticketStatsData.value = {}
    }
  } catch (error) {
    console.error('获取票务销售统计失败:', error)
    ticketStatsData.value = {} // 清空数据
  } finally {
    ticketStatsLoading.value = false
  }
}

const fetchGroupedStatsData = async () => {
  groupedStatsLoading.value = true
  try {
    const params = {
      ...getQueryParams(),
      groupBy: filterForm.groupBy,
    }
    const data = await financeStore.fetchGroupedStats(params)
    // Handle different response structures
    if (Array.isArray(data)) {
      groupedStatsData.value = data
    } else if (data && Array.isArray(data.groups)) {
      groupedStatsData.value = data.groups
    } else if (data && Array.isArray(data.data)) {
      groupedStatsData.value = data.data
    } else {
      groupedStatsData.value = []
    }
  } catch (error) {
    console.error('获取分组统计失败:', error)
    groupedStatsData.value = [] // 清空数据
  } finally {
    groupedStatsLoading.value = false
  }
}

const fetchTicketTrendData = async () => {
  ticketTrendLoading.value = true
  try {
    const params = getQueryParams()
    // For trend data, we might need to implement a specific function
    // For now, let's use the grouped stats with date grouping
    const data = await financeStore.fetchTicketSalesGroupedStats({
      ...params,
      groupBy: 'Date',
    })
    // Handle different response structures
    let groupsData = []
    if (Array.isArray(data)) {
      groupsData = data
    } else if (data && Array.isArray(data.groups)) {
      groupsData = data.groups
    } else if (data && Array.isArray(data.data)) {
      groupsData = data.data
    }
    updateTicketTrendChart(groupsData)
  } catch (error) {
    console.error('获取票务销售趋势失败:', error)
    updateTicketTrendChart([]) // 出错时清空图表
  } finally {
    ticketTrendLoading.value = false
  }
}

const initCharts = () => {
  if (trendChart.value) {
    trendChartInstance = echarts.init(trendChart.value)
  }
  if (compositionChart.value) {
    compositionChartInstance = echarts.init(compositionChart.value)
  }
  if (ticketTrendChart.value) {
    ticketTrendChartInstance = echarts.init(ticketTrendChart.value)
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

  // Handle different data structures
  const dates = data.map((item) => item.date || item.key || item.name || '')
  const incomes = data.map((item) => parseFloat(item.totalIncome || item.income || item.value || 0))
  const expenses = data.map((item) =>
    parseFloat(item.totalExpense || item.expense || item.cost || 0),
  )

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

  const totalIncome = parseFloat(overviewData.value.totalIncome || 0)
  const totalExpense = parseFloat(overviewData.value.totalExpense || 0)

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
    title: { show: false }, // 确保清除"暂无数据"的标题
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

const updateTicketTrendChart = (data = []) => {
  if (!ticketTrendChartInstance) return

  if (!data || data.length === 0) {
    ticketTrendChartInstance.setOption(
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

  // Handle different data structures
  const dates = data.map((item) => item.key || item.date || item.name || '')
  const salesAmounts = data.map((item) =>
    parseFloat(item.value || item.totalAmount || item.amount || 0),
  )
  const salesCounts = data.map((item) =>
    parseInt(item.count || item.quantity || item.totalCount || 0),
  )

  const option = {
    title: { show: false }, // 确保清除"暂无数据"的标题
    tooltip: { trigger: 'axis' },
    legend: { data: ['销售额', '销售数量'], top: 'bottom' },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: dates },
    yAxis: [
      { type: 'value', axisLabel: { formatter: '{value} 元' } },
      { type: 'value', axisLabel: { formatter: '{value} 张' } },
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        smooth: true,
        data: salesAmounts,
        itemStyle: { color: '#409EFF' },
        yAxisIndex: 0,
      },
      {
        name: '销售数量',
        type: 'bar',
        data: salesCounts,
        itemStyle: { color: '#67C23A' },
        yAxisIndex: 1,
      },
    ],
  }
  ticketTrendChartInstance.setOption(option, true) // `true` 清除旧的配置
}

const resetFilter = () => {
  filterForm.dateRange = []
  filterForm.groupBy = 'Date' // Reset to default grouping
  handleFilter()
}

// Helper functions for data formatting
const formatCurrency = (value) => {
  return parseFloat(value || 0).toFixed(2)
}

const calculateAverage = (row) => {
  const value = parseFloat(row.value || row.total || row.amount || 0)
  const count = parseInt(row.count || row.quantity || row.totalCount || 0)
  if (count > 0) {
    return (value / count).toFixed(2)
  }
  return '0.00'
}

const resizeCharts = () => {
  trendChartInstance?.resize()
  compositionChartInstance?.resize()
  ticketTrendChartInstance?.resize()
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
  ticketStatsLoading.value = true
  groupedStatsLoading.value = true

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
  ticketTrendChartInstance?.dispose()
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

.ticket-stats-cards .el-card {
  text-align: center;
}

.ticket-stats-cards .el-statistic {
  --el-statistic-title-font-size: 16px;
  --el-statistic-content-font-size: 24px;
}
</style>

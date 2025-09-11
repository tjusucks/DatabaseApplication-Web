<template>
  <PageTemplate title="财务报表" description="查看和分析公园的财务数据" icon="DataAnalysis">
    <!-- 财务总览 -->
    <el-row :gutter="20" class="summary-cards">
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="card-content">
            <div class="icon-wrapper" style="background-color: #e7f4ff;">
              <el-icon :size="32" color="#409EFF"><Coin /></el-icon>
            </div>
            <div class="text-wrapper">
              <p class="label">总收入</p>
              <h3 class="value">{{ summary.totalIncome?.toFixed(2) || '0.00' }} 元</h3>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="card-content">
            <div class="icon-wrapper" style="background-color: #fff0f0;">
              <el-icon :size="32" color="#F56C6C"><Collection /></el-icon>
            </div>
            <div class="text-wrapper">
              <p class="label">总支出</p>
              <h3 class="value">{{ summary.totalExpenses?.toFixed(2) || '0.00' }} 元</h3>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="card-content">
            <div class="icon-wrapper" style="background-color: #e9fbf4;">
              <el-icon :size="32" color="#67C23A"><DataLine /></el-icon>
            </div>
            <div class="text-wrapper">
              <p class="label">净利润</p>
              <h3 class="value">{{ summary.netProfit?.toFixed(2) || '0.00' }} 元</h3>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>按类型分组的财务统计</template>
          <div ref="groupedChart" style="height: 400px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <span>按时间段统计</span>
              <el-date-picker
                v-model="timeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="fetchTimeData"
                style="width: 250px;"
              />
            </div>
          </template>
          <div ref="timeChart" style="height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </PageTemplate>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import PageTemplate from '@/components/PageTemplate.vue'
import { useFinanceStore } from '@/stores/finance'
import * as echarts from 'echarts'
import { Coin, Collection, DataLine } from '@element-plus/icons-vue'

const financeStore = useFinanceStore()
const summary = ref({})
const timeRange = ref([])

// ECharts 实例
const groupedChart = ref(null)
const timeChart = ref(null)
let groupedChartInstance = null
let timeChartInstance = null

// 初始化 ECharts
const initCharts = () => {
  if (groupedChart.value) {
    groupedChartInstance = echarts.init(groupedChart.value)
  }
  if (timeChart.value) {
    timeChartInstance = echarts.init(timeChart.value)
  }
}

// 更新分组统计图表
const updateGroupedChart = (data) => {
  if (!groupedChartInstance) return
  const option = {
    tooltip: { trigger: 'item' },
    legend: { top: '5%', left: 'center' },
    series: [
      {
        name: '财务统计',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: '20', fontWeight: 'bold' }
        },
        labelLine: { show: false },
        data: data.map(item => ({ value: item.amount, name: item.type }))
      }
    ]
  }
  groupedChartInstance.setOption(option)
}

// 更新时间段统计图表
const updateTimeChart = (data) => {
  if (!timeChartInstance) return
  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date)
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '收入',
        type: 'line',
        data: data.map(item => item.income),
        smooth: true
      },
      {
        name: '支出',
        type: 'line',
        data: data.map(item => item.expense),
        smooth: true
      }
    ]
  }
  timeChartInstance.setOption(option)
}

// 获取数据
const fetchData = async () => {
  await financeStore.fetchFinanceSummary()
  summary.value = financeStore.summary

  await financeStore.fetchFinanceGroupedByType()
  await nextTick()
  updateGroupedChart(financeStore.groupedStats)
  
  await fetchTimeData()
}

const fetchTimeData = async () => {
  const params = {
    startDate: timeRange.value?.[0] || undefined,
    endDate: timeRange.value?.[1] || undefined,
  }
  await financeStore.fetchFinanceOverTime(params)
  await nextTick()
  updateTimeChart(financeStore.timeStats)
}

onMounted(async () => {
  initCharts()
  await fetchData()
  window.addEventListener('resize', () => {
    groupedChartInstance?.resize()
    timeChartInstance?.resize()
  })
})

watch(() => financeStore.groupedStats, (newData) => {
  updateGroupedChart(newData)
})

watch(() => financeStore.timeStats, (newData) => {
  updateTimeChart(newData)
})
</script>

<style scoped>
.summary-cards .el-card {
  border-radius: 10px;
}
.card-content {
  display: flex;
  align-items: center;
}
.icon-wrapper {
  padding: 15px;
  border-radius: 50%;
  margin-right: 20px;
}
.text-wrapper .label {
  margin: 0;
  color: #909399;
}
.text-wrapper .value {
  margin: 5px 0 0;
  font-size: 24px;
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

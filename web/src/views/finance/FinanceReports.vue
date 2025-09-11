<template>
  <FinancePageTemplate title="财务报表" description="查看和分析公园的财务数据" icon="DataAnalysis">
    <!-- 财务总览 -->
    <el-row :gutter="20" class="summary-cards">
      <el-col :span="8">
        <el-card shadow="hover" class="summary-card">
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
        <el-card shadow="hover" class="summary-card">
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
        <el-card shadow="hover" class="summary-card">
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

    <!-- 筛选器 -->
    <el-card style="margin-top: 20px;">
      <el-form :inline="true" class="filter-form">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleTimeRangeChange"
            style="width: 250px;"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>按类型分组的财务统计</template>
          <div v-loading="loading" style="height: 400px;">
            <div ref="groupedChart" style="height: 100%; width: 100%;"></div>
            <el-empty v-if="!loading && groupedStatsEmpty" description="暂无数据" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>月度收支趋势</template>
          <div v-loading="loading" style="height: 400px;">
            <div ref="monthlyChart" style="height: 100%; width: 100%;"></div>
            <el-empty v-if="!loading && monthlyStatsEmpty" description="暂无数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </FinancePageTemplate>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import FinancePageTemplate from '@/views/finance/components/FinancePageTemplate.vue'
import { useFinanceStore } from '@/stores/finance'
import * as echarts from 'echarts'
import { Coin, Collection, DataLine } from '@element-plus/icons-vue'

const router = useRouter()
const financeStore = useFinanceStore()
const summary = ref({})

// 设置默认时间范围为最近一年
const getOneYearAgoDate = () => {
  const today = new Date();
  const oneYearAgo = new Date(today.setFullYear(today.getFullYear() - 1));
  // 格式化为 YYYY-MM-DD
  const pad = (n) => n < 10 ? '0' + n : n;
  return `${oneYearAgo.getFullYear()}-${pad(oneYearAgo.getMonth() + 1)}-${pad(oneYearAgo.getDate())}`;
}
const getCurrentDate = () => {
    const today = new Date();
    const pad = (n) => n < 10 ? '0' + n : n;
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
}

const timeRange = ref([getOneYearAgoDate(), getCurrentDate()])
const loading = ref(false)

// 计算属性
const groupedStatsEmpty = computed(() => !financeStore.groupedStats || financeStore.groupedStats.length === 0)
const monthlyStatsEmpty = computed(() => !financeStore.monthlyStats || financeStore.monthlyStats.length === 0)

// ECharts 实例
const groupedChart = ref(null)
const monthlyChart = ref(null)
let groupedChartInstance = null
let monthlyChartInstance = null

// 初始化 ECharts
const initCharts = () => {
  if (groupedChart.value) {
    groupedChartInstance = echarts.init(groupedChart.value)
    groupedChartInstance.on('click', (params) => {
      // 用户点击了柱状图
      if (params.componentType === 'series') {
        const description = params.name // 'name' 对应 x 轴的类目，现在是 description
        router.push({
          name: 'FinanceReportDetail',
          query: {
            description: description, // 使用 description 进行查询
            startDate: timeRange.value?.[0],
            endDate: timeRange.value?.[1]
          }
        })
      }
    })
  }
  if (monthlyChart.value) {
    monthlyChartInstance = echarts.init(monthlyChart.value)
  }
}

// 更新分组统计图表
const updateGroupedChart = (data) => {
  if (!groupedChartInstance) return;

  if (!data || data.length === 0) {
    groupedChartInstance.clear(); // 清除旧图表
    return;
  }

  // API 返回的数据结构是 { description, totalAmount, transactionType }
  // 我们需要将其转换为 ECharts 需要的格式，区分收入和支出
  const types = [...new Set(data.map(item => item.description))]; // 获取所有唯一的 description
  const chartData = types.map(desc => {
    const incomeItem = data.find(d => d.description === desc && d.transactionType === 0);
    const expenseItem = data.find(d => d.description === desc && d.transactionType === 1);
    return {
      type: desc, // X轴标签
      income: incomeItem ? incomeItem.totalAmount : 0,
      expense: expenseItem ? expenseItem.totalAmount : 0,
    };
  });


  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      valueFormatter: (value) => `${(value || 0).toFixed(2)} 元`
    },
    legend: {
      data: ['收入', '支出'],
      top: '5%', // 将图例下移
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.map(item => item.type)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '收入',
        type: 'bar',
        stack: 'total',
        label: {
          show: true,
          formatter: (p) => p.value > 0 ? p.value.toFixed(2) : '' // 仅当数值大于 0 时显示标签
        },
        emphasis: {
          focus: 'series'
        },
        data: chartData.map(item => item.income)
      },
      {
        name: '支出',
        type: 'bar',
        stack: 'total',
        label: {
          show: true,
          formatter: (p) => p.value > 0 ? p.value.toFixed(2) : ''
        },
        emphasis: {
          focus: 'series'
        },
        data: chartData.map(item => item.expense)
      }
    ]
  };
  groupedChartInstance.setOption(option);
}

// 更新月度统计图表
const updateMonthlyChart = (data) => {
  if (!monthlyChartInstance) return;

  if (!data || data.length === 0) {
    monthlyChartInstance.clear(); // 清除旧图表
    return;
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value) => `${(value || 0).toFixed(2)} 元`
    },
    legend: {
      data: ['收入', '支出'],
      top: '5%', // 将图例下移
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%', // 增加底部边距
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.month)
    },
    yAxis: { type: 'value' },
    dataZoom: [ // 添加 dataZoom 组件
      { type: 'slider', start: 0, end: 100, bottom: 10 },
      { type: 'inside', start: 0, end: 100 }
    ],
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
  };
  monthlyChartInstance.setOption(option);
}

// 获取数据
const fetchAllData = async () => {
  loading.value = true;
  try {
    const params = {
      startDate: timeRange.value?.[0] || undefined,
      endDate: timeRange.value?.[1] || undefined,
    };
    // 并行获取所有数据
    await Promise.all([
      financeStore.fetchSummary(params),
      financeStore.fetchGroupedStats(params),
      financeStore.fetchMonthlyStats(params)
    ]);
  } catch (error) {
    console.error("获取报表数据失败:", error);
  } finally {
    loading.value = false;
  }
}


// 当日期范围变化时，更新所有图表
const handleTimeRangeChange = () => {
  fetchAllData();
}

// 监听 store 中数据的变化，并更新图表
watch(() => financeStore.summary, (newSummary) => {
  summary.value = newSummary;
}, { deep: true, immediate: true });

watch(() => financeStore.groupedStats, (newStats) => {
  nextTick(() => {
    updateGroupedChart(newStats);
  });
}, { deep: true });

watch(() => financeStore.monthlyStats, (newStats) => {
  nextTick(() => {
    updateMonthlyChart(newStats);
  });
}, { deep: true });


onMounted(() => {
  initCharts();
  fetchAllData(); // 初始加载数据

  // 添加窗口大小调整监听器
  window.addEventListener('resize', () => {
    groupedChartInstance?.resize();
    monthlyChartInstance?.resize();
  });
});

// 在组件卸载前移除监听器
import { onBeforeUnmount } from 'vue';
onBeforeUnmount(() => {
  window.removeEventListener('resize', () => {
    groupedChartInstance?.resize();
    monthlyChartInstance?.resize();
  });
  // 销毁 ECharts 实例
  groupedChartInstance?.dispose();
  monthlyChartInstance?.dispose();
});

</script>

<style scoped>
.summary-cards .summary-card {
  border-radius: 10px;
  transition: all 0.3s ease;
}
.summary-cards .summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
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
.filter-form .el-form-item {
  margin-bottom: 0;
}
</style>

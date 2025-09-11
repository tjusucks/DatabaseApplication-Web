<template>
  <div class="facility-monitoring">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设施实时监控</span>
          <el-button type="primary" @click="fetchMonitoringData">刷新数据</el-button>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="hover">
            <div class="chart-title">温度监控</div>
            <div ref="temperatureChart" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover">
            <div class="chart-title">流量监控</div>
            <div ref="flowRateChart" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import { useRoute } from 'vue-router';
import { searchRides, getRideStats } from '@/api/facilities';

const route = useRoute();
const temperatureChart = ref(null);
const flowRateChart = ref(null);
let temperatureChartInstance = null;
let flowRateChartInstance = null;

const initCharts = () => {
  temperatureChartInstance = echarts.init(temperatureChart.value);
  flowRateChartInstance = echarts.init(flowRateChart.value);
};

const updateCharts = (data) => {
  const temperatureOption = {
    title: { text: '温度变化' },
    xAxis: { type: 'category', data: data.timestamps },
    yAxis: { type: 'value' },
    series: [{ data: data.temperatures, type: 'line' }],
  };

  const flowRateOption = {
    title: { text: '流量变化' },
    xAxis: { type: 'category', data: data.timestamps },
    yAxis: { type: 'value' },
    series: [{ data: data.flowRates, type: 'line' }],
  };

  temperatureChartInstance.setOption(temperatureOption);
  flowRateChartInstance.setOption(flowRateOption);
};

const fetchMonitoringData = async () => {
  const data = await getRideStats({
    startDate: null, // 可选：添加日期范围
    endDate: null,
  });

  updateCharts({
    timestamps: ['时间1', '时间2'], // 示例时间数据
    temperatures: [22, 24], // 示例温度数据
    flowRates: [10, 12], // 示例流量数据
  });

  console.log('统计数据:', data);
};

onMounted(() => {
  initCharts();
  fetchMonitoringData();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart {
  width: 100%;
  height: 300px;
}

.chart-title {
  font-weight: bold;
  margin-bottom: 10px;
}
</style>

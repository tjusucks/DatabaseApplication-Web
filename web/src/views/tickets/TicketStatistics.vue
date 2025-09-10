<template>
  <PageTemplate
    title="销售统计"
    description="查看销售数据、趋势和关键指标"
    icon="DataLine"
  >
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-title">今日销售总额</div>
            <div class="stat-value">¥ {{ statsData.todayRevenue }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-title">今日售出票数</div>
            <div class="stat-value">{{ statsData.todayTicketsSold }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-title">本月累计销售额</div>
            <div class="stat-value">¥ {{ statsData.monthRevenue }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" style="margin-top: 20px">
      <template #header>
        <span>销售趋势 (近7日)</span>
      </template>
      <div ref="salesChartRef" style="width: 100%; height: 400px"></div>
    </el-card>
  </PageTemplate>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
import PageTemplate from "@/components/PageTemplate.vue";

const salesChartRef = ref(null);
let chartInstance = null;

const statsData = ref({
  todayRevenue: "25,680.00",
  todayTicketsSold: "142",
  monthRevenue: "458,900.00",
});

const initChart = () => {
  if (salesChartRef.value) {
    chartInstance = echarts.init(salesChartRef.value);
    const option = {
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: ["5-15", "5-16", "5-17", "5-18", "5-19", "5-20", "5-21"],
      },
      yAxis: { type: "value" },
      series: [
        {
          name: "销售额",
          type: "line",
          data: [12000, 15000, 13500, 22000, 25000, 18000, 25680],
          smooth: true,
        },
      ],
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    };
    chartInstance.setOption(option);
  }
};

onMounted(() => {
  initChart();
  window.addEventListener("resize", () => chartInstance?.resize());
});

onUnmounted(() => {
  chartInstance?.dispose();
  window.removeEventListener("resize", () => chartInstance?.resize());
});
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

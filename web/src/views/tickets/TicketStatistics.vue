<template>
  <PageTemplate
    title="票务统计报表"
    description="查看销售数据、趋势和关键指标"
    icon="DataLine"
  >
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-title">今日销售总额</div>
            <div class="stat-value">
              ¥ {{ statsData?.todayRevenue || "0.00" }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-title">今日售出票数</div>
            <div class="stat-value">
              {{ statsData?.todayTicketsSold || "0" }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-title">本月累计销售额</div>
            <div class="stat-value">
              ¥ {{ statsData?.monthRevenue || "0.00" }}
            </div>
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
import { useTicketStore } from "@/stores/ticket";
import * as echarts from "echarts";
import PageTemplate from '@/components/PageTemplate.vue'; // 引入通用模板

const ticketStore = useTicketStore();
const statsData = ref(null);
const salesChartRef = ref(null);
let chartInstance = null;

const initChart = (data) => {
  if (salesChartRef.value) {
    chartInstance = echarts.init(salesChartRef.value);
    const option = {
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: data.labels },
      yAxis: { type: "value" },
      series: [
        { name: "销售额", type: "line", data: data.values, smooth: true },
      ],
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    };
    chartInstance.setOption(option);
  }
};

onMounted(async () => {
  statsData.value = await ticketStore.fetchStatistics();
  if (statsData.value && statsData.value.trend) {
    initChart(statsData.value.trend);
  }
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

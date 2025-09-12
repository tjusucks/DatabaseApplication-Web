<template>
  <div class="facility-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-button type="primary" @click="goBack">返回列表</el-button>
          <span>设施详情</span>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="设施ID">{{ facilityDetail?.id }}</el-descriptions-item>
        <el-descriptions-item label="设施名称">{{ facilityDetail?.name }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ facilityDetail?.status }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{
          facilityDetail?.createdAt
        }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{ facilityDetail?.location }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{
          facilityDetail?.description || '无'
        }}</el-descriptions-item>
        <el-descriptions-item label="容量">{{ facilityDetail?.capacity }}</el-descriptions-item>
        <el-descriptions-item label="运行时长"
          >{{ facilityDetail?.duration }} 分钟</el-descriptions-item
        >
        <el-descriptions-item label="最小高度限制"
          >{{ facilityDetail?.heightLimitMin }} cm</el-descriptions-item
        >
        <el-descriptions-item label="最大高度限制"
          >{{ facilityDetail?.heightLimitMax }} cm</el-descriptions-item
        >
        <el-descriptions-item label="开放日期">{{
          facilityDetail?.openDate || '未设置'
        }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{
          facilityDetail?.managerName || '未指定'
        }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{
          facilityDetail?.updatedAt
        }}</el-descriptions-item>
      </el-descriptions>

      <el-card class="status-card" shadow="hover">
        <div class="status-header">运行状态</div>
        <el-row>
          <el-col :span="12">温度: {{ facilityDetail?.temperature }}°C</el-col>
          <el-col :span="12">流量: {{ facilityDetail?.flowRate }} m³/s</el-col>
        </el-row>
      </el-card>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getRide, getRideStats } from '@/api/facilities';

const route = useRoute()
const router = useRouter()
const facilityDetail = ref(null)
const rideStats = ref(null)
const loading = ref(false)
const dateRange = ref([new Date(), new Date()])

const fetchFacilityDetail = async () => {
  const id = route.params.id;
  facilityDetail.value = await getRide(id);
};

const fetchRideStats = async () => {
  loading.value = true
  try {
    const stats = await getRideStats({
      startDate: dateRange.value[0],
      endDate: dateRange.value[1],
    })
    rideStats.value = stats
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/facilities')
}

onMounted(() => {
  fetchFacilityDetail()
  fetchRideStats()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-card {
  margin-top: 20px;
}

.status-header {
  font-weight: bold;
  margin-bottom: 10px;
}
</style>
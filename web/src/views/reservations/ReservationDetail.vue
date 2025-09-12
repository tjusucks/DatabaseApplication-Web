<template>
  <PageTemplate
    :title="`预订详情 - ${currentReservation?.reservationId || ''}`"
    description="查看单个预订的详细信息、关联票种和游客资料"
  >
    <el-card v-loading="loading" shadow="never">
      <el-descriptions :column="3" border v-if="currentReservation">
        <el-descriptions-item label="预订号">{{
          currentReservation.reservationId
        }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ currentReservation.status }}</el-descriptions-item>
        <el-descriptions-item label="预订时间">{{
          currentReservation.reservationTime
        }}</el-descriptions-item>
        <el-descriptions-item label="游客姓名">{{
          currentReservation.visitor?.user?.displayName
        }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{
          currentReservation.visitor?.user?.phoneNumber
        }}</el-descriptions-item>
        <el-descriptions-item label="总金额">
          <el-tag type="danger">¥ {{ currentReservation.totalAmount }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <el-skeleton v-else :rows="5" animated />
    </el-card>
  </PageTemplate>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useReservationStore } from '@/stores/tickets.js'
import { storeToRefs } from 'pinia'
import PageTemplate from '@/components/PageTemplate.vue'

const route = useRoute()
const reservationStore = useReservationStore()
const reservationId = ref(route.params.id)
const { currentReservation } = storeToRefs(reservationStore)
const { fetchReservationById } = reservationStore
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  await fetchReservationById(reservationId.value)
  // [模拟数据] 用于UI展示
  // if (!currentReservation.value) {
  //   currentReservation.value = {
  //     reservationId,
  //     status: "已确认",
  //     reservationTime: "2024-05-23 10:00:00",
  //     totalAmount: 360.0,
  //     visitor: {
  //       user: { displayName: "模拟用户", phoneNumber: "138****1234" },
  //     },
  //   };
  // }
  loading.value = false
})
</script>

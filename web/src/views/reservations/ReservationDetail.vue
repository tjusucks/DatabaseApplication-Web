<template>
  <PageTemplate
    :title="`预订详情 - ${reservationId}`"
    description="查看单个预订的详细信息"
  >
    <el-descriptions
      v-if="currentReservation"
      border
      :column="2"
      v-loading="loading"
    >
      <el-descriptions-item label="预订号">{{
        currentReservation.reservationId
      }}</el-descriptions-item>
      <el-descriptions-item label="状态">{{
        currentReservation.status
      }}</el-descriptions-item>
    </el-descriptions>
    <el-skeleton v-else :rows="5" animated />
  </PageTemplate>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
// [已修正]
import { useReservationStore } from "@/stores/tickets.js";
import { storeToRefs } from "pinia";
import PageTemplate from "@/components/PageTemplate.vue";

const route = useRoute();
const reservationStore = useReservationStore();
const reservationId = ref(route.params.id);
const { currentReservation } = storeToRefs(reservationStore);
const { fetchReservationById } = reservationStore;
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  await fetchReservationById(reservationId.value);
  loading.value = false;
});
</script>

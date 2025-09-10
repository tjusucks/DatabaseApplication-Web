<template>
  <PageTemplate title="退票管理" description="审批或驳回待处理的退票申请">
    <el-alert
      type="warning"
      title="后端接口开发中"
      description="此页面功能暂不可用。"
      show-icon
      :closable="false"
      style="margin-bottom: 20px"
    ></el-alert>
    <el-table :data="pendingRefunds.list" border v-loading="loading">
      <el-table-column prop="refundId" label="退票申请ID" />
      <el-table-column prop="bookingId" label="原预订号" />
    </el-table>
  </PageTemplate>
</template>

<script setup>
import { ref, onMounted } from "vue";
// [已修正]
import { useRefundStore } from "@/stores/tickets.js";
import { storeToRefs } from "pinia";
import PageTemplate from "@/components/PageTemplate.vue";

const refundStore = useRefundStore();
const { pendingRefunds } = storeToRefs(refundStore);
const { fetchPendingRefunds } = refundStore;
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  // await fetchPendingRefunds();
  loading.value = false;
});
</script>

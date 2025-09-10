<template>
  <PageTemplate title="退票列表" description="查看所有退票申请记录">
    <el-alert
      type="warning"
      title="后端接口开发中"
      description="此页面功能暂不可用。"
      show-icon
      :closable="false"
      style="margin-bottom: 20px"
    ></el-alert>
    <el-table :data="allRefunds.list" border v-loading="loading">
      <el-table-column prop="refundId" label="退票申请ID" />
      <el-table-column prop="bookingId" label="原预订号" />
      <el-table-column prop="status" label="状态" />
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
const { allRefunds } = storeToRefs(refundStore);
const { fetchAllRefunds } = refundStore;
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  // await fetchAllRefunds();
  loading.value = false;
});
</script>

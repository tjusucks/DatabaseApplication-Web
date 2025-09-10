// /src/views/tickets/TicketTypeDetail.vue
<template>
  <PageTemplate
    :title="`价格规则管理 - ${ticketTypeDetail?.typeName || ''}`"
    description="为当前票种设置不同条件下的价格"
  >
    <el-button type="primary" icon="Plus" style="margin-bottom: 20px">
      新增价格规则
    </el-button>

    <el-table :data="priceRulesForType" border v-loading="loading">
      <el-table-column prop="ruleId" label="规则ID" width="100" />
      <el-table-column prop="description" label="规则描述" />
      <el-table-column prop="price" label="价格" />
      <el-table-column prop="startDate" label="生效日期" />
      <el-table-column prop="endDate" label="失效日期" />
    </el-table>
  </PageTemplate>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useTicketStore } from "@/stores/ticket.js";
import { storeToRefs } from "pinia";
import PageTemplate from "@/components/PageTemplate.vue";

// 1. 初始化
const route = useRoute();
const ticketStore = useTicketStore();
const ticketTypeId = route.params.id;

// 2. 解构 Store
const { ticketTypeDetail, priceRulesForType } = storeToRefs(ticketStore);
const { fetchTicketTypeById, fetchPriceRulesForTicketType } = ticketStore;

// 3. 本地状态
const loading = ref(false);

// 4. 生命周期钩子
onMounted(async () => {
  loading.value = true;
  // 并行获取票种详情和其价格规则
  await Promise.all([
    fetchTicketTypeById(ticketTypeId),
    fetchPriceRulesForTicketType(ticketTypeId),
  ]);
  loading.value = false;
});
</script>

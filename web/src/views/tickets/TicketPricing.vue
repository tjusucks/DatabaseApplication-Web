<template>
  <PageTemplate title="价格管理概览" description="集中展示所有票种的全部价格规则" icon="Money">
    <el-table :data="pricingRules" border stripe v-loading="loading">
      <el-table-column prop="ticketTypeName" label="所属票种" width="180" />

      <!-- [最终修正] 将 el.table.column 改为 el-table-column -->
      <el-table-column prop="ruleId" label="规则ID" width="100" />
      <el-table-column prop="description" label="规则描述" />
      <el-table-column prop="price" label="价格（元）" />
      <el-table-column prop="startDate" label="生效日期" />
      <el-table-column prop="endDate" label="失效日期" />

      <template #empty>
        <el-empty description="暂无任何价格规则" />
      </template>
    </el-table>
  </PageTemplate>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useTicketStore } from "@/stores/tickets.js"; // 确保路径正确
import { storeToRefs } from "pinia";
import PageTemplate from "@/components/PageTemplate.vue";

// 1. 初始化
const ticketStore = useTicketStore();

// 2. 解构
const { pricingRules } = storeToRefs(ticketStore);

// 3. 本地状态
const loading = ref(false);

// 4. 生命周期
onMounted(async () => {
  loading.value = true;
  // 调用我们新实现的、强大的 fetchPricingRules action
  await ticketStore.fetchPricingRules();
  loading.value = false;
});
</script>

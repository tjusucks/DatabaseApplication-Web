<template>
  <PageTemplate
    :title="`价格规则管理 - ${ticketTypeDetail?.typeName || ''}`"
    description="为当前票种设置不同条件下的价格"
  >
    <div class="action-bar">
      <el-button type="primary" icon="Plus" @click="handleAdd">
        新增价格规则
      </el-button>
    </div>
    <el-table :data="priceRulesForType" border stripe v-loading="loading">
      <el-table-column prop="ruleId" label="规则ID" width="100" />
      <el-table-column prop="description" label="规则描述" />
      <el-table-column prop="price" label="价格" />
      <el-table-column prop="startDate" label="生效日期" />
      <el-table-column prop="endDate" label="失效日期" />
      <el-table-column label="操作" fixed="right" align="center">
        <template #default="{ row }">
          <el-button
            size="small"
            type="primary"
            link
            icon="Edit"
            @click="handleEdit(row)"
            >编辑</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </PageTemplate>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useTicketStore } from "@/stores/tickets.js";
import { storeToRefs } from "pinia";
import PageTemplate from "@/components/PageTemplate.vue";
import { ElMessage } from "element-plus";

const route = useRoute();
const ticketStore = useTicketStore();
const ticketTypeId = route.params.id;
const { ticketTypeDetail, priceRulesForType } = storeToRefs(ticketStore);
const { fetchTicketTypeById, fetchPriceRulesForTicketType } = ticketStore;
const loading = ref(false);

const handleAdd = () => {
  ElMessage.info("新增价格规则功能待实现");
};
const handleEdit = (row) => {
  ElMessage.info(`编辑价格规则 ${row.ruleId} 功能待实现`);
};

onMounted(async () => {
  loading.value = true;
  await Promise.all([
    fetchTicketTypeById(ticketTypeId),
    fetchPriceRulesForTicketType(ticketTypeId),
  ]);
  loading.value = false;
});
</script>

<style scoped>
.action-bar {
  margin-bottom: 20px;
}
</style>

<template>
  <PageTemplate
    title="优惠活动"
    description="管理所有营销和促销活动"
    icon="Present"
  >
    <div style="margin-bottom: 20px">
      <el-button type="primary" icon="Plus" @click="handleCreate"
        >创建新活动</el-button
      >
    </div>
    <el-table
      :data="promotions.list"
      v-loading="loading"
      border
      style="width: 100%"
    >
      <el-table-column prop="name" label="活动名称" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="startDate" label="开始时间" />
      <el-table-column prop="endDate" label="结束时间" />
      <el-table-column label="状态">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'info'">{{
            row.isActive ? "进行中" : "已结束"
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button size="small">编辑</el-button>
          <!-- [已修正] 添加了管理活动的按钮和点击事件 -->
          <el-button
            size="small"
            type="primary"
            @click="managePromotion(row.promotionId)"
            >管理活动</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </PageTemplate>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
// [已修正]
import { usePromotionStore } from "@/stores/tickets.js";
import PageTemplate from "@/components/PageTemplate.vue";

const router = useRouter();
const promotionStore = usePromotionStore();
const { promotions } = storeToRefs(promotionStore);
const { fetchPromotions } = promotionStore;
const loading = ref(false);

const handleCreate = () => router.push("/promotions/create");
const managePromotion = (id) => {
  router.push(`/promotions/detail/${id}`);
};

onMounted(async () => {
  loading.value = true;
  await fetchPromotions();
  loading.value = false;
});
</script>

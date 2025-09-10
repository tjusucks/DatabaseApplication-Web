<template>
  <PageTemplate
    :title="`活动详情管理 - ${promotion?.name || ''}`"
    description="管理促销活动的基本信息、触发条件和优惠动作"
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基本信息" name="info">
        <el-card v-loading="loading">
          <el-form
            label-width="120px"
            style="max-width: 600px"
            v-if="promotion"
          >
            <el-form-item label="活动ID">{{
              promotion.promotionId
            }}</el-form-item>
            <el-form-item label="活动名称"
              ><el-input v-model="promotion.name"
            /></el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="触发条件 (Conditions)" name="conditions">
        <el-button type="primary" icon="Plus" style="margin-bottom: 20px"
          >新增条件</el-button
        >
        <el-table :data="conditions" border v-loading="loading">
          <el-table-column prop="conditionId" label="ID" width="80" />
          <el-table-column prop="description" label="条件描述" />
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="优惠动作 (Actions)" name="actions">
        <el-button type="primary" icon="Plus" style="margin-bottom: 20px"
          >新增动作</el-button
        >
        <el-table :data="actions" border v-loading="loading">
          <el-table-column prop="actionId" label="ID" width="80" />
          <el-table-column prop="description" label="动作描述" />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </PageTemplate>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
// [已修正]
import { usePromotionStore } from "@/stores/tickets.js";
import { storeToRefs } from "pinia";
import PageTemplate from "@/components/PageTemplate.vue";

const route = useRoute();
const promotionId = route.params.id;
const promotionStore = usePromotionStore();
const loading = ref(false);
const activeTab = ref("info");
const promotion = ref({});
const conditions = ref([]);
const actions = ref([]);

onMounted(async () => {
  loading.value = true;
  // const { fetchPromotionById, fetchConditions, fetchActions } = promotionStore;
  // await fetchPromotionById(promotionId);
  // await fetchConditions(promotionId);
  // await fetchActions(promotionId);
  promotion.value = { promotionId: promotionId, name: "暑期家庭套餐" };
  conditions.value = [
    { conditionId: 1, description: "购买2张成人票+1张儿童票" },
  ];
  actions.value = [{ actionId: 1, description: "总价优惠50元" }];
  loading.value = false;
});
</script>

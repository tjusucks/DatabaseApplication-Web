<template>
  <PageTemplate
    title="创建活动"
    description="填写活动信息以创建一个新的促销活动"
    icon="CirclePlus"
  >
    <el-form :model="form" label-width="120px" style="max-width: 600px">
      <el-form-item label="活动名称"
        ><el-input v-model="form.name"
      /></el-form-item>
      <el-form-item label="活动描述"
        ><el-input v-model="form.description" type="textarea"
      /></el-form-item>
      <el-form-item label="活动时间">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          @change="updateFormDates"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit" :loading="isSubmitting"
          >立即创建</el-button
        >
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </PageTemplate>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
// [已修正]
import { usePromotionStore } from "@/stores/tickets.js";
import PageTemplate from "@/components/PageTemplate.vue";

const router = useRouter();
const promotionStore = usePromotionStore();
const { createPromotion } = promotionStore;
const isSubmitting = ref(false);
const dateRange = ref("");
const form = reactive({
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  isActive: true,
});

const updateFormDates = (dates) => {
  if (dates) {
    form.startDate = dates[0];
    form.endDate = dates[1];
  } else {
    form.startDate = "";
    form.endDate = "";
  }
};

const onSubmit = async () => {
  isSubmitting.value = true;
  const success = await createPromotion(form);
  if (success) {
    router.push("/promotions/list");
  }
  isSubmitting.value = false;
};

const onCancel = () => router.back();
</script>

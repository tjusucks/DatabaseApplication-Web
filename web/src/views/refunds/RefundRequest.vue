<template>
  <PageTemplate
    title="申请退票"
    description="为游客提交一张或多张门票的退票申请"
    icon="CirclePlus"
  >
    <el-form
      :model="form"
      ref="formRef"
      label-width="120px"
      style="max-width: 600px"
    >
      <el-form-item label="票号 / 订单号" prop="ticketId">
        <el-input v-model="form.ticketId" placeholder="请输入需要退票的票号" />
      </el-form-item>
      <el-form-item label="退票原因" prop="reason">
        <el-input
          v-model="form.reason"
          type="textarea"
          placeholder="请输入退票原因"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit" :loading="isSubmitting"
          >提交申请</el-button
        >
      </el-form-item>
    </el-form>
  </PageTemplate>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRefundStore } from "@/stores/tickets.js";
import PageTemplate from "@/components/PageTemplate.vue";

const refundStore = useRefundStore();
const formRef = ref(null);
const isSubmitting = ref(false);
const form = reactive({ ticketId: "", reason: "" });

const handleSubmit = async () => {
  if (!form.ticketId) return;
  isSubmitting.value = true;
  const success = await refundStore.createRefundRequest(form);
  if (success) {
    formRef.value.resetFields();
  }
  isSubmitting.value = false;
};
</script>

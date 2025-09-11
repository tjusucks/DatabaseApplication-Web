<template>
  <PageTemplate
    title="申请退票"
    description="为游客提交一张或多张门票的退票申请"
    icon="CirclePlus"
  >
    <el-card shadow="never" class="form-card">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="票号 / 订单号" prop="ticketId">
          <el-input
            v-model="form.ticketId"
            placeholder="请输入需要退票的票号"
          />
        </el-form-item>
        <el-form-item label="退票原因" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入详细的退票原因"
          />
        </el-form-item>
        <el-form-item class="form-footer">
          <el-button @click="resetForm">重置</el-button>
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="isSubmitting"
            >提交申请</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
  </PageTemplate>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRefundStore } from "@/stores/tickets.js";
import PageTemplate from "@/components/PageTemplate.vue";
import { ElMessage } from "element-plus";

const refundStore = useRefundStore();
const formRef = ref(null);
const isSubmitting = ref(false);

const form = reactive({ ticketId: "", reason: "" });
const rules = reactive({
  ticketId: [{ required: true, message: "请输入票号", trigger: "blur" }],
  reason: [{ required: true, message: "请输入退票原因", trigger: "blur" }],
});

const resetForm = () => {
  formRef.value.resetFields();
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      isSubmitting.value = true;
      const success = await refundStore.createRefundRequest(form);
      if (success) {
        resetForm();
      }
      isSubmitting.value = false;
    }
  });
};
</script>

<style scoped>
.form-card {
  max-width: 700px;
  margin: 0 auto;
}
.form-footer {
  display: flex;
  justify-content: flex-end;
}
</style>

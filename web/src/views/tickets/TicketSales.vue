<template>
  <PageTemplate title="门票销售" description="进行现场售票和创建游客订单">
    <el-form
      :model="saleForm"
      ref="saleFormRef"
      label-width="120px"
      style="max-width: 800px"
    >
      <el-form-item label="门票类型" prop="ticketTypeId">
        <el-select
          v-model="saleForm.ticketTypeId"
          placeholder="请选择门票类型"
          style="width: 100%"
        >
          <el-option
            v-for="item in ticketTypes"
            :key="item.ticketTypeId"
            :label="item.name"
            :value="item.ticketTypeId"
          />
        </el-select>
      </el-form-item>
      <!-- 其他表单项 -->
      <el-form-item>
        <el-button type="primary" @click="handleSubmit" :loading="isSubmitting"
          >确认销售</el-button
        >
      </el-form-item>
    </el-form>
  </PageTemplate>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
// [已修正]
import { useTicketStore } from "@/stores/tickets.js";
import { storeToRefs } from "pinia";
import PageTemplate from "@/components/PageTemplate.vue";

const ticketStore = useTicketStore();
const { ticketTypes } = storeToRefs(ticketStore);
const { fetchTicketTypes, createSale } = ticketStore;
const isSubmitting = ref(false);
const saleFormRef = ref(null);
const saleForm = reactive({ ticketTypeId: null, quantity: 1 });

const handleSubmit = async () => {
  isSubmitting.value = true;
  const success = await createSale(saleForm);
  if (success) {
    saleFormRef.value.resetFields();
  }
  isSubmitting.value = false;
};

onMounted(fetchTicketTypes);
</script>

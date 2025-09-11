<template>
  <PageTemplate title="门票销售" description="进行现场售票和创建游客订单">
    <el-card shadow="never" class="form-card">
        <el-form
          :model="saleForm"
          :rules="rules"
          ref="saleFormRef"
          label-width="120px"
        >
          <el-form-item label="门票类型" prop="ticketTypeId">
            <el-select
              v-model="saleForm.ticketTypeId"
              placeholder="请选择门票类型"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="item in ticketTypes"
                :key="item.ticketTypeId"
                :label="`${item.typeName} (¥${item.basePrice})`"
                :value="item.ticketTypeId"
              />
            </el-select>
          </el-form-item>
           <el-form-item label="购买数量" prop="quantity">
              <el-input-number v-model="saleForm.quantity" :min="1" :max="100" />
            </el-form-item>
            <el-form-item label="游客手机号" prop="visitorPhone">
              <el-input v-model="saleForm.visitorPhone" placeholder="关联或创建游客档案 (选填)" />
            </el-form-item>
          <el-divider />
           <div class="total-section">
            <h3>总计金额：<span class="price">¥ {{ totalPrice.toFixed(2) }}</span></h3>
          </div>
          <el-form-item class="form-footer">
            <el-button @click="resetForm">重置</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="isSubmitting"
              >确认销售</el-button
            >
          </el-form-item>
        </el-form>
    </el-card>
  </PageTemplate>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useTicketStore } from "@/stores/tickets.js";
import { storeToRefs } from "pinia";
import PageTemplate from "@/components/PageTemplate.vue";

const ticketStore = useTicketStore();
const { ticketTypes } = storeToRefs(ticketStore);
const { fetchTicketTypes, createSale } = ticketStore;
const isSubmitting = ref(false);
const saleFormRef = ref(null);
const saleForm = reactive({ ticketTypeId: null, quantity: 1, visitorPhone: '' });

const rules = reactive({
    ticketTypeId: [{ required: true, message: '请选择门票类型', trigger: 'change' }],
    quantity: [{ required: true, message: '请输入购买数量', trigger: 'change' }],
});

const totalPrice = computed(() => {
  const selectedType = ticketTypes.value.find(t => t.ticketTypeId === saleForm.value.ticketTypeId);
  return selectedType ? selectedType.basePrice * saleForm.value.quantity : 0;
});

const resetForm = () => {
    saleFormRef.value.resetFields();
};

const handleSubmit = async () => {
  if (!saleFormRef.value) return;
  await saleFormRef.value.validate(async (valid) => {
    if (valid) {
      isSubmitting.value = true;
      // 假设 createSale API 存在
      // const success = await createSale(saleForm);
      const success = true; // 模拟成功
      if (success) {
        resetForm();
      }
      isSubmitting.value = false;
    }
  });
};

onMounted(fetchTicketTypes);
</script>

<style scoped>
.form-card {
  max-width: 700px;
  margin: 0 auto;
}
.total-section { text-align: right; margin-bottom: 20px; }
.price { color: #F56C6C; font-size: 24px; font-weight: bold; }
.form-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
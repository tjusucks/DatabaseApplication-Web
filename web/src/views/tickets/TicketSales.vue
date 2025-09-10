<template>
  <PageTemplate
    title="门票销售"
    description="进行现场售票和创建游客订单"
    icon="ShoppingCart"
  >
    <el-form
      :model="saleForm"
      ref="saleFormRef"
      label-width="120px"
      :rules="rules"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="门票类型" prop="ticketTypeId">
            <el-select
              v-model="saleForm.ticketTypeId"
              placeholder="请选择门票类型"
              style="width: 100%"
            >
              <el-option
                v-for="item in ticketTypes"
                :key="item.id"
                :label="`${item.name} (¥${item.price})`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="购买数量" prop="quantity">
            <el-input-number v-model="saleForm.quantity" :min="1" :max="100" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="游客手机号" prop="visitorPhone">
        <el-input
          v-model="saleForm.visitorPhone"
          placeholder="请输入游客手机号 (选填)"
        />
      </el-form-item>
      <el-divider />
      <div class="total-section">
        <h3>
          总计金额：<span class="price">¥ {{ totalPrice.toFixed(2) }}</span>
        </h3>
      </div>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit" :loading="isSubmitting"
          >确认销售</el-button
        >
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </PageTemplate>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useTicketStore } from "@/stores/ticket";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import PageTemplate from '@/components/PageTemplate.vue'; // 引入通用模板

const ticketStore = useTicketStore();
const { ticketTypes } = storeToRefs(ticketStore);

const saleFormRef = ref(null);
const isSubmitting = ref(false);

const saleForm = ref({
  ticketTypeId: null,
  quantity: 1,
  visitorPhone: "",
});

const rules = {
  ticketTypeId: [
    { required: true, message: "请选择门票类型", trigger: "change" },
  ],
  quantity: [{ required: true, message: "请输入购买数量", trigger: "blur" }],
};

const totalPrice = computed(() => {
  const selectedType = ticketTypes.value.find(
    (t) => t.id === saleForm.value.ticketTypeId
  );
  if (selectedType) {
    return selectedType.price * saleForm.value.quantity;
  }
  return 0;
});

onMounted(() => {
  ticketStore.fetchTicketTypes();
});

const handleReset = () => {
  saleFormRef.value.resetFields();
};

const handleSubmit = async () => {
  if (!saleFormRef.value) return;
  await saleFormRef.value.validate(async (valid) => {
    if (valid) {
      isSubmitting.value = true;
      const success = await ticketStore.createSale(saleForm.value);
      if (success) {
        handleReset();
      }
      isSubmitting.value = false;
    } else {
      ElMessage.error("请检查表单输入");
    }
  });
};
</script>

<style scoped>
.total-section {
  text-align: right;
  margin-bottom: 20px;
}
.price {
  color: #f56c6c;
  font-size: 24px;
  font-weight: bold;
}
</style>

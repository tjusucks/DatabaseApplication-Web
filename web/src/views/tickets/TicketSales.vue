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
            v-loading="loadingTicketTypes"
          >
            <!-- [最终修正] 确保这里的 item.xxx 与后端返回的 JSON 字段名完全一致 -->
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
          <el-input
            v-model="saleForm.visitorPhone"
            placeholder="关联或创建游客档案 (选填)"
          />
        </el-form-item>
        <el-divider />
        <div class="total-section">
          <h3>
            总计金额：<span class="price">¥ {{ totalPrice.toFixed(2) }}</span>
          </h3>
        </div>
        <el-form-item class="form-footer">
          <el-button @click="resetForm">重置</el-button>
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="isSubmitting"
            >确认销售</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
  </PageTemplate>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { storeToRefs } from "pinia";
import PageTemplate from "@/components/PageTemplate.vue";
import { ElMessage } from "element-plus";

// [最终修正] 同时导入 useTicketStore 和 useReservationStore
import { useTicketStore, useReservationStore } from "@/stores/tickets.js";

// 1. 初始化两个需要的 store
const ticketStore = useTicketStore();
const reservationStore = useReservationStore();

// 2. 从各自的 store 中解构所需的状态和方法
// 从 ticketStore 获取票种信息
const { ticketTypes } = storeToRefs(ticketStore);
// 从 reservationStore 获取销售方法
const { createSale } = reservationStore; // <-- 直接解构 action 是可以的，因为 Pinia 的 setup store 写法已经处理了 this 绑定

// 3. 本地状态
const isSubmitting = ref(false);
const saleFormRef = ref(null);
const saleForm = reactive({
  ticketTypeId: null,
  quantity: 1,
  visitorPhone: "",
});

const rules = reactive({
  ticketTypeId: [
    { required: true, message: "请选择门票类型", trigger: "change" },
  ],
  quantity: [{ required: true, message: "请输入购买数量", trigger: "change" }],
});

const totalPrice = computed(() => {
  const selectedType = ticketTypes.value.find(
    (t) => t && t.ticketTypeId === saleForm.ticketTypeId
  );
  if (selectedType) {
    return selectedType.basePrice * saleForm.quantity;
  }
  return 0;
});

const resetForm = () => {
  if (saleFormRef.value) {
    saleFormRef.value.resetFields();
  }
};

const handleSubmit = async () => {
  if (!saleFormRef.value) return;
  await saleFormRef.value.validate(async (valid) => {
    if (valid) {
      isSubmitting.value = true;
      const saleData = { ...saleForm, totalPrice: totalPrice.value };

      // 调用从 reservationStore 中获取的 createSale 方法
      const success = await createSale(saleData);

      if (success) {
        resetForm();
      }
      isSubmitting.value = false;
    } else {
      ElMessage.error("请检查表单输入项");
    }
  });
};

// 4. 生命周期钩子
onMounted(async () => {
  // 调用从 ticketStore 中获取的 fetchTicketTypes 方法
  await ticketStore.fetchTicketTypes();
});
</script>

<style scoped>
.form-card {
  max-width: 700px;
  margin: 0 auto;
}
.total-section {
  text-align: right;
  margin-bottom: 20px;
}
.price {
  color: #f56c6c;
  font-size: 24px;
  font-weight: bold;
}
.form-footer {
  display: flex;
  justify-content: flex-end;
}
</style>

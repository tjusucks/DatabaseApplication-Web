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
      style="max-width: 800px"
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
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import PageTemplate from "@/components/PageTemplate.vue";

const saleFormRef = ref(null);
const isSubmitting = ref(false);
const ticketTypes = ref([
  { id: 1, name: "成人全天票", price: 180 },
  { id: 2, name: "儿童/长者票", price: 90 },
  { id: 3, name: "夜场票", price: 120 },
]);

const saleForm = ref({
  ticketTypeId: null,
  quantity: 1,
  visitorPhone: '',
})

const rules = {
  ticketTypeId: [{ required: true, message: '请选择门票类型', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入购买数量', trigger: 'blur' }],
}

const totalPrice = computed(() => {
  const selectedType = ticketTypes.value.find(
    (t) => t.id === saleForm.value.ticketTypeId
  );
  return selectedType ? selectedType.price * saleForm.value.quantity : 0;
});

const handleReset = () => {
  saleFormRef.value.resetFields()
}

const handleSubmit = async () => {
  if (!saleFormRef.value) return;
  await saleFormRef.value.validate((valid) => {
    if (valid) {
      isSubmitting.value = true;
      setTimeout(() => {
        // 模拟API调用
        ElMessage.success("销售成功！");
        handleReset();
        isSubmitting.value = false;
      }, 500);
    } else {
      ElMessage.error('请检查表单输入')
    }
  })
}
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

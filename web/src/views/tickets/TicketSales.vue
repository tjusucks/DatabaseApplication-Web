<template>
  <PageTemplate title="门票销售" description="处理门票销售和出票业务" icon="ShoppingCart" />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTicketStore } from '@/stores/ticket'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import PageTemplate from '@/components/PageTemplate.vue' // 引入通用模板

const ticketStore = useTicketStore()
const { ticketTypes } = storeToRefs(ticketStore)

const saleFormRef = ref(null)
const isSubmitting = ref(false)

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
  const selectedType = ticketTypes.value.find((t) => t.id === saleForm.value.ticketTypeId)
  if (selectedType) {
    return selectedType.price * saleForm.value.quantity
  }
  return 0
})

onMounted(() => {
  ticketStore.fetchTicketTypes()
})

const handleReset = () => {
  saleFormRef.value.resetFields()
}

const handleSubmit = async () => {
  if (!saleFormRef.value) return
  await saleFormRef.value.validate(async (valid) => {
    if (valid) {
      isSubmitting.value = true
      const success = await ticketStore.createSale(saleForm.value)
      if (success) {
        handleReset()
      }
      isSubmitting.value = false
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

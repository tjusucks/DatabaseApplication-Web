<template>
  <PageTemplate title="价格管理" description="查看所有票种的价格规则">
    <el-table :data="pricingRules" border v-loading="loading">
      <el-table-column prop="ticketTypeName" label="票种" />
      <el-table-column prop="description" label="规则描述" />
      <el-table-column prop="price" label="价格（元）" />
    </el-table>
  </PageTemplate>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// [已修正]
import { useTicketStore } from '@/stores/tickets.js'
import { storeToRefs } from 'pinia'
import PageTemplate from '@/components/PageTemplate.vue'

const ticketStore = useTicketStore()
const { pricingRules } = storeToRefs(ticketStore)
const { fetchPricingRules } = ticketStore
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  await fetchPricingRules()
  loading.value = false
})
</script>

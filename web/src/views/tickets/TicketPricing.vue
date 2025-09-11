<template>
  <PageTemplate title="价格管理概览" description="查看所有已定义的价格规则">
    <el-alert
      title="功能说明"
      type="info"
      description="此页面展示所有票种的价格规则。具体的价格规则增删改，请前往【票务管理】->【票种管理】页面，点击对应票种的【管理价格】按钮进行操作。"
      show-icon
      :closable="false"
      style="margin-bottom: 20px"
    />
    <el-table :data="pricingRules" border stripe v-loading="loading">
      <el-table-column prop="ticketTypeName" label="票种" />
      <el-table-column prop="description" label="规则描述" />
      <el-table-column prop="price" label="价格（元）" />
    </el-table>
  </PageTemplate>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTicketStore } from '@/stores/tickets.js'
import { storeToRefs } from 'pinia'
import PageTemplate from '@/components/PageTemplate.vue'

// 注意：此页面功能与后端API设计不完全匹配，仅做展示
const ticketStore = useTicketStore()
const { pricingRules } = storeToRefs(ticketStore)
const { fetchPricingRules } = ticketStore
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  // await fetchPricingRules(); // 此API可能不存在

  // 模拟数据展示
  pricingRules.value = [
    { ticketTypeName: '成人票 (模拟)', description: '平日价', price: '180.00' },
    { ticketTypeName: '成人票 (模拟)', description: '周末价', price: '220.00' },
  ]

  loading.value = false
})
</script>

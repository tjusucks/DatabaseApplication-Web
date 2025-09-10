<template>
  <PageTemplate title="价格管理" description="为不同票种设置在不同日期的价格">
    <el-table :data="pricingRules" border>
      <el-table-column prop="ticketType" label="票种" />
      <el-table-column prop="dateType" label="日期类型" />
      <el-table-column prop="price" label="价格（元）" />
      <el-table-column label="操作">
        <template #default>
          <el-button size="small">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
  </PageTemplate>
</template>

<script setup>
import { ref } from 'vue'
import PageTemplate from '@/components/PageTemplate.vue'
const pricingRules = ref([
  { ticketType: '成人票', dateType: '平日', price: '180.00' },
  { ticketType: '成人票', dateType: '周末/节假日', price: '220.00' },
  { ticketType: '儿童票', dateType: '平日', price: '90.00' },
  { ticketType: '儿童票', dateType: '周末/节假日', price: '110.00' },
])
</script>

<template>
  <PageTemplate title="票种管理" description="管理公园的所有门票种类">
    <el-button type="primary" icon="Plus" style="margin-bottom: 20px">新增票种</el-button>
    <el-table :data="ticketTypes" border v-loading="loading">
      <el-table-column prop="ticketTypeId" label="ID" />
      <el-table-column prop="name" label="票种名称" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="managePricing(row.ticketTypeId)"
            >管理价格</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </PageTemplate>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// [已修正]
import { useTicketStore } from '@/stores/tickets.js'
import { storeToRefs } from 'pinia'
import PageTemplate from '@/components/PageTemplate.vue'

const router = useRouter()
const ticketStore = useTicketStore()
const { ticketTypes } = storeToRefs(ticketStore)
const { fetchTicketTypes } = ticketStore
const loading = ref(false)

const managePricing = (id) => router.push(`/tickets/types/${id}`)

onMounted(async () => {
  loading.value = true
  await fetchTicketTypes()
  loading.value = false
})
</script>

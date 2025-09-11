<template>
  <PageTemplate title="票种管理" description="管理公园的所有门票种类">
    <div class="action-bar">
      <el-button type="primary" icon="Plus" @click="handleAdd">新增票种</el-button>
    </div>
    <el-table :data="ticketTypes" border stripe v-loading="loading">
      <el-table-column prop="ticketTypeId" label="ID" />
      <el-table-column prop="typeName" label="票种名称" />
      <el-table-column prop="basePrice" label="基础价格" />
      <el-table-column prop="description" label="描述" min-width="200" />
      <el-table-column label="操作" fixed="right" align="center">
        <template #default="{ row }">
          <el-button
            size="small"
            type="primary"
            link
            icon="Money"
            @click="managePricing(row.ticketTypeId)"
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
import { useTicketStore } from '@/stores/tickets.js'
import { storeToRefs } from 'pinia'
import PageTemplate from '@/components/PageTemplate.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const ticketStore = useTicketStore()
const { ticketTypes } = storeToRefs(ticketStore)
const { fetchTicketTypes } = ticketStore
const loading = ref(false)

const handleAdd = () => {
  ElMessage.info('新增票种功能待实现')
}
const managePricing = (id) => router.push(`/tickets/types/${id}`)

onMounted(async () => {
  loading.value = true
  await fetchTicketTypes()
  loading.value = false
})
</script>

<style scoped>
.action-bar {
  margin-bottom: 20px;
}
</style>

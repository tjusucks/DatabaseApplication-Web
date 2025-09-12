<template>
  <FinancePageTemplate :title="pageTitle" :description="pageDescription" icon="DataAnalysis">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    <div v-else-if="items && items.length > 0">
      <el-table :data="items" stripe style="width: 100%">
        <el-table-column prop="date" label="日期" sortable width="180" />
        <el-table-column prop="type" label="类型" width="180" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="amount" label="金额 (元)" sortable>
          <template #default="scope">
            <span :style="{ color: scope.row.isExpense ? '#F56C6C' : '#67C23A' }">
              {{ (scope.row.isExpense ? '-' : '+') + scope.row.amount.toFixed(2) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-empty v-else :description="`在指定日期范围内没有找到“${type}”相关的记录`"></el-empty>
  </FinancePageTemplate>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import FinancePageTemplate from '@/views/finance/components/FinancePageTemplate.vue'
import { useFinanceStore } from '@/stores/finance'

const route = useRoute()
const financeStore = useFinanceStore()

const type = ref(route.query.type)
const startDate = ref(route.query.startDate)
const endDate = ref(route.query.endDate)

const items = ref([])
const loading = ref(true)

const pageTitle = computed(() => `“${type.value}”明细`)
const pageDescription = computed(() => {
  if (startDate.value && endDate.value) {
    return `查看 ${startDate.value} 至 ${endDate.value} 期间“${type.value}”的详细记录`
  }
  return `查看“${type.value}”的所有详细记录`
})

onMounted(async () => {
  try {
    // 直接调用 store 中的新方法
    const result = financeStore.fetchDetailsByType(type.value, startDate.value, endDate.value)
    items.value = result
  } catch (error) {
    console.error('获取报表详情失败:', error)
    items.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.loading-container {
  padding: 20px;
}
</style>

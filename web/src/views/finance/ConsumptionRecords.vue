<template>
  <FinancePageTemplate
    title="消费记录"
    description="查看所有游客和内部消费的详细记录"
    icon="Tickets"
  >
    <template #header>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <el-table :data="financeStore.consumptionRecords" v-loading="loading" stripe>
      <el-table-column prop="recordId" label="记录ID" width="80"></el-table-column>
      <el-table-column prop="responsibleEmployeeName" label="消费者" width="150">
        <template #default="{ row }">
          {{ row.responsibleEmployeeName || '未指定' }}
        </template>
      </el-table-column>
      <el-table-column prop="transactionType" label="消费类型" width="120">
        <template #default="{ row }">
          {{ getTransactionTypeName(row.transactionType) }}
        </template>
      </el-table-column>
      <el-table-column prop="paymentMethod" label="支付方式" width="120">
        <template #default="{ row }">
          {{ getPaymentMethodName(row.paymentMethod) }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="项目名称">
        <template #default="{ row }">
          {{ row.description || '无描述' }}
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="金额 (元)" width="120">
        <template #default="{ row }">
          {{ parseFloat(row.amount).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="transactionDate" label="交易日期" width="180">
        <template #default="{ row }">
          {{ formatDate(row.transactionDate) }}
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      background
      layout="prev, pager, next, total"
      :total="financeStore.consumptionPagination.total"
      :current-page.sync="financeStore.consumptionPagination.currentPage"
      :page-size="financeStore.consumptionPagination.pageSize"
      @current-change="handlePageChange"
      class="pagination-container"
    ></el-pagination>
  </FinancePageTemplate>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import FinancePageTemplate from '@/views/finance/components/FinancePageTemplate.vue'
import { useFinanceStore } from '@/stores/finance'
import { getTransactionTypeName, getPaymentMethodName } from '@/utils/constants'

const financeStore = useFinanceStore()
const loading = ref(false)
const searchForm = reactive({
  dateRange: [],
})

onMounted(() => {
  fetchData()
})

const fetchData = async () => {
  loading.value = true
  const params = {
    startDate: searchForm.dateRange?.[0] || undefined,
    endDate: searchForm.dateRange?.[1] || undefined,
  }
  await financeStore.fetchConsumptionRecords(params)
  loading.value = false
}

const handleSearch = () => {
  financeStore.consumptionPagination.currentPage = 1
  fetchData()
}

const resetSearch = () => {
  searchForm.dateRange = []
  handleSearch()
}

const handlePageChange = (page) => {
  financeStore.consumptionPagination.currentPage = page
  fetchData()
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
}
.search-form .el-form-item {
  margin-bottom: 0;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

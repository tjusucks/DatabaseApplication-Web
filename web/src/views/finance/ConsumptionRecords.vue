<template>
  <FinancePageTemplate title="消费记录" description="查看所有游客和内部消费的详细记录" icon="Tickets">
    <template #header>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="请选择消费类型" clearable>
            <el-option label="门票" value="ticket"></el-option>
            <el-option label="商品" value="merchandise"></el-option>
            <el-option label="餐饮" value="food"></el-option>
          </el-select>
        </el-form-item>
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
      <el-table-column prop="id" label="记录ID" width="80"></el-table-column>
      <el-table-column prop="consumerName" label="消费者" width="150"></el-table-column>
      <el-table-column prop="type" label="消费类型" width="120"></el-table-column>
      <el-table-column prop="itemName" label="项目名称"></el-table-column>
      <el-table-column prop="amount" label="金额 (元)" width="120"></el-table-column>
      <el-table-column prop="quantity" label="数量" width="80"></el-table-column>
      <el-table-column prop="totalAmount" label="总金额 (元)" width="120"></el-table-column>
      <el-table-column prop="transactionDate" label="交易日期" width="180"></el-table-column>
    </el-table>

    <el-pagination
      background
      layout="prev, pager, next, total"
      :total="financeStore.pagination.total"
      :current-page.sync="financeStore.pagination.currentPage"
      :page-size="financeStore.pagination.pageSize"
      @current-change="handlePageChange"
      class="pagination-container"
    ></el-pagination>
  </FinancePageTemplate>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import FinancePageTemplate from '@/views/finance/components/FinancePageTemplate.vue'
import { useFinanceStore } from '@/stores/finance'

const financeStore = useFinanceStore()
const loading = ref(false)
const searchForm = reactive({
  type: '',
  dateRange: []
})

onMounted(() => {
  fetchData()
})

const fetchData = async () => {
  loading.value = true
  const params = {
    type: searchForm.type || undefined,
    startDate: searchForm.dateRange?.[0] || undefined,
    endDate: searchForm.dateRange?.[1] || undefined,
  }
  await financeStore.fetchConsumptionRecords(params)
  loading.value = false
}

const handleSearch = () => {
  financeStore.pagination.currentPage = 1
  fetchData()
}

const resetSearch = () => {
  searchForm.type = ''
  searchForm.dateRange = []
  handleSearch()
}

const handlePageChange = (page) => {
  financeStore.pagination.currentPage = page
  fetchData()
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

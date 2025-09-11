<template>
  <PageTemplate title="消费记录" description="查询园区内所有的消费流水记录" icon="List">
    <template #header>
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="记录类型">
          <el-select v-model="searchForm.transactionType" placeholder="选择类型" clearable>
            <el-option label="收入" value="income" />
            <el-option label="支出" value="expense" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源/用途">
          <el-input v-model="searchForm.source" placeholder="输入来源或用途" clearable />
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
        </el-form-item>
      </el-form>
    </template>

    <el-table v-loading="financeStore.loading" :data="financeStore.records" style="width: 100%">
      <el-table-column prop="transactionDate" label="日期" width="180" />
      <el-table-column prop="transactionType" label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.transactionType === 'income' ? 'success' : 'warning'">
            {{ row.transactionType === 'income' ? '收入' : '支出' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="金额" width="150" />
      <el-table-column prop="source" label="来源/用途" />
      <el-table-column prop="description" label="描述" />
    </el-table>

    <template #footer>
      <el-pagination
        background
        layout="prev, pager, next, total"
        :total="financeStore.pagination.total"
        :page-size="financeStore.pagination.pageSize"
        :current-page="financeStore.pagination.page"
        @current-change="handlePageChange"
      />
    </template>
  </PageTemplate>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import PageTemplate from '@/components/PageTemplate.vue'
import { useFinanceStore } from '@/stores/finance'

const financeStore = useFinanceStore()

const searchForm = reactive({
  transactionType: '',
  source: '',
  dateRange: [],
})

const fetchAllRecords = (page = 1) => {
  const params = {
    page,
    pageSize: financeStore.pagination.pageSize,
    transactionType: searchForm.transactionType || undefined,
    source: searchForm.source || undefined,
    startDate: searchForm.dateRange?.[0] || undefined,
    endDate: searchForm.dateRange?.[1] || undefined,
  }
  financeStore.fetchRecords(params)
}

onMounted(() => {
  fetchAllRecords()
})

const handleSearch = () => {
  fetchAllRecords(1)
}

const handlePageChange = (page) => {
  fetchAllRecords(page)
}
</script>

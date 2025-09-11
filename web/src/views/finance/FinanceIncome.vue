<template>
  <PageTemplate 
    title="收入管理" 
    description="管理园区各项收入来源和统计"
    icon="TrendCharts"
  >
    <template #header>
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="收入来源">
          <el-input v-model="searchForm.source" placeholder="输入收入来源搜索" clearable />
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
        <el-form-item>
          <el-button type="success" @click="handleAdd">新增收入</el-button>
        </el-form-item>
      </el-form>
    </template>

    <el-table v-loading="financeStore.loading" :data="financeStore.records" style="width: 100%">
      <el-table-column prop="transactionDate" label="日期" width="180" />
      <el-table-column prop="amount" label="金额" width="150" />
      <el-table-column prop="source" label="收入来源" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="日期">
          <el-date-picker v-model="form.transactionDate" type="date" placeholder="选择日期" />
        </el-form-item>
        <el-form-item label="金额">
          <el-input-number v-model="form.amount" :precision="2" :step="100" :min="0" />
        </el-form-item>
        <el-form-item label="收入来源">
          <el-input v-model="form.source" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </PageTemplate>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageTemplate from '@/components/PageTemplate.vue'
import { useFinanceStore } from '@/stores/finance'

const financeStore = useFinanceStore()

const searchForm = reactive({
  source: '',
  dateRange: [],
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = reactive({
  id: null,
  transactionType: 'income',
  transactionDate: '',
  amount: 0,
  source: '',
  description: '',
})

const fetchIncomeRecords = (page = 1) => {
  const params = {
    page,
    pageSize: financeStore.pagination.pageSize,
    source: searchForm.source || undefined,
    startDate: searchForm.dateRange?.[0] || undefined,
    endDate: searchForm.dateRange?.[1] || undefined,
  }
  financeStore.fetchRecordsByType('income', params)
}

onMounted(() => {
  fetchIncomeRecords()
})

const handleSearch = () => {
  fetchIncomeRecords(1)
}

const handlePageChange = (page) => {
  fetchIncomeRecords(page)
}

const handleAdd = () => {
  resetForm()
  dialogTitle.value = '新增收入'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  resetForm()
  Object.assign(form, row)
  dialogTitle.value = '编辑收入'
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (form.id) {
      await financeStore.updateRecord(form.id, form)
      ElMessage.success('更新成功')
    } else {
      await financeStore.createRecord(form)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchIncomeRecords(financeStore.pagination.page)
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除这条收入记录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await financeStore.deleteRecord(id)
      ElMessage.success('删除成功')
      fetchIncomeRecords(financeStore.pagination.page)
    })
    .catch(() => {
      // catch error
    })
}

const resetForm = () => {
  form.id = null
  form.transactionType = 'income'
  form.transactionDate = ''
  form.amount = 0
  form.source = ''
  form.description = ''
}
</script>

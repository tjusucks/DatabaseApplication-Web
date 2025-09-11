<template>
  <PageTemplate title="支出管理" description="管理和跟踪所有公园的支出项目" icon="Collection">
    <template #header>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="类型">
          <el-select v-model="searchForm.category" placeholder="请选择支出类别" clearable>
            <el-option label="员工工资" value="salary"></el-option>
            <el-option label="设施维护" value="maintenance"></el-option>
            <el-option label="营销费用" value="marketing"></el-option>
            <el-option label="其他" value="other"></el-option>
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
      <el-button type="primary" @click="openFormModal()">新增支出</el-button>
    </template>

    <el-table :data="financeStore.expenses" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="category" label="类别" width="150"></el-table-column>
      <el-table-column prop="amount" label="金额 (元)" width="150"></el-table-column>
      <el-table-column prop="description" label="描述"></el-table-column>
      <el-table-column prop="date" label="日期" width="180"></el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button link type="primary" @click="openFormModal(row)">编辑</el-button>
          <el-popconfirm title="确定删除吗？" @confirm="handleDelete(row.id)">
            <template #reference>
              <el-button link type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="form.id ? '编辑支出' : '新增支出'" v-model="formModalVisible" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="类别">
          <el-select v-model="form.category" placeholder="请选择支出类别">
            <el-option label="员工工资" value="salary"></el-option>
            <el-option label="设施维护" value="maintenance"></el-option>
            <el-option label="营销费用" value="marketing"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="金额">
          <el-input-number v-model="form.amount" :precision="2" :step="10" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="form.date" type="date" placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </PageTemplate>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import PageTemplate from '@/components/PageTemplate.vue'
import { useFinanceStore } from '@/stores/finance'
import { ElMessage } from 'element-plus'
import { createExpense, updateExpense, deleteExpense } from '@/api/finance'

const financeStore = useFinanceStore()
const loading = ref(false)
const searchForm = reactive({
  category: '',
  dateRange: []
})
const formModalVisible = ref(false)
const form = reactive({
  id: null,
  category: '',
  amount: 0,
  date: '',
  description: ''
})

onMounted(() => {
  fetchData()
})

const fetchData = async () => {
  loading.value = true
  const params = {
    category: searchForm.category || undefined,
    startDate: searchForm.dateRange?.[0] || undefined,
    endDate: searchForm.dateRange?.[1] || undefined,
  }
  await financeStore.fetchExpenses(params)
  loading.value = false
}

const handleSearch = () => {
  financeStore.pagination.currentPage = 1
  fetchData()
}

const resetSearch = () => {
  searchForm.category = ''
  searchForm.dateRange = []
  handleSearch()
}

const handlePageChange = (page) => {
  financeStore.pagination.currentPage = page
  fetchData()
}

const openFormModal = (rowData = null) => {
  if (rowData) {
    Object.assign(form, rowData)
  } else {
    Object.assign(form, { id: null, category: '', amount: 0, date: '', description: '' })
  }
  formModalVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (form.id) {
      await updateExpense(form.id, form)
      ElMessage.success('更新成功')
    } else {
      await createExpense(form)
      ElMessage.success('新增成功')
    }
    formModalVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (id) => {
  try {
    await deleteExpense(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}
</script>

<style scoped>
.search-form .el-form-item {
  margin-bottom: 0;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

<template>
  <FinancePageTemplate title="支出管理" description="记录和管理所有支出项目" icon="TakeawayBox">
    <template #header>
      <div class="header-controls">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="类型">
            <el-select v-model="searchForm.type" placeholder="请选择支出类型" clearable>
              <el-option label="员工工资" value="员工工资"></el-option>
              <el-option label="设备采购" value="设备采购"></el-option>
              <el-option label="日常运营" value="日常运营"></el-option>
              <el-option label="营销费用" value="营销费用"></el-option>
              <el-option label="其他" value="其他"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              clearable
              style="width: 240px;"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :icon="Search">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
        <el-button type="success" @click="openFormModal()" :icon="Plus">新增支出</el-button>
      </div>
    </template>

    <el-table :data="financeStore.expenses" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="type" label="类型" width="150"></el-table-column>
      <el-table-column prop="amount" label="金额 (元)" width="150" sortable>
        <template #default="{ row }">
          {{ parseFloat(row.amount).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述"></el-table-column>
      <el-table-column prop="date" label="日期" width="180" sortable></el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
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
      layout="prev, pager, next, total, sizes"
      :total="financeStore.pagination.total"
      :current-page.sync="financeStore.pagination.currentPage"
      :page-size="financeStore.pagination.pageSize"
      :page-sizes="[10, 20, 50, 100]"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
      class="pagination-container"
    ></el-pagination>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑支出' : '新增支出'" width="500px" @close="resetForm">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择支出类型" style="width: 100%;">
            <el-option label="员工工资" value="员工工资"></el-option>
            <el-option label="设备采购" value="设备采购"></el-option>
            <el-option label="日常运营" value="日常运营"></el-option>
            <el-option label="营销费用" value="营销费用"></el-option>
            <el-option label="其他" value="其他"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input-number v-model="form.amount" :precision="2" :step="10" :min="0" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-date-picker v-model="form.date" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%;"></el-date-picker>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </FinancePageTemplate>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import FinancePageTemplate from '@/views/finance/components/FinancePageTemplate.vue'
import { useFinanceStore } from '@/stores/finance'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'

const financeStore = useFinanceStore()
const loading = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)

const searchForm = reactive({
  type: '',
  dateRange: []
})

const initialFormState = {
  id: null,
  type: '',
  amount: 0,
  date: '',
  description: ''
}

const form = reactive({ ...initialFormState })

const rules = {
  type: [{ required: true, message: '请选择支出类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }]
}

const fetchData = async () => {
  loading.value = true
  const params = {
    page: financeStore.pagination.currentPage,
    pageSize: financeStore.pagination.pageSize,
    type: searchForm.type || undefined,
    startDate: searchForm.dateRange?.[0] || undefined,
    endDate: searchForm.dateRange?.[1] || undefined
  }
  try {
    await financeStore.fetchExpenses(params)
  } catch (error) {
    console.error('获取支出列表失败:', error)
  } finally {
    loading.value = false
  }
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

const handleSizeChange = (size) => {
  financeStore.pagination.pageSize = size
  financeStore.pagination.currentPage = 1
  fetchData()
}

const openFormModal = (expense = null) => {
  resetForm()
  if (expense) {
    Object.assign(form, expense)
  }
  dialogVisible.value = true
}

const resetForm = () => {
  Object.assign(form, initialFormState)
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.id) {
          await financeStore.updateExpense(form.id, form)
          ElMessage.success('更新成功')
        } else {
          await financeStore.addExpense(form)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error) {
        ElMessage.error(form.id ? '更新失败' : '新增失败')
      }
    }
  })
}

const handleDelete = async (id) => {
  try {
    await financeStore.deleteExpense(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

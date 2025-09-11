<template>
  <PageTemplate 
    title="支出管理" 
    description="管理园区运营成本和支出记录"
    icon="Minus"
  />
  <el-card class="box-card">
    <div class="toolbar">
      <el-form :inline="true" :model="searchParams">
        <el-form-item label="支出描述">
          <el-input v-model="searchParams.description" placeholder="请输入描述"></el-input>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchParams.dateRange"
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
      <el-button type="success" icon="Plus" @click="handleAdd">添加支出</el-button>
    </div>

    <el-table :data="financeStore.expenses" v-loading="financeStore.loading" style="width: 100%">
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="amount" label="金额">
        <template #default="{ row }">
          {{ formatCurrency(row.amount) }}
        </template>
      </el-table-column>
      <el-table-column prop="category" label="类别" />
      <el-table-column prop="record_date" label="记录日期">
         <template #default="{ row }">
          {{ formatDate(row.record_date) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      background
      layout="prev, pager, next, jumper, ->, total"
      :total="financeStore.expenseTotal"
      :current-page="searchParams.page"
      :page-size="searchParams.limit"
      @current-change="handlePageChange"
      style="margin-top: 20px; text-align: right;"
    />

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑支出' : '添加支出'" width="500px" @close="resetForm">
      <el-form :model="form" label-width="80px" ref="formRef">
        <el-form-item label="描述" prop="description" :rules="{ required: true, message: '请输入描述', trigger: 'blur' }">
          <el-input v-model="form.description"></el-input>
        </el-form-item>
        <el-form-item label="金额" prop="amount" :rules="{ required: true, message: '请输入金额', trigger: 'blur' }">
          <el-input-number v-model="form.amount" :precision="2" :step="1" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="类别" prop="category" :rules="{ required: true, message: '请输入类别', trigger: 'blur' }">
          <el-input v-model="form.category"></el-input>
        </el-form-item>
        <el-form-item label="记录日期" prop="record_date" :rules="{ required: true, message: '请选择日期', trigger: 'change' }">
          <el-date-picker v-model="form.record_date" type="date" placeholder="选择日期"></el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useFinanceStore } from '@/stores/finance'
import PageTemplate from '@/components/PageTemplate.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const financeStore = useFinanceStore()

const searchParams = reactive({
  page: 1,
  limit: 10,
  description: '',
  dateRange: [],
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const form = reactive({
  id: null,
  description: '',
  amount: 0,
  category: '',
  record_date: '',
})

onMounted(() => {
  fetchExpenses()
})

const fetchExpenses = () => {
  const params = {
    page: searchParams.page,
    limit: searchParams.limit,
    description: searchParams.description,
    start_date: searchParams.dateRange?.[0],
    end_date: searchParams.dateRange?.[1],
  }
  financeStore.fetchExpenses(params)
}

const handleSearch = () => {
  searchParams.page = 1
  fetchExpenses()
}

const handlePageChange = (page) => {
  searchParams.page = page
  fetchExpenses()
}

const handleAdd = () => {
  isEdit.value = false
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除这条支出记录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await financeStore.deleteExpense(id)
    ElMessage.success('删除成功')
    fetchExpenses()
  }).catch(() => {
    // a
  });
}

const resetForm = () => {
  formRef.value?.resetFields()
  form.id = null
  form.amount = 0
}

const submitForm = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (isEdit.value) {
        await financeStore.updateExpense(form.id, form)
        ElMessage.success('更新成功')
      } else {
        await financeStore.addExpense(form)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
      fetchExpenses()
    }
  })
}

const formatCurrency = (amount) => {
  return `¥ ${parseFloat(amount).toFixed(2)}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString()
}
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.box-card {
  margin: 20px;
}
</style>

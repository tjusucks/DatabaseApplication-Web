<template>
  <FinancePageTemplate title="收入管理" description="记录和管理所有收入项目" icon="Money">
    <template #header>
      <div class="header-controls">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="类型">
            <el-select v-model="searchForm.type" placeholder="请选择收入类型" clearable>
              <el-option label="门票销售" value="门票销售"></el-option>
              <el-option label="商品销售" value="商品销售"></el-option>
              <el-option label="餐饮收入" value="餐饮收入"></el-option>
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
        <el-button type="success" @click="openFormModal()" :icon="Plus">新增收入</el-button>
      </div>
    </template>

    <el-table :data="financeStore.incomes" v-loading="loading" stripe>
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
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑收入' : '新增收入'" width="500px" @close="resetForm">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择收入类型" style="width: 100%;">
            <el-option label="门票销售" value="门票销售"></el-option>
            <el-option label="商品销售" value="商品销售"></el-option>
            <el-option label="餐饮收入" value="餐饮收入"></el-option>
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
import FinancePageTemplate from '@/views/finance/components/FinancePageTemplate.vue' // 修正路径
import { useFinanceStore } from '@/stores/finance'
import { ElMessage } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue' // 导入图标

const financeStore = useFinanceStore()
const loading = ref(false)
const searchForm = reactive({
  type: '',
  dateRange: []
})
const dialogVisible = ref(false)
const formRef = ref(null)
const form = reactive({
  id: null,
  type: '',
  amount: 0,
  date: '',
  description: ''
})

const rules = {
  type: [{ required: true, message: '请选择收入类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }, { type: 'number', min: 0.01, message: '金额必须大于0' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
}

onMounted(() => {
  fetchData()
})

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      type: searchForm.type || undefined,
      // 确保正确格式化日期
      startDate: searchForm.dateRange && searchForm.dateRange[0] ? new Date(searchForm.dateRange[0]).toISOString().split('T')[0] : undefined,
      // 将结束日期调整为当天的最后一秒，以确保包含当天所有数据
      endDate: searchForm.dateRange && searchForm.dateRange[1] ? new Date(new Date(searchForm.dateRange[1]).setHours(23, 59, 59, 999)).toISOString() : undefined,
      page: financeStore.pagination.currentPage,
      pageSize: financeStore.pagination.pageSize,
    }
    await financeStore.fetchIncomes(params)
  } catch (error) {
    console.error("获取收入数据失败:", error)
    ElMessage.error('获取收入数据失败，请检查网络或联系管理员。')
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
  financeStore.pagination.currentPage = 1 // 切换每页大小时回到第一页
  fetchData()
}

const openFormModal = (rowData = null) => {
  resetForm()
  if (rowData) {
    // 编辑
    Object.assign(form, rowData)
  } else {
    // 新增，设置默认值
    form.date = new Date().toISOString().split('T')[0]
  }
  dialogVisible.value = true
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.id = null
  form.type = ''
  form.amount = 0
  form.date = ''
  form.description = ''
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.id) {
          // 编辑
          await financeStore.updateIncome(form.id, form)
          ElMessage.success('更新成功')
        } else {
          // 新增
          await financeStore.addIncome(form)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        await fetchData() // 重新获取数据
      } catch (error) {
        ElMessage.error(form.id ? '更新失败' : '新增失败')
      }
    }
  })
}

const handleDelete = async (id) => {
  try {
    await financeStore.deleteIncome(id)
    ElMessage.success('删除成功')
    await fetchData() // 重新获取数据
  } catch (error) {
    ElMessage.error('删除失败')
  }
}
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

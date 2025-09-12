<template>
  <FinancePageTemplate title="支出管理" description="记录和管理所有支出项目" icon="TakeawayBox">
    <template #header>
      <div class="header-controls">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="支付方式">
            <el-select v-model="searchForm.paymentMethod" placeholder="请选择支付方式" clearable>
              <el-option
                v-for="option in PaymentMethodOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              ></el-option>
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
      <el-table-column prop="recordId" label="ID" width="80"></el-table-column>
      <el-table-column prop="amount" label="金额 (元)" width="150" sortable>
        <template #default="{ row }">
          {{ parseFloat(row.amount).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="paymentMethod" label="支付方式" width="120">
        <template #default="{ row }">
          {{ getPaymentMethodName(row.paymentMethod) }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述"></el-table-column>
      <el-table-column prop="transactionDate" label="日期" width="180" sortable></el-table-column>
      <!--
      <el-table-column label="负责员工ID" prop="responsibleEmployeeId" width="120"></el-table-column>
      <el-table-column label="批准人ID" prop="approvedById" width="120"></el-table-column>
      -->
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openFormModal(row)">编辑</el-button>
          <el-popconfirm title="确定删除吗？" @confirm="handleDelete(row)">
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
    <el-dialog v-model="dialogVisible" :title="form.recordId ? '编辑支出' : '新增支出'" width="500px" @close="resetForm">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="金额" prop="amount">
          <el-input-number v-model="form.amount" :precision="2" :step="10" :min="0" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="支付方式" prop="paymentMethod">
          <el-select v-model="form.paymentMethod" placeholder="请选择支付方式" style="width: 100%;" clearable>
            <el-option
              v-for="option in PaymentMethodOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="日期" prop="transactionDate">
          <el-date-picker v-model="form.transactionDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%;"></el-date-picker>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述 (例如：采购办公用品)"></el-input>
        </el-form-item>
        <!--
        <el-form-item label="负责员工ID" prop="responsibleEmployeeId">
          <el-input-number v-model="form.responsibleEmployeeId" :controls="false" placeholder="输入员工ID (可选)" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="批准人ID" prop="approvedById">
          <el-input-number v-model="form.approvedById" :controls="false" placeholder="输入批准人ID (可选)" style="width: 100%;"></el-input-number>
        </el-form-item>
        -->
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </FinancePageTemplate>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import FinancePageTemplate from '@/views/finance/components/FinancePageTemplate.vue'
import { useFinanceStore } from '@/stores/finance'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import {
  PaymentMethodOptions,
  getPaymentMethodName,
  UnifiedTransactionType, // 引入 UnifiedTransactionType
} from '@/utils/constants'

const financeStore = useFinanceStore()
const loading = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)

// 将搜索表单的响应式对象与 store 中的持久化参数关联
const searchForm = reactive({
  transactionType: financeStore.lastExpenseParams.transactionType || '',
  paymentMethod: financeStore.lastExpenseParams.paymentMethod || '',
  dateRange: financeStore.lastExpenseParams.startDate && financeStore.lastExpenseParams.endDate
    ? [financeStore.lastExpenseParams.startDate, financeStore.lastExpenseParams.endDate]
    : []
})

const initialFormState = {
  recordId: null,
  amount: 0,
  transactionDate: '',
  description: '',
  transactionType: null,
  paymentMethod: null,
  responsibleEmployeeId: null,
  approvedById: null
}

const form = reactive({ ...initialFormState })

const rules = {
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }, { type: 'number', min: 0.01, message: '金额必须大于0' }],
  transactionDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
  paymentMethod: [{ required: true, message: '请选择支付方式', trigger: 'change' }],
}

// 使用计算属性直接从 store 获取分页信息
const currentPage = computed({
  get: () => financeStore.pagination.currentPage,
  set: (val) => { financeStore.pagination.currentPage = val }
})

const pageSize = computed({
  get: () => financeStore.pagination.pageSize,
  set: (val) => { financeStore.pagination.pageSize = val }
})

const fetchData = async (params = {}) => {
  loading.value = true
  try {
    let endDate = searchForm.dateRange && searchForm.dateRange[1] ? searchForm.dateRange[1] : undefined
    if (endDate) {
      // 将结束日期设置为当天的 23:59:59，以确保包含当天所有数据
      endDate = new Date(endDate)
      endDate.setHours(23, 59, 59, 999)
    }

    const queryParams = {
      ...params,
      transactionType: searchForm.transactionType !== '' ? searchForm.transactionType : undefined,
      paymentMethod: searchForm.paymentMethod !== '' ? searchForm.paymentMethod : undefined,
      startDate: searchForm.dateRange && searchForm.dateRange[0] ? searchForm.dateRange[0] : undefined,
      endDate: endDate ? endDate.toISOString() : undefined
    }
    await financeStore.fetchExpenses(queryParams)
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
  searchForm.transactionType = ''
  searchForm.dateRange = []
  searchForm.paymentMethod = ''
  handleSearch()
}

const handlePageChange = (page) => {
  fetchData({ page })
}

const handleSizeChange = (size) => {
  fetchData({ pageSize: size, page: 1 })
}

const openFormModal = (expense = null) => {
  resetForm()
  if (expense) {
    // 对于非 'manual' 来源的记录，禁用编辑
    if (expense.source && expense.source !== 'manual') {
      ElMessage.warning(`该记录来自 ${expense.source} 系统，为只读数据，不能在此处编辑。`);
      return;
    }
    Object.assign(form, expense)
  } else {
    // 新增时设置默认日期和类型
    form.transactionDate = new Date().toISOString().split('T')[0]
    form.transactionType = UnifiedTransactionType.OTHER_EXPENSE; // 默认类型为其他支出
  }
  dialogVisible.value = true
}

const resetForm = () => {
  Object.assign(form, initialFormState)
  if (formRef.value) {
    formRef.value.resetFields()
    // 由于 resetFields 可能不会将所有字段重置为 initialFormState 的值（例如，如果表单中没有对应的 el-form-item），
    // 我们再次手动确保关键字段被重置。
    form.recordId = null
    form.transactionType = null
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const payload = { ...form }
        if (form.recordId) {
          await financeStore.updateExpense(form.recordId, payload)
        } else {
          await financeStore.addExpense(payload)
        }
        dialogVisible.value = false
      } catch (error) {
        console.error('操作失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

const handleDelete = async (row) => {
  loading.value = true
  try {
    // 传递记录的 ID 和来源信息，以便 store 正确处理
    await financeStore.deleteExpense(row.recordId, row.source)
  } catch (error) {
    console.error('删除失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 组件挂载时，使用 store 中保存的参数（如果有）来获取数据
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

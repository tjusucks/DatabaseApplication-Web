<template>
  <FinancePageTemplate title="收入管理" description="记录和管理所有收入项目" icon="Money">
    <template #header>
      <div class="header-controls">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <!-- 类型筛选功能后端不支持，暂时禁用
          <el-form-item label="类型">
            <el-select v-model="searchForm.type" placeholder="请选择收入类型" clearable>
              <el-option
                v-for="option in incomeTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              ></el-option>
            </el-select>
          </el-form-item>
          -->
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
        <el-button type="success" @click="openFormModal()" :icon="Plus">新增收入</el-button>
      </div>
    </template>

    <el-table :data="financeStore.incomes" v-loading="loading" stripe>
      <el-table-column prop="recordId" label="ID" width="80"></el-table-column>
      <el-table-column prop="transactionType" label="类型" width="150">
        <template #default="{ row }">
          {{ getTransactionTypeName(row.transactionType) }}
        </template>
      </el-table-column>
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
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openFormModal(row)">编辑</el-button>
          <el-popconfirm title="确定删除吗？" @confirm="handleDelete(row.recordId)">
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
    <el-dialog v-model="dialogVisible" :title="form.recordId ? '编辑收入' : '新增收入'" width="500px" @close="resetForm">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <!-- '类型'字段在后端模型中不存在，UI上将其合并到'描述'中 -->
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
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述 (可选)"></el-input>
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
import { ref, onMounted, reactive, computed } from 'vue'
import FinancePageTemplate from '@/views/finance/components/FinancePageTemplate.vue'
import { useFinanceStore } from '@/stores/finance'
import { ElMessage } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import {
  PaymentMethodOptions,
  getPaymentMethodName,
  getTransactionTypeName
} from '@/utils/constants'

const financeStore = useFinanceStore()
const loading = ref(false)

// 将搜索表单的响应式对象与 store 中的持久化参数关联
const searchForm = reactive({
  // type: financeStore.lastIncomeParams.type || '', // 后端不支持，移除
  paymentMethod: financeStore.lastIncomeParams.paymentMethod || '',
  dateRange: financeStore.lastIncomeParams.startDate && financeStore.lastIncomeParams.endDate
    ? [financeStore.lastIncomeParams.startDate, financeStore.lastIncomeParams.endDate]
    : []
})

const dialogVisible = ref(false)
const formRef = ref(null)

const initialFormState = {
  recordId: null,
  amount: 0,
  transactionDate: '',
  description: '',
  transactionType: 0, // 0 for Income
  paymentMethod: null,
}

const form = reactive({ ...initialFormState })

const rules = {
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }, { type: 'number', min: 0.01, message: '金额必须大于0' }],
  transactionDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
  // description: [{ required: true, message: '请输入描述', trigger: 'blur' }], // 描述变为非必需
}

// 使用计算属性直接从 store 获取分页信息，以确保双向绑定
const currentPage = computed({
  get: () => financeStore.pagination.currentPage,
  set: (val) => { financeStore.pagination.currentPage = val }
})

const pageSize = computed({
  get: () => financeStore.pagination.pageSize,
  set: (val) => { financeStore.pagination.pageSize = val }
})


onMounted(() => {
  // 页面加载时，使用 store 中已有的参数（如果有）来获取数据
  fetchData()
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

    // 合并来自搜索表单的最新参数
    const queryParams = {
      ...params,
      paymentMethod: searchForm.paymentMethod !== '' ? searchForm.paymentMethod : undefined,
      startDate: searchForm.dateRange && searchForm.dateRange[0] ? searchForm.dateRange[0] : undefined,
      endDate: endDate ? endDate.toISOString() : undefined
    }
    await financeStore.fetchIncomes(queryParams)
  } catch (error) {
    console.error('获取收入数据失败:', error)
    // store 中已有错误提示，这里不再重复
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // 搜索时，重置到第一页
  financeStore.pagination.currentPage = 1
  fetchData()
}

const resetSearch = () => {
  // searchForm.type = '' // 移除
  searchForm.dateRange = []
  searchForm.paymentMethod = ''
  // 重置搜索同样需要重置分页并重新获取数据
  handleSearch()
}

const handlePageChange = (page) => {
  // 页面变化时，仅传递 page 参数
  fetchData({ page })
}

const handleSizeChange = (size) => {
  // 页面大小变化时，传递 pageSize 并重置到第一页
  fetchData({ pageSize: size, page: 1 })
}

const openFormModal = (rowData = null) => {
  resetForm()
  if (rowData) {
    // 编辑
    Object.assign(form, rowData)
  } else {
    // 新增，设置默认值
    form.transactionDate = new Date().toISOString().split('T')[0]
    // form.paymentMethod = PaymentMethod.Cash // 不再设置默认支付方式，让用户选择
  }
  dialogVisible.value = true
}

const resetForm = () => {
  Object.assign(form, initialFormState)
  if (formRef.value) {
    formRef.value.resetFields()
    // 确保关键字段在 resetFields 后也被重置
    form.recordId = null
    form.transactionType = 0 // 确保重置后类型正确
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true; // 开始操作时显示加载状态
      try {
        const payload = { ...form };

        if (form.recordId) {
          // 编辑
          await financeStore.updateIncome(form.recordId, payload)
        } else {
          // 新增
          await financeStore.addIncome(payload)
        }
        dialogVisible.value = false
        // 无需手动调用 fetchData()，因为 store action 内部会刷新
      } catch (error) {
        // store 中已有错误提示，这里不再重复
        console.error('操作失败:', error);
      } finally {
        loading.value = false; // 结束操作时隐藏加载状态
      }
    }
  })
}

const handleDelete = async (id) => {
  loading.value = true; // 开始操作时显示加载状态
  try {
    await financeStore.deleteIncome(id)
    // 无需手动调用 fetchData() 或显示成功消息，store action 已处理
  } catch (error) {
    // store 中已有错误提示，这里不再重复
    console.error('删除失败:', error);
  } finally {
    loading.value = false; // 结束操作时隐藏加载状态
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

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as financeApi from '@/api/finance'

export const useFinanceStore = defineStore('finance', () => {
  // 状态
  const incomes = ref([])
  const expenses = ref([])
  const summary = ref({})
  const groupedStats = ref([])
  const timeStats = ref([])
  const monthlyStats = ref([]) // 月度统计数据
  const detailRecords = ref([]) // 用于详情页的数据
  const pagination = ref({
    total: 0,
    currentPage: 1,
    pageSize: 10
  })
  const lastIncomeParams = ref({}) // 保存上次收入查询参数
  const lastExpenseParams = ref({}) // 保存上次支出查询参数

  // --- Actions ---

  // 获取单条财务记录
  const fetchFinancialRecordById = async (id) => {
    try {
      const response = await financeApi.getFinancialRecordById(id);
      return response.data;
    } catch (error) {
      const status = error.response?.status || '未知'
      ElMessage.error(`获取财务记录详情失败！错误码: ${status}`);
      throw error;
    }
  }

  // Helper to format date to YYYY-MM-DD
  const formatDate = (date) => {
    // 增加健壮性，如果date无效，则返回null
    if (!date || isNaN(new Date(date).getTime())) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 获取收入列表
  const fetchIncomes = async (params) => {
    // 如果传入了新的 params，则更新 lastIncomeParams。
    // 如果没有传入（例如，在增删改后刷新），则使用 lastIncomeParams。
    if (params) {
      // 当用户改变分页时，params 会是 { page, pageSize }，需要与之前的搜索条件合并
      if (params.page) {
        pagination.value.currentPage = params.page
      }
      if (params.pageSize) {
        pagination.value.pageSize = params.pageSize
      }
      // 合并新的搜索/筛选条件，而不是完全替换
      lastIncomeParams.value = { ...lastIncomeParams.value, ...params }
    }

    try {
      const query = {
        ...lastIncomeParams.value,
        transactionType: 0, // 使用数字枚举值
        page: pagination.value.currentPage,
        pageSize: pagination.value.pageSize
      }
      const response = await financeApi.searchFinancialRecords(query)
      incomes.value = response.financialRecords // 修正：API返回的数组在 financialRecords 属性中
      pagination.value.total = response.totalCount // 修正：API返回的总数在 totalCount 属性中
      return response
    } catch (error) {
      const status = error.response?.status;
      const message = error.message || `获取收入列表失败！`;
      ElMessage.error(status ? `${message} 错误码: ${status}` : message);
      incomes.value = []
      pagination.value.total = 0
      // 重置分页和参数，避免无效状态
      pagination.value.currentPage = 1
      lastIncomeParams.value = {}
      throw error
    }
  }

  // 新增收入
  const addIncome = async (income) => {
    try {
      const payload = {
        ...income,
        transactionType: 0, // 确保 transactionType 正确
        transactionDate: formatDate(income.transactionDate),
        paymentMethod: income.paymentMethod, // 直接使用，如果为 null 则发送 null
        // responsibleEmployeeId 和 approvedById 不再由前端发送
      };
      // 后端不需要 id 和 type 字段
      delete payload.recordId; // 确保不发送 recordId
      delete payload.type; // 移除 type 字段
      delete payload.responsibleEmployeeId;
      delete payload.approvedById;
      
      const response = await financeApi.createFinancialRecord(payload);
      ElMessage.success('新增收入成功！');
      await fetchIncomes(); // 刷新列表，将使用 lastIncomeParams
      return response;
    } catch (error) {
      const status = error.response?.status;
      const message = error.message || `新增收入失败！`;
      ElMessage.error(status ? `${message} 错误码: ${status}` : message);
      throw error;
    }
  }

  // 更新收入
  const updateIncome = async (id, income) => {
    try {
      const payload = {
        ...income,
        transactionDate: formatDate(income.transactionDate),
        paymentMethod: income.paymentMethod, // 直接使用
        // responsibleEmployeeId 和 approvedById 不再由前端发送
      };
      // 后端不需要 date 和 type 字段
      delete payload.date;
      delete payload.type; // 移除 type 字段
      delete payload.responsibleEmployeeId;
      delete payload.approvedById;

      const response = await financeApi.updateFinancialRecord(id, payload);
      ElMessage.success('更新收入成功！');
      await fetchIncomes(); // 刷新列表，将使用 lastIncomeParams
      return response;
    } catch (error) {
      const status = error.response?.status;
      const message = error.message || `更新收入失败！`;
      ElMessage.error(status ? `${message} 错误码: ${status}` : message);
      throw error;
    }
  }

  // 删除收入
  const deleteIncome = async (id) => {
    try {
      await financeApi.deleteFinancialRecord(id);
      ElMessage.success('删除收入成功！');
      await fetchIncomes(); // 刷新列表，将使用 lastIncomeParams
    } catch (error) {
      const status = error.response?.status;
      const message = error.message || `删除收入失败！`;
      ElMessage.error(status ? `${message} 错误码: ${status}` : message);
      throw error;
    }
  }

  // 获取支出列表
  const fetchExpenses = async (params) => {
    // 如果传入了新的 params，则更新 lastExpenseParams。
    // 如果没有传入（例如，在增删改后刷新），则使用 lastExpenseParams。
    if (params) {
      if (params.page) {
        pagination.value.currentPage = params.page
      }
      if (params.pageSize) {
        pagination.value.pageSize = params.pageSize
      }
      lastExpenseParams.value = { ...lastExpenseParams.value, ...params }
    }

    try {
      const query = {
        ...lastExpenseParams.value,
        transactionType: 1, // 使用数字枚举值
        page: pagination.value.currentPage,
        pageSize: pagination.value.pageSize
      }
      const response = await financeApi.searchFinancialRecords(query)
      expenses.value = response.financialRecords // 修正：API返回的数组在 financialRecords 属性中
      pagination.value.total = response.totalCount // 修正：API返回的总数在 totalCount 属性中
      return response
    } catch (error) {
      const status = error.response?.status;
      const message = error.message || `获取支出列表失败！`;
      ElMessage.error(status ? `${message} 错误码: ${status}` : message);
      expenses.value = []
      pagination.value.total = 0
      // 重置分页和参数，避免无效状态
      pagination.value.currentPage = 1
      lastExpenseParams.value = {}
      throw error
    }
  }

  // 新增支出
  const addExpense = async (expense) => {
    try {
      const payload = {
        ...expense,
        transactionType: 1, // 确保 transactionType 正确
        transactionDate: formatDate(expense.transactionDate),
        paymentMethod: expense.paymentMethod, // 直接使用
        // responsibleEmployeeId 和 approvedById 不再由前端发送
      };
      // 后端不需要 id 和 type 字段
      delete payload.recordId; // 确保不发送 recordId
      delete payload.type; // 移除 type 字段
      delete payload.responsibleEmployeeId;
      delete payload.approvedById;

      const response = await financeApi.createFinancialRecord(payload);
      ElMessage.success('新增支出成功！');
      await fetchExpenses(); // 刷新列表，将使用 lastExpenseParams
      return response;
    } catch (error) {
      const status = error.response?.status;
      const message = error.message || `新增支出失败！`;
      ElMessage.error(status ? `${message} 错误码: ${status}` : message);
      // 临时措施：即使后端返回500错误，也尝试刷新列表
      if (status === 500) {
        ElMessage.info('尝试刷新列表以显示可能已添加的数据...');
        await fetchExpenses(); // 刷新列表，将使用 lastExpenseParams
      }
      throw error;
    }
  }

  // 更新支出
  const updateExpense = async (id, expense) => {
    try {
      const payload = {
        ...expense,
        transactionDate: formatDate(expense.transactionDate),
        paymentMethod: expense.paymentMethod, // 直接使用
        // responsibleEmployeeId 和 approvedById 不再由前端发送
      };
      // 后端不需要 date 和 type 字段
      delete payload.date;
      delete payload.type; // 移除 type 字段
      delete payload.responsibleEmployeeId;
      delete payload.approvedById;

      const response = await financeApi.updateFinancialRecord(id, payload);
      ElMessage.success('更新支出成功！');
      await fetchExpenses(); // 刷新列表，将使用 lastExpenseParams
      return response;
    } catch (error) {
      const status = error.response?.status;
      const message = error.message || `更新支出失败！`;
      ElMessage.error(status ? `${message} 错误码: ${status}` : message);
      throw error;
    }
  }

  // 删除支出
  const deleteExpense = async (id) => {
    try {
      await financeApi.deleteFinancialRecord(id);
      ElMessage.success('删除支出成功！');
      await fetchExpenses(); // 刷新列表，将使用 lastExpenseParams
    } catch (error) {
      const status = error.response?.status;
      const message = error.message || `删除支出失败！`;
      ElMessage.error(status ? `${message} 错误码: ${status}` : message);
      throw error;
    }
  }

  // 获取财务概览
  const fetchSummary = async (params) => {
    try {
      const response = await financeApi.getFinanceOverview(params)
      summary.value = response.data
      return response
    } catch (error) {
      const status = error.response?.status;
      const message = error.message || `获取财务总览失败！`;
      ElMessage.error(status ? `${message} 错误码: ${status}` : message);
      throw error;
    }
  }

  // 按类型分组获取财务统计
  const fetchGroupedStats = async (params) => {
    try {
      const response = await financeApi.getGroupedFinancialStats(params);
      groupedStats.value = response; // API 直接返回数组
      return response;
    } catch (error) {
      const status = error.response?.status;
      const message = error.message || `获取分组统计失败！`;
      ElMessage.error(status ? `${message} 错误码: ${status}` : message);
      throw error;
    }
  }

  // 获取时间序列财务统计
  const fetchTimeStats = async (params) => {
    try {
      const response = await financeApi.getTimeSeriesFinancialStats(params);
      timeStats.value = response.data;
      return response;
    } catch (error) {
      const status = error.response?.status;
      const message = error.message || `获取时间序列统计失败！`;
      ElMessage.error(status ? `${message} 错误码: ${status}` : message);
      throw error;
    }
  }

  // 获取月度财务统计
  const fetchMonthlyStats = async (params) => {
    try {
      const response = await financeApi.getMonthlyFinancialSummary(params);
      monthlyStats.value = response; // API 直接返回数组
      return response;
    } catch (error) {
      const status = error.response?.status;
      const message = error.message || `获取月度统计失败！`;
      ElMessage.error(status ? `${message} 错误码: ${status}` : message);
      throw error;
    }
  }

  // 获取特定类型财务记录 (用于报表详情)
  const fetchRecordsByType = async (params) => {
    try {
      const query = {
        ...params,
        page: pagination.value.currentPage,
        pageSize: pagination.value.pageSize
      }
      const response = await financeApi.searchFinancialRecords(query);
      detailRecords.value = response.financialRecords; // 修正：API返回的数组在 financialRecords 属性中
      pagination.value.total = response.totalCount; // 修正：API返回的总数在 totalCount 属性中
      return response;
    } catch (error) {
      const status = error.response?.status;
      const message = error.message || `获取特定类型记录失败！`;
      ElMessage.error(status ? `${message} 错误码: ${status}` : message);
      throw error;
    }
  }

  // 重置/清空状态的方法
  const resetFinanceState = () => {
    incomes.value = []
    expenses.value = []
    summary.value = {}
    groupedStats.value = []
    timeStats.value = []
    monthlyStats.value = []
    detailRecords.value = []
    pagination.value = {
      total: 0,
      currentPage: 1,
      pageSize: 10
    }
    lastIncomeParams.value = {}
    lastExpenseParams.value = {}
  }

  return {
    incomes,
    expenses,
    summary,
    groupedStats,
    timeStats,
    monthlyStats,
    detailRecords,
    pagination,
    lastIncomeParams,
    lastExpenseParams,
    fetchFinancialRecordById,
    fetchIncomes,
    addIncome,
    updateIncome,
    deleteIncome,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    fetchSummary,
    fetchGroupedStats,
    fetchTimeStats,
    fetchMonthlyStats,
    fetchRecordsByType,
    resetFinanceState
  }
})

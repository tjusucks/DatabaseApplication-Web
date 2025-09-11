import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as financeApi from '@/api/finance'

export const useFinanceStore = defineStore('finance', () => {
  // 状态
  const incomes = ref([])
  const expenses = ref([])
  const consumptionRecords = ref([])
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

  // --- Actions ---

  // 获取收入列表
  const fetchIncomes = async (params) => {
    try {
      const query = { 
        ...params, 
        transactionType: 'income', 
        page: pagination.value.currentPage, 
        pageSize: pagination.value.pageSize 
      }
      const response = await financeApi.searchFinancialRecords(query)
      incomes.value = response.data
      pagination.value.total = response.total
      return response
    } catch (error) {
      const status = error.response?.status || '未知'
      ElMessage.error(`获取收入列表失败！错误码: ${status}`)
      incomes.value = []
      pagination.value.total = 0
      throw error
    }
  }

  // 新增收入
  const addIncome = async (income) => {
    try {
      // 确保添加了 transactionType
      return await financeApi.createFinancialRecord({ ...income, transactionType: 'income' });
    } catch (error) {
      const status = error.response?.status || '未知'
      ElMessage.error(`新增收入失败！错误码: ${status}`);
      throw error;
    }
  }

  // 更新收入
  const updateIncome = async (id, income) => {
    try {
      return await financeApi.updateFinancialRecord(id, income);
    } catch (error) {
      const status = error.response?.status || '未知'
      ElMessage.error(`更新收入失败！错误码: ${status}`);
      throw error;
    }
  }

  // 删除收入
  const deleteIncome = async (id) => {
    try {
      await financeApi.deleteFinancialRecord(id);
    } catch (error) {
      const status = error.response?.status || '未知'
      ElMessage.error(`删除收入失败！错误码: ${status}`);
      throw error;
    }
  }

  // 获取支出列表
  const fetchExpenses = async (params) => {
    try {
      const query = { 
        ...params, 
        transactionType: 'expense', 
        page: pagination.value.currentPage, 
        pageSize: pagination.value.pageSize 
      }
      const response = await financeApi.searchFinancialRecords(query)
      expenses.value = response.data
      pagination.value.total = response.total
      return response
    } catch (error) {
      const status = error.response?.status || '未知'
      ElMessage.error(`获取支出列表失败！错误码: ${status}`)
      expenses.value = []
      pagination.value.total = 0
      throw error
    }
  }

  // 新增支出
  const addExpense = async (expense) => {
    try {
      return await financeApi.createFinancialRecord({ ...expense, transactionType: 'expense' });
    } catch (error) {
      const status = error.response?.status || '未知'
      ElMessage.error(`新增支出失败！错误码: ${status}`);
      throw error;
    }
  }

  // 更新支出
  const updateExpense = async (id, expense) => {
    try {
      return await financeApi.updateFinancialRecord(id, expense);
    } catch (error) {
      const status = error.response?.status || '未知'
      ElMessage.error(`更新支出失败！错误码: ${status}`);
      throw error;
    }
  }

  // 删除支出
  const deleteExpense = async (id) => {
    try {
      await financeApi.deleteFinancialRecord(id);
    } catch (error) {
      const status = error.response?.status || '未知'
      ElMessage.error(`删除支出失败！错误码: ${status}`);
      throw error;
    }
  }

  // 获取消费记录
  const fetchConsumptionRecords = async (params) => {
    try {
      const query = { 
        ...params, 
        transactionType: 'consumption', 
        page: pagination.value.currentPage, 
        pageSize: pagination.value.pageSize 
      }
      const response = await financeApi.searchFinancialRecords(query)
      consumptionRecords.value = response.data
      pagination.value.total = response.total
      return response
    } catch (error) {
      const status = error.response?.status || '未知'
      ElMessage.error(`获取消费记录失败！错误码: ${status}`)
      consumptionRecords.value = []
      pagination.value.total = 0
      throw error
    }
  }

  // 获取财务总览
  const fetchFinanceSummary = async (params) => {
    try {
      const response = await financeApi.getFinanceOverview(params)
      summary.value = response.data
      return response
    } catch (error) {
      const status = error.response?.status || '未知'
      ElMessage.error(`获取财务总览失败！错误码: ${status}`)
      summary.value = {}
      throw error
    }
  }

  // 获取分组统计
  const fetchFinanceGroupedByType = async (params) => {
    try {
      const response = await financeApi.getFinanceGroupedStats(params)
      groupedStats.value = response.data
      return response
    } catch (error) {
      const status = error.response?.status || '未知'
      ElMessage.error(`获取分组统计失败！错误码: ${status}`)
      groupedStats.value = []
      throw error
    }
  }

  // 获取月度统计
  const fetchFinanceByMonth = async (params) => {
    try {
      // 使用 getFinanceStats 并指定粒度
      const response = await financeApi.getFinanceStats({ ...params, granularity: 'month' })
      monthlyStats.value = response.data
      return response
    } catch (error) {
      const status = error.response?.status || '未知'
      ElMessage.error(`获取月度统计失败！错误码: ${status}`)
      monthlyStats.value = []
      throw error
    }
  }

  // 获取时间段统计
  const fetchFinanceOverTime = async (params) => {
    try {
      // 使用 getFinanceStats 并指定粒度
      const response = await financeApi.getFinanceStats({ ...params, granularity: 'day' })
      timeStats.value = response.data
      return response
    } catch (error) {
      const status = error.response?.status || '未知'
      ElMessage.error(`获取时间段统计失败！错误码: ${status}`)
      timeStats.value = []
      throw error
    }
  }
  
  // 用于详情页的数据获取
  const fetchDetailsByType = async (transactionType, params) => {
    try {
      const response = await financeApi.getRecordsByType(transactionType, params);
      detailRecords.value = response.data;
      return response;
    } catch (error) {
      const status = error.response?.status || '未知'
      ElMessage.error(`获取详情数据失败！错误码: ${status}`);
      detailRecords.value = [];
      throw error;
    }
  };

  return {
    incomes,
    expenses,
    consumptionRecords,
    summary,
    groupedStats,
    timeStats,
    monthlyStats,
    detailRecords,
    pagination,
    fetchIncomes,
    addIncome,
    updateIncome,
    deleteIncome,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    fetchConsumptionRecords,
    fetchFinanceSummary,
    fetchFinanceGroupedByType,
    fetchFinanceOverTime,
    fetchFinanceByMonth,
    fetchDetailsByType
  }
})

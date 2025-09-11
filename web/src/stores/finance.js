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
  const monthlyStats = ref([]) // 新增月度统计数据
  const pagination = ref({
    total: 0,
    currentPage: 1,
    pageSize: 10
  })

  // --- Actions ---

  // 获取收入列表
  const fetchIncomes = async (params) => {
    try {
      const response = await financeApi.getIncomes({ ...params, page: pagination.value.currentPage, pageSize: pagination.value.pageSize })
      incomes.value = response.data
      pagination.value.total = response.total
      return response
    } catch (error) {
      ElMessage.error('获取收入列表失败！')
      incomes.value = []
      pagination.value.total = 0
      throw error
    }
  }

  // 新增收入
  const addIncome = async (income) => {
    try {
      return await financeApi.createIncome(income);
    } catch (error) {
      ElMessage.error('新增收入失败');
      throw error;
    }
  }

  // 更新收入
  const updateIncome = async (id, income) => {
    try {
      return await financeApi.updateIncome(id, income);
    } catch (error) {
      ElMessage.error('更新收入失败');
      throw error;
    }
  }

  // 删除收入
  const deleteIncome = async (id) => {
    try {
      await financeApi.deleteIncome(id);
    } catch (error) {
      ElMessage.error('删除收入失败');
      throw error;
    }
  }

  // 新增支出
  const addExpense = async (expense) => {
    try {
      return await financeApi.createExpense(expense);
    } catch (error) {
      ElMessage.error('新增支出失败');
      throw error;
    }
  }

  // 更新支出
  const updateExpense = async (id, expense) => {
    try {
      return await financeApi.updateExpense(id, expense);
    } catch (error) {
      ElMessage.error('更新支出失败');
      throw error;
    }
  }

  // 删除支出
  const deleteExpense = async (id) => {
    try {
      await financeApi.deleteExpense(id);
    } catch (error) {
      ElMessage.error('删除支出失败');
      throw error;
    }
  }


  // 获取支出列表
  const fetchExpenses = async (params) => {
    try {
      const response = await financeApi.getExpenses({ ...params, page: pagination.value.currentPage, pageSize: pagination.value.pageSize })
      expenses.value = response.data
      pagination.value.total = response.total
      return response
    } catch (error) {
      ElMessage.error('获取支出列表失败！')
      expenses.value = []
      pagination.value.total = 0
      throw error
    }
  }

  // 获取消费记录
  const fetchConsumptionRecords = async (params) => {
    try {
      const response = await financeApi.getConsumptionRecords({ ...params, page: pagination.value.currentPage, pageSize: pagination.value.pageSize })
      consumptionRecords.value = response.data
      pagination.value.total = response.total
      return response
    } catch (error) {
      ElMessage.error('获取消费记录失败！')
      consumptionRecords.value = []
      pagination.value.total = 0
      throw error
    }
  }

  // 获取财务总览
  const fetchFinanceSummary = async () => {
    try {
      const response = await financeApi.getFinanceSummary()
      summary.value = response.data
      return response
    } catch (error) {
      ElMessage.error('获取财务总览失败！')
      summary.value = {}
      throw error
    }
  }

  // 获取分组统计
  const fetchFinanceGroupedByType = async (params) => {
    try {
      const response = await financeApi.getFinanceGrouped(params)
      groupedStats.value = response.data
      return response
    } catch (error) {
      ElMessage.error('获取分组统计失败！')
      groupedStats.value = []
      throw error
    }
  }

  // 获取月度统计
  const fetchFinanceByMonth = async (params) => {
    try {
      const response = await financeApi.getFinanceMonthly(params)
      monthlyStats.value = response.data
      return response
    } catch (error) {
      ElMessage.error('获取月度统计失败！')
      monthlyStats.value = []
      throw error
    }
  }


  // 获取时间段统计
  const fetchFinanceOverTime = async (params) => {
    try {
      const response = await financeApi.getFinanceOverTime(params)
      timeStats.value = response.data
      return response
    } catch (error) {
      ElMessage.error('获取时间段统计失败！')
      timeStats.value = []
      throw error
    }
  }
  
  // 用于详情页的数据获取
  const fetchDetailsByType = async (params) => {
    try {
      // 假设存在一个API可以获取详情
      // const response = await financeApi.getDetailsByType(params);
      // return response.data;
      
      // 暂时返回空数组，因为没有对应的真实API
      console.warn("fetchDetailsByType: 缺少真实API，返回空数组。");
      return [];
    } catch (error) {
      ElMessage.error('获取详情数据失败！');
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
    monthlyStats, // 导出月度统计
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
    fetchFinanceByMonth, // 导出新 action
    fetchDetailsByType
  }
})

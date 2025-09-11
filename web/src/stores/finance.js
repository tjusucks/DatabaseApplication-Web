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
      ElMessage.error('获取收入列表失败')
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
      ElMessage.error('获取支出列表失败')
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
      ElMessage.error('获取消费记录失败')
    }
  }

  // 获取财务总览
  const fetchFinanceSummary = async () => {
    try {
      const response = await financeApi.getFinanceSummary()
      summary.value = response.data
      return response
    } catch (error) {
      ElMessage.error('获取财务总览失败')
    }
  }

  // 获取分组统计
  const fetchFinanceGroupedByType = async () => {
    try {
      const response = await financeApi.getFinanceGroupedByType()
      groupedStats.value = response.data
      return response
    } catch (error) {
      ElMessage.error('获取分组统计失败')
    }
  }
  
  // 获取时间段统计
  const fetchFinanceOverTime = async (params) => {
    try {
      const response = await financeApi.getFinanceOverTime(params)
      timeStats.value = response.data
      return response
    } catch (error) {
      ElMessage.error('获取时间段统计失败')
    }
  }

  return {
    incomes,
    expenses,
    consumptionRecords,
    summary,
    groupedStats,
    timeStats,
    pagination,
    fetchIncomes,
    fetchExpenses,
    fetchConsumptionRecords,
    fetchFinanceSummary,
    fetchFinanceGroupedByType,
    fetchFinanceOverTime
  }
})

import {
  searchFinancialRecords,
  createFinancialRecord,
  updateFinancialRecord,
  deleteFinancialRecord,
  getFinanceOverview,
  getFinanceStats,
  getFinanceGroupedStats,
  searchSalaryRecords,
  searchMaintenanceRecords,
  searchTicketSales, // 导入票务销售API
  searchRefunds, // 导入退款API
} from '@/api/finance'

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UnifiedTransactionType, incomeTypeOptions } from '@/utils/constants'

export const useFinanceStore = defineStore('finance', () => {
  // 统一的状态管理
  const incomes = ref([])
  const expenses = ref([])
  const pagination = ref({
    total: 0,
    currentPage: 1,
    pageSize: 10,
  })
  const lastIncomeParams = ref({})
  const lastExpenseParams = ref({})

  // 报表数据
  const overview = ref({})
  const stats = ref({})
  const groupedStats = ref([])

  // --- 新增：消费记录相关状态 ---
  const consumptionRecords = ref([])
  const consumptionPagination = ref({
    total: 0,
    currentPage: 1,
    pageSize: 10,
  })
  const lastConsumptionParams = ref({})

  // --- 通用 Actions ---

  const fetchRecords = async (generalType, params) => {
    const isIncome = generalType === 0
    const lastParams = isIncome ? lastIncomeParams : lastExpenseParams
    const list = isIncome ? incomes : expenses

    if (params) {
      if (params.page) pagination.value.currentPage = params.page
      if (params.pageSize) pagination.value.pageSize = params.pageSize
      // 当传入新参数时，更新持久化的参数
      lastParams.value = { ...params }
    }

    try {
      const query = {
        ...lastParams.value,
        page: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
      }

      // 如果没有指定具体的 transactionType，则查询宽泛的类型 (0 for income, 1 for expense)
      // 这对于“所有收入”或“所有支出”的视图是必要的
      if (!query.transactionType) {
        query.transactionType = generalType
      }

      const response = await searchFinancialRecords(query)
      list.value = response.financialRecords
      pagination.value.total = response.totalCount
    } catch (error) {
      const typeName = isIncome ? '收入' : '支出'
      ElMessage.error(error.message || `获取${typeName}列表失败`)
      list.value = []
      pagination.value.total = 0
      throw error
    }
  }

  // --- 新增：获取消费记录 ---
  const fetchConsumptionRecords = async (params) => {
    if (params) {
      if (params.page) consumptionPagination.value.currentPage = params.page
      if (params.pageSize) consumptionPagination.value.pageSize = params.pageSize
      lastConsumptionParams.value = {
        ...lastConsumptionParams.value,
        ...params,
      }
    }

    try {
      const query = {
        ...lastConsumptionParams.value,
        page: consumptionPagination.value.currentPage,
        pageSize: consumptionPagination.value.pageSize,
      }
      // 注意：这里我们假设 searchFinancialRecords 也能用于查询广义的消费记录
      // 如果有专门的API，需要替换成 getConsumptionRecords(query)
      const response = await searchFinancialRecords(query)
      consumptionRecords.value = response.financialRecords // 假设返回结构一致
      consumptionPagination.value.total = response.totalCount
    } catch (error) {
      ElMessage.error(error.message || `获取消费记录列表失败`)
      consumptionRecords.value = []
      consumptionPagination.value.total = 0
      throw error
    }
  }

  const addRecord = async (payload) => {
    try {
      await createFinancialRecord(payload)
      ElMessage.success('新增成功！')
      const isIncome = incomeTypeOptions.some((opt) => opt.value === payload.transactionType)
      if (isIncome) {
        await fetchIncomes()
      } else {
        await fetchExpenses()
      }
    } catch (error) {
      ElMessage.error(error.message || '新增失败')
      const isIncome = incomeTypeOptions.some((opt) => opt.value === payload.transactionType)
      if (isIncome) {
        await fetchIncomes()
      } else {
        await fetchExpenses()
      }
      throw error
    }
  }

  const updateRecord = async (id, payload) => {
    try {
      await updateFinancialRecord(id, payload)
      ElMessage.success('更新成功！')
      const isIncome = incomeTypeOptions.some((opt) => opt.value === payload.transactionType)
      if (isIncome) {
        await fetchIncomes()
      } else {
        await fetchExpenses()
      }
    } catch (error) {
      ElMessage.error(error.message || '更新失败')
      throw error
    }
  }

  const deleteRecord = async (id, source, isIncome) => {
    // 记录的 source 标识了其来源。'payroll' 和 'maintenance' 等表示它们来自其他业务模块，
    // 在财务模块中应被视为只读。只有手动创建的记录 (source 为 null 或 'manual') 才能被删除。
    if (source && source !== 'manual') {
      ElMessage.warning(`该记录来自 ${source} 系统，为只读数据，不能在此处删除。`)
      return // 阻止删除操作
    }

    try {
      await deleteFinancialRecord(id)
      ElMessage.success('删除成功！')
      // 根据 isIncome 标志决定刷新哪个列表
      if (isIncome) {
        await fetchIncomes()
      } else {
        await fetchExpenses()
      }
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
      throw error
    }
  }

  // --- 具体 Actions ---

  const fetchIncomes = async (params) => {
    const lastParams = lastIncomeParams
    const list = incomes

    if (params) {
      if (params.page) pagination.value.currentPage = params.page
      if (params.pageSize) pagination.value.pageSize = params.pageSize
      lastParams.value = { ...params }
    }

    const page = pagination.value.currentPage
    const pageSize = pagination.value.pageSize
    const transactionTypeFilter = lastParams.value.transactionType

    let allIncomes = []
    let totalCount = 0

    // 1. 获取手动录入的收入
    // 仅当没有筛选或筛选类型为“其他收入”时执行
    if (!transactionTypeFilter || transactionTypeFilter === UnifiedTransactionType.OTHER_INCOME) {
      try {
        const query = {
          ...lastParams.value,
          page,
          pageSize,
        }
        // 关键修复：如果用户没有筛选特定类型，我们应该获取所有广义的收入记录（类型为0），
        // 而不是仅仅查询“其他收入”。如果用户筛选了，就用筛选的类型。
        query.transactionType = transactionTypeFilter ? transactionTypeFilter : 0

        const response = await searchFinancialRecords(query)
        const manualIncomes = response.financialRecords.map((r) => ({
          ...r,
          source: 'manual',
        }))
        allIncomes.push(...manualIncomes)
        totalCount += response.totalCount
      } catch (error) {
        ElMessage.error(error.message || `获取收入列表失败`)
      }
    }

    // 2. 获取门票销售作为收入
    if (!transactionTypeFilter || transactionTypeFilter === UnifiedTransactionType.TICKET_SALES) {
      try {
        const ticketQuery = {
          page,
          pageSize,
          startDate: lastParams.value.startDate,
          endDate: lastParams.value.endDate,
          // Note: Removed 'status' parameter as it's not in the API specification
        }
        const response = await searchTicketSales(ticketQuery)
        const ticketSales = response?.ticketSales || []
        const ticketIncomes = ticketSales.map((t) => ({
          recordId: `ticket-${t.ticketId}`,
          transactionType: UnifiedTransactionType.TICKET_SALES,
          amount: t.price,
          paymentMethod: t.paymentMethod, // 假设票务记录有支付方式
          description: `门票销售 - ${t.ticketTypeName || t.ticketType || '标准票'}`,
          transactionDate: t.purchaseDate || t.saleDate,
          source: 'ticket',
        }))
        allIncomes.push(...ticketIncomes)
        totalCount += response?.totalCount || 0
      } catch (error) {
        ElMessage.error(error.message || `获取门票销售记录失败`)
      }
    }

    // 3. 合并和排序
    list.value = allIncomes.sort(
      (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate),
    )
    pagination.value.total = totalCount
  }

  const fetchExpenses = async (params) => {
    const lastParams = lastExpenseParams
    const list = expenses

    if (params) {
      if (params.page) pagination.value.currentPage = params.page
      if (params.pageSize) pagination.value.pageSize = params.pageSize
      lastParams.value = { ...params }
    }

    const page = pagination.value.currentPage
    const pageSize = pagination.value.pageSize
    const transactionTypeFilter = lastParams.value.transactionType

    let allExpenses = []
    let totalCount = 0

    // 1. 获取手动录入的支出
    // 仅当没有筛选或筛选类型为“其他支出”时执行
    if (!transactionTypeFilter || transactionTypeFilter === UnifiedTransactionType.OTHER_EXPENSE) {
      try {
        const query = {
          ...lastParams.value,
          page,
          pageSize,
        }
        // 关键修复：如果用户没有筛选特定类型，我们应该获取所有广义的支出记录（类型为1），
        // 而不是仅仅查询“其他支出”。如果用户筛选了，就用筛选的类型。
        query.transactionType = transactionTypeFilter ? transactionTypeFilter : 1

        const response = await searchFinancialRecords(query)
        const manualExpenses = response.financialRecords.map((r) => ({
          ...r,
          source: 'manual',
        }))
        allExpenses.push(...manualExpenses)
        totalCount += response.totalCount
      } catch (error) {
        ElMessage.error(error.message || `获取支出列表失败`)
      }
    }

    // 2. 获取工资发放记录作为支出
    if (!transactionTypeFilter || transactionTypeFilter === UnifiedTransactionType.SALARY_PAYMENT) {
      try {
        const salaryQuery = {
          page,
          pageSize,
          startDate: lastParams.value.startDate,
          endDate: lastParams.value.endDate,
          status: 1, // PayrollStatus.PAID
        }
        const response = await searchSalaryRecords(salaryQuery)
        const payrollExpenses = response.salaryRecords.map((sr) => ({
          recordId: `payroll-${sr.salaryRecordId}`,
          transactionType: UnifiedTransactionType.SALARY_PAYMENT,
          amount: sr.salary,
          paymentMethod: 2, // 假设为移动支付/银行转账
          description: `工资发放 - ${new Date(sr.payDate).toLocaleDateString()}`,
          transactionDate: sr.payDate,
          source: 'salary',
        }))
        allExpenses.push(...payrollExpenses)
        totalCount += response.totalCount
      } catch (error) {
        ElMessage.error(error.message || `获取工资记录失败`)
      }
    }

    // 3. 获取维保成本作为支出
    if (!transactionTypeFilter || transactionTypeFilter === UnifiedTransactionType.MAINTENANCE) {
      try {
        const maintenanceQuery = {
          page,
          pageSize,
          startDate: lastParams.value.startDate,
          endDate: lastParams.value.endDate,
        }
        const response = await searchMaintenanceRecords(maintenanceQuery)
        const maintenanceExpenses = response.maintenanceRecords.map((mr) => ({
          recordId: `maintenance-${mr.maintenanceId}`,
          transactionType: UnifiedTransactionType.MAINTENANCE,
          amount: mr.cost,
          paymentMethod: 0, // 假设为现金
          description: `维保成本 - ${mr.facilityName}: ${mr.description}`,
          transactionDate: mr.completionDate,
          source: 'maintenance',
        }))
        allExpenses.push(...maintenanceExpenses)
        totalCount += response.totalCount
      } catch (error) {
        ElMessage.error(error.message || `获取维保记录失败`)
      }
    }

    // 4. 获取退款记录作为支出
    if (!transactionTypeFilter || transactionTypeFilter === UnifiedTransactionType.TICKET_REFUND) {
      try {
        const refundQuery = {
          page,
          pageSize,
          startDate: lastParams.value.startDate,
          endDate: lastParams.value.endDate,
          status: 3, // RefundStatus.COMPLETED
        }
        const response = await searchRefunds(refundQuery)
        const refundExpenses = response.refunds.map((r) => ({
          recordId: `refund-${r.refundId}`,
          transactionType: UnifiedTransactionType.TICKET_REFUND,
          amount: r.amount,
          paymentMethod: r.paymentMethod,
          description: `门票退款 - 票号: ${r.ticketId}`,
          transactionDate: r.refundDate,
          source: 'refund',
        }))
        allExpenses.push(...refundExpenses)
        totalCount += response.totalCount
      } catch (error) {
        ElMessage.error(error.message || `获取退款记录失败`)
      }
    }

    // 5. 合并和排序
    list.value = allExpenses.sort(
      (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate),
    )
    pagination.value.total = totalCount
  }

  const addIncome = (payload) =>
    addRecord({
      ...payload,
      transactionType: payload.transactionType || UnifiedTransactionType.OTHER_INCOME,
    })
  const addExpense = (payload) =>
    addRecord({
      ...payload,
      transactionType: payload.transactionType || UnifiedTransactionType.OTHER_EXPENSE,
    })
  const updateIncome = (id, payload) => updateRecord(id, { ...payload })
  const updateExpense = (id, payload) => updateRecord(id, { ...payload })
  const deleteIncome = (id, source) => deleteRecord(id, source, true) // 传入 isIncome = true
  const deleteExpense = (id, source) => deleteRecord(id, source, false) // 传入 isIncome = false

  const fetchFinancialRecordByIdAction = async (id) => {
    try {
      return await getFinancialRecordById(id)
    } catch (error) {
      ElMessage.error(`获取财务记录详情失败！`)
      throw error
    }
  }

  // --- 报表 Actions ---

  const fetchOverview = async (params) => {
    try {
      const response = await getFinanceOverview(params) // 使用修正后的函数名
      overview.value = response
      return response
    } catch (error) {
      ElMessage.error('获取财务概览失败')
      console.error('获取财务概览失败:', error)
      throw error
    }
  }

  const fetchStats = async (params) => {
    try {
      const response = await getFinanceStats(params) // 使用修正后的函数名
      stats.value = response
      return response
    } catch (error) {
      console.error('获取财务统计失败:', error)
      throw error
    }
  }

  const fetchGroupedStats = async (params) => {
    try {
      const response = await getFinanceGroupedStats(params) // 使用修正后的函数名
      groupedStats.value = response
      return response
    } catch (error) {
      console.error('获取分组统计失败:', error)
      // ElMessage.error('获取分组财务统计失败')
      return null // 返回null表示失败
    }
  }

  /**
   * 按天获取财务概览数据以构建趋势图。
   * 这是一个前端的临时解决方案，因为后端的 /stats/grouped 接口目前返回的聚合值不正确（始终为0）。
   * 此方法通过循环遍历指定日期范围内的每一天，并为每一天调用 getFinanceOverview 接口来手动聚合数据。
   * 虽然这会产生更多的API请求，但它确保了趋势图数据的准确性。
   * @param {object} { startDate, endDate } - 查询的开始和结束日期。
   * @returns {Promise<Array>} 包含每日收入和支出的数组。
   */
  const fetchTrendDataByDay = async ({ startDate, endDate }) => {
    // 这个 action 的 loading 状态由组件自己管理，所以这里不设置 this.loading
    try {
      const trendData = []
      if (!startDate || !endDate) {
        return []
      }

      let currentDate = new Date(startDate + 'T00:00:00') // 确保从当天的开始计算，避免时区问题
      const end = new Date(endDate + 'T00:00:00')

      while (currentDate <= end) {
        // --- 关键修复 ---
        // 直接从 currentDate 对象中获取年、月、日，避免 .toISOString() 带来的时区转换问题
        const year = currentDate.getFullYear()
        const month = String(currentDate.getMonth() + 1).padStart(2, '0')
        const day = String(currentDate.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`

        const dailyOverview = await getFinanceOverview({
          startDate: dateStr,
          endDate: dateStr,
        })
        trendData.push({
          date: dateStr,
          totalIncome: dailyOverview.totalIncome || 0,
          totalExpense: dailyOverview.totalExpense || 0,
        })
        // 在UTC日期上增加一天
        currentDate.setDate(currentDate.getDate() + 1)
      }
      return trendData
    } catch (error) {
      console.error('按天获取趋势数据时出错:', error)
      ElMessage.error('获取趋势图数据失败')
      return [] // 出错时返回空数组
    }
  }

  // 返回所有 state 和 actions
  return {
    incomes,
    expenses,
    pagination,
    lastIncomeParams,
    lastExpenseParams,
    overview,
    stats,
    groupedStats,
    consumptionRecords,
    consumptionPagination,
    lastConsumptionParams,
    fetchIncomes,
    fetchExpenses,
    addIncome,
    addExpense,
    updateIncome,
    updateExpense,
    deleteIncome,
    deleteExpense,
    fetchFinancialRecordByIdAction,
    fetchOverview,
    fetchStats,
    fetchGroupedStats,
    fetchTrendDataByDay, // 修复：将 getDailyOverviewForTrend 重命名为 fetchTrendDataByDay
    fetchConsumptionRecords,
  }
})

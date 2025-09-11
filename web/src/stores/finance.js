import { defineStore } from "pinia";
import { ref } from "vue";
import {
  searchFinancialRecords,
  createFinancialRecord,
  updateFinancialRecord,
  deleteFinancialRecord,
  getFinancialRecordById,
  getFinanceOverview, // 修正导入的函数名
  getFinanceStats, // 修正导入的函数名
  getFinanceGroupedStats, // 修正导入的函数名
} from "@/api/finance";
import { ElMessage } from "element-plus";

export const useFinanceStore = defineStore("finance", () => {
  // 统一的状态管理
  const incomes = ref([]);
  const expenses = ref([]);
  const pagination = ref({
    total: 0,
    currentPage: 1,
    pageSize: 10,
  });
  const lastIncomeParams = ref({});
  const lastExpenseParams = ref({});

  // 报表数据
  const overview = ref({});
  const stats = ref({});
  const groupedStats = ref([]);

  // --- 新增：消费记录相关状态 ---
  const consumptionRecords = ref([]);
  const consumptionPagination = ref({
    total: 0,
    currentPage: 1,
    pageSize: 10,
  });
  const lastConsumptionParams = ref({});

  // --- 通用 Actions ---

  const fetchRecords = async (transactionType, params) => {
    const isIncome = transactionType === 0;
    const lastParams = isIncome ? lastIncomeParams : lastExpenseParams;
    const list = isIncome ? incomes : expenses;

    if (params) {
      if (params.page) pagination.value.currentPage = params.page;
      if (params.pageSize) pagination.value.pageSize = params.pageSize;
      lastParams.value = { ...lastParams.value, ...params };
    }

    try {
      const query = {
        ...lastParams.value,
        transactionType,
        page: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
      };
      const response = await searchFinancialRecords(query);
      list.value = response.financialRecords;
      pagination.value.total = response.totalCount;
    } catch (error) {
      const typeName = isIncome ? "收入" : "支出";
      ElMessage.error(error.message || `获取${typeName}列表失败`);
      list.value = [];
      pagination.value.total = 0;
      throw error;
    }
  };

  // --- 新增：获取消费记录 ---
  const fetchConsumptionRecords = async (params) => {
    if (params) {
      if (params.page) consumptionPagination.value.currentPage = params.page;
      if (params.pageSize)
        consumptionPagination.value.pageSize = params.pageSize;
      lastConsumptionParams.value = {
        ...lastConsumptionParams.value,
        ...params,
      };
    }

    try {
      const query = {
        ...lastConsumptionParams.value,
        page: consumptionPagination.value.currentPage,
        pageSize: consumptionPagination.value.pageSize,
      };
      // 注意：这里我们假设 searchFinancialRecords 也能用于查询广义的消费记录
      // 如果有专门的API，需要替换成 getConsumptionRecords(query)
      const response = await searchFinancialRecords(query);
      consumptionRecords.value = response.financialRecords; // 假设返回结构一致
      consumptionPagination.value.total = response.totalCount;
    } catch (error) {
      ElMessage.error(error.message || `获取消费记录列表失败`);
      consumptionRecords.value = [];
      consumptionPagination.value.total = 0;
      throw error;
    }
  };

  const addRecord = async (payload) => {
    try {
      await createFinancialRecord(payload);
      ElMessage.success("新增成功！");
      await (payload.transactionType === 0 ? fetchIncomes() : fetchExpenses());
    } catch (error) {
      ElMessage.error(error.message || "新增失败");
      // 即使失败也刷新，应对后端返回500但实际成功的情况
      await (payload.transactionType === 0 ? fetchIncomes() : fetchExpenses());
      throw error;
    }
  };

  const updateRecord = async (id, payload) => {
    try {
      await updateFinancialRecord(id, payload);
      ElMessage.success("更新成功！");
      await (payload.transactionType === 0 ? fetchIncomes() : fetchExpenses());
    } catch (error) {
      ElMessage.error(error.message || "更新失败");
      throw error;
    }
  };

  const deleteRecord = async (id, transactionType) => {
    try {
      await deleteFinancialRecord(id);
      ElMessage.success("删除成功！");
      await (transactionType === 0 ? fetchIncomes() : fetchExpenses());
    } catch (error) {
      ElMessage.error(error.message || "删除失败");
      throw error;
    }
  };

  // --- 具体 Actions ---

  const fetchIncomes = (params) => fetchRecords(0, params);
  const fetchExpenses = (params) => fetchRecords(1, params);
  const addIncome = (payload) => addRecord({ ...payload, transactionType: 0 });
  const addExpense = (payload) => addRecord({ ...payload, transactionType: 1 });
  const updateIncome = (id, payload) =>
    updateRecord(id, { ...payload, transactionType: 0 });
  const updateExpense = (id, payload) =>
    updateRecord(id, { ...payload, transactionType: 1 });
  const deleteIncome = (id) => deleteRecord(id, 0);
  const deleteExpense = (id) => deleteRecord(id, 1);
  const fetchFinancialRecordByIdAction = async (id) => {
    try {
      return await getFinancialRecordById(id);
    } catch (error) {
      ElMessage.error(`获取财务记录详情失败！`);
      throw error;
    }
  };

  // --- 报表 Actions ---

  const fetchOverview = async (params) => {
    try {
      const response = await getFinanceOverview(params); // 使用修正后的函数名
      overview.value = response;
      return response;
    } catch (error) {
      ElMessage.error("获取财务概览失败");
      console.error("获取财务概览失败:", error);
      throw error;
    }
  };

  const fetchStats = async (params) => {
    try {
      const response = await getFinanceStats(params); // 使用修正后的函数名
      stats.value = response;
      return response;
    } catch (error) {
      console.error("获取财务统计失败:", error);
      throw error;
    }
  };

  const fetchGroupedStats = async (params) => {
    try {
      const response = await getFinanceGroupedStats(params); // 使用修正后的函数名
      groupedStats.value = response;
      return response;
    } catch (error) {
      console.error("获取分组统计失败:", error);
      // ElMessage.error('获取分组财务统计失败')
      return null; // 返回null表示失败
    }
  };

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
      const trendData = [];
      if (!startDate || !endDate) {
        return [];
      }

      let currentDate = new Date(startDate + "T00:00:00"); // 确保从当天的开始计算，避免时区问题
      const end = new Date(endDate + "T00:00:00");

      while (currentDate <= end) {
        // --- 关键修复 ---
        // 直接从 currentDate 对象中获取年、月、日，避免 .toISOString() 带来的时区转换问题
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const day = String(currentDate.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;

        const dailyOverview = await getFinanceOverview({
          startDate: dateStr,
          endDate: dateStr,
        });
        trendData.push({
          date: dateStr,
          totalIncome: dailyOverview.totalIncome || 0,
          totalExpense: dailyOverview.totalExpense || 0,
        });
        // 在UTC日期上增加一天
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return trendData;
    } catch (error) {
      console.error("按天获取趋势数据时出错:", error);
      ElMessage.error("获取趋势图数据失败");
      return []; // 出错时返回空数组
    }
  };

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
    fetchRecords,
    addRecord,
    updateRecord,
    deleteRecord,
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
    fetchTrendDataByDay,
    // --- 新增：暴露消费记录相关 ---
    consumptionRecords,
    consumptionPagination,
    fetchConsumptionRecords,
  };
});

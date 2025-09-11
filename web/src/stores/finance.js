import { defineStore } from 'pinia'
import * as financeApi from '@/api/finance'

export const useFinanceStore = defineStore('finance', {
  state: () => ({
    records: [],
    pagination: {
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    },
    overview: {},
    groupedStats: [],
    loading: false,
  }),
  actions: {
    // 获取财务记录列表
    async fetchRecords(params) {
      this.loading = true;
      try {
        const response = await financeApi.getFinancialRecords(params)
        this.records = response.financialRecords
        this.pagination.total = response.totalCount
        this.pagination.page = response.page
        this.pagination.pageSize = response.pageSize
        this.pagination.totalPages = response.totalPages
        return response
      } finally {
        this.loading = false;
      }
    },
    // 根据类型获取财务记录
    async fetchRecordsByType(transactionType, params) {
        this.loading = true;
        try {
            const response = await financeApi.getFinancialRecordsByType(transactionType, params);
            this.records = response.financialRecords;
            this.pagination.total = response.totalCount;
            this.pagination.page = response.page;
            this.pagination.pageSize = response.pageSize;
            this.pagination.totalPages = response.totalPages;
            return response;
        } finally {
            this.loading = false;
        }
    },
    // 创建记录
    async createRecord(data) {
      return await financeApi.createFinancialRecord(data)
    },
    // 更新记录
    async updateRecord(id, data) {
      return await financeApi.updateFinancialRecord(id, data)
    },
    // 删除记录
    async deleteRecord(id) {
      return await financeApi.deleteFinancialRecord(id)
    },
    // 获取财务总览
    async fetchOverview(params) {
      this.loading = true;
      try {
        this.overview = await financeApi.getFinancialOverview(params)
        return this.overview
      } finally {
        this.loading = false;
      }
    },
    // 获取分组统计
    async fetchGroupedStats(params) {
      this.loading = true;
      try {
        this.groupedStats = await financeApi.getGroupedFinancialStats(params)
        return this.groupedStats
      } finally {
        this.loading = false;
      }
    }
  }
})

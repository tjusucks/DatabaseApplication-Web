// /src/stores/ticket.js

import { defineStore } from "pinia";
import * as ticketApi from "@/api/ticket";
import { ElMessage } from "element-plus";

export const useTicketStore = defineStore("ticket", {
  state: () => ({
    ticketTypes: [],
    bookings: {
      list: [],
      total: 0,
    },
    refunds: {
      list: [],
      total: 0,
    },
    statistics: null,
  }),

  actions: {
    // 获取门票类型
    async fetchTicketTypes() {
      try {
        const res = await ticketApi.getTicketTypes();
        if (res.code === 200) {
          this.ticketTypes = res.data;
        }
        return this.ticketTypes;
      } catch (error) {
        console.error("Failed to fetch ticket types:", error);
        return [];
      }
    },

    // 创建销售订单
    async createSale(saleData) {
      try {
        const res = await ticketApi.createTicketSale(saleData);
        if (res.code === 200 || res.code === 201) {
          // 201 for Created
          ElMessage.success("销售成功！");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to create sale:", error);
        return false;
      }
    },

    // 获取统计数据
    async fetchStatistics(params) {
      try {
        const res = await ticketApi.getTicketStatistics(params);
        if (res.code === 200) {
          this.statistics = res.data;
        }
        return this.statistics;
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
        return null;
      }
    },

    // 获取预订列表
    async fetchBookings(params) {
      try {
        const res = await ticketApi.getBookings(params);
        if (res.code === 200) {
          this.bookings.list = res.data.items || [];
          this.bookings.total = res.data.total || 0;
        }
        return this.bookings;
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
        return { list: [], total: 0 };
      }
    },

    // 获取退票列表
    async fetchRefunds(params) {
      try {
        const res = await ticketApi.getRefunds(params);
        if (res.code === 200) {
          this.refunds.list = res.data.items || [];
          this.refunds.total = res.data.total || 0;
        }
        return this.refunds;
      } catch (error) {
        console.error("Failed to fetch refunds:", error);
        return { list: [], total: 0 };
      }
    },

    // 处理退票审批
    async processRefundRequest(id, approvalData) {
      try {
        const res = await ticketApi.processRefund(id, approvalData);
        if (res.code === 200) {
          ElMessage.success("处理成功！");
          // 刷新列表
          this.fetchRefunds({});
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to process refund:", error);
        return false;
      }
    },
  },
});

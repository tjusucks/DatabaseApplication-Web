import { defineStore } from "pinia";
import { ElMessage } from "element-plus";

// 统一导入 API 层的所有函数
import * as ticketApi from "@/api/ticket";

// --- 票务核心 Store ---
// 负责：票种、价格、销售、统计
export const useTicketStore = defineStore("ticket", {
  state: () => ({
    ticketTypes: [],
    // [修正] 将 pricingRules 移到更合适的地方管理，或根据具体票种动态获取
    priceRulesForType: [],
    ticketTypeDetail: null,
    statistics: null,
  }),
  actions: {
    async fetchTicketTypes() {
      try {
        const response = await ticketApi.getTicketTypes();
        this.ticketTypes = response.data || [];
      } catch (error) {
        ElMessage.error("获取票种列表失败");
      }
    },
    async createTicketType(typeData) {
      try {
        await ticketApi.createTicketType(typeData);
        ElMessage.success("新增票种成功！");
        return true;
      } catch (error) {
        ElMessage.error("新增票种失败");
        return false;
      }
    },
    // [新增] 获取单个票种详情
    async fetchTicketTypeById(id) {
      try {
        const response = await ticketApi.getTicketTypeById(id);
        this.ticketTypeDetail = response.data;
      } catch (error) {
        ElMessage.error("获取票种详情失败");
      }
    },
    // [新增] 获取指定票种的价格规则
    async fetchPriceRulesForTicketType(ticketTypeId) {
      try {
        const response = await ticketApi.getPriceRulesForTicketType(
          ticketTypeId
        );
        this.priceRulesForType = response.data || [];
      } catch (error) {
        ElMessage.error("获取价格规则失败");
      }
    },
    async fetchStatistics() {
      try {
        const response = await ticketApi.getSalesStatistics();
        this.statistics = response.data;
      } catch (error) {
        ElMessage.error("获取统计数据失败");
      }
    },
  },
});

// --- 预订管理 Store ---
// 负责：预订列表、预订详情
export const useReservationStore = defineStore("reservation", {
  state: () => ({
    reservations: {
      list: [],
      total: 0,
    },
    currentReservation: null,
  }),
  actions: {
    /**
     * @description (对应 ReservationList.vue) 获取预订列表
     * @param {object} params - 查询参数 { page, size, keyword }
     */
    async fetchReservations(params) {
      try {
        const response = await ticketApi.getReservations(params);
        // [最终修正] 匹配后端返回的数据结构
        this.reservations.list = response.data.reservations || [];
        this.reservations.total = response.data.totalCount || 0;
      } catch (error) {
        ElMessage.error("获取预订列表失败");
      }
    },
    /**
     * @description (对应 ReservationDetail.vue) 根据ID获取预订详情
     * @param {string} id - 预订ID
     */
    async fetchReservationById(id) {
      this.currentReservation = null; // 先清空
      try {
        const response = await ticketApi.getReservationById(id);
        this.currentReservation = response.data;
      } catch (error) {
        ElMessage.error("获取预订详情失败");
      }
    },
  },
});

// /src/stores/ticket.js

// --- 退票管理 Store ---
export const useRefundStore = defineStore("refund", {
  state: () => ({
    refunds: {
      list: [],
      total: 0,
    },
    currentRefundDetail: null,
  }),
  actions: {
    /**
     * @description 搜索退票记录
     * @param {object} params - 查询参数
     */
    async fetchRefunds(params) {
      try {
        const response = await ticketApi.searchRefunds(params);
        // 假设后端返回 { records: [...], totalCount: ... }
        this.refunds.list = response.data.records || [];
        this.refunds.total = response.data.totalCount || 0;
      } catch (error) {
        ElMessage.error("获取退票记录失败");
      }
    },

    /**
     * @description 提交退票申请
     * @param {object} refundData
     */
    async createRefundRequest(refundData) {
      try {
        await ticketApi.requestRefund(refundData);
        ElMessage.success("退票申请提交成功！");
        return true;
      } catch (error) {
        ElMessage.error(
          "退票申请失败：" + (error.response?.data?.message || "未知错误")
        );
        return false;
      }
    },

    /**
     * @description 处理退票申请
     * @param {object} processData
     */
    async processRefundRequest(processData) {
      try {
        await ticketApi.processRefund(processData);
        ElMessage.success("处理成功！");
        // 刷新当前列表
        await this.fetchRefunds({});
        return true;
      } catch (error) {
        ElMessage.error(
          "处理失败：" + (error.response?.data?.message || "未知错误")
        );
        return false;
      }
    },
  },
});
// --- 促销管理 Store ---
// 负责：促销活动列表、创建活动
export const usePromotionStore = defineStore("promotion", {
  state: () => ({
    promotions: {
      list: [],
      total: 0,
    },
  }),
  actions: {
    /**
     * @description (对应 PromotionList.vue) 获取促销活动列表
     */
    async fetchPromotions(params) {
      try {
        const response = await ticketApi.getPromotions(params);
        this.promotions.list = response.data.items || [];
        this.promotions.total = response.data.total || 0;
      } catch (error) {
        ElMessage.error("获取活动列表失败");
      }
    },
    /**
     * @description (对应 PromotionCreate.vue) 创建新活动
     * @param {object} promotionData - 活动数据
     */
    async createPromotion(promotionData) {
      try {
        await ticketApi.createPromotion(promotionData);
        ElMessage.success("创建成功");
        return true; // 返回成功状态，方便UI跳转
      } catch (error) {
        ElMessage.error("创建活动失败");
        return false;
      }
    },
  },
});

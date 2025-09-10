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

// --- 退票管理 Store ---
// 负责：退票列表、退票审批
export const useRefundStore = defineStore("refund", {
  state: () => ({
    allRefunds: {
      list: [],
      total: 0,
    }, // 用于 RefundList.vue
    pendingRefunds: {
      list: [],
      total: 0,
    }, // 用于 RefundManagement.vue
  }),
  actions: {
    /**
     * @description (对应 RefundList.vue) 获取所有退票记录
     */
    async fetchAllRefunds(params) {
      try {
        const response = await ticketApi.getAllRefunds(params);
        this.allRefunds.list = response.data.items || [];
        this.allRefunds.total = response.data.total || 0;
      } catch (error) {
        ElMessage.error("获取退票记录失败");
      }
    },
    /**
     * @description (对应 RefundManagement.vue) 获取待处理的退票申请
     */
    async fetchPendingRefunds(params) {
      try {
        const response = await ticketApi.getPendingRefunds(params);
        this.pendingRefunds.list = response.data.items || [];
        this.pendingRefunds.total = response.data.total || 0;
      } catch (error) {
        ElMessage.error("获取待处理退票失败");
      }
    },
    /**
     * @description (对应 RefundManagement.vue) 处理退票申请
     * @param {object} processData - { refundId, approved, reason }
     */
    async processRefund(processData) {
      try {
        await ticketApi.processRefund(processData);
        ElMessage.success("处理成功");
        await this.fetchPendingRefunds(); // 成功后刷新待处理列表
      } catch (error) {
        ElMessage.error("处理失败");
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

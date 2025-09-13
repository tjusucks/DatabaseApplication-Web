import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'

// 统一导入 API 层的所有函数
import * as ticketApi from '@/api/ticket'

// --- 票务核心 Store ---
// 负责：票种、价格、销售、统计
export const useTicketStore = defineStore('ticket', {
  state: () => ({
    ticketTypes: [],
    loadingTicketTypes: false, // 添加加载状态
    // [修正] 将 pricingRules 移到更合适的地方管理，或根据具体票种动态获取
    priceRulesForType: [],
    ticketTypeDetail: null,
    statistics: null,
    pricingRules: [], // 用于价格管理概览页
  }),
  actions: {
    async fetchTicketTypes() {
      try {
        this.loadingTicketTypes = true
        const response = await ticketApi.getTicketTypes()
        this.ticketTypes = response || []
      } catch (error) {
        ElMessage.error('获取票种列表失败')
      } finally {
        this.loadingTicketTypes = false
      }
    },
    async createTicketType(typeData) {
      try {
        await ticketApi.createTicketType(typeData)
        ElMessage.success('新增票种成功！')
        return true
      } catch (error) {
        ElMessage.error('新增票种失败')
        return false
      }
    },
    // [新增] 获取单个票种详情
    async fetchTicketTypeById(id) {
      try {
        const response = await ticketApi.getTicketTypeById(id)
        this.ticketTypeDetail = response
      } catch (error) {
        ElMessage.error('获取票种详情失败')
      }
    },
    // [新增] 获取指定票种的价格规则
    async fetchPriceRulesForTicketType(ticketTypeId) {
      try {
        const response = await ticketApi.getPriceRulesForTicketType(ticketTypeId)
        this.priceRulesForType = response ?? []
      } catch (error) {
        ElMessage.error('获取价格规则失败')
      }
    },
    async createPriceRule(ruleData) {
      try {
        await ticketApi.createPriceRule(ruleData)
        ElMessage.success('新增价格规则成功！')
        return true
      } catch (error) {
        ElMessage.error('新增价格规则失败：' + (error.response?.message || '未知错误'))
        return false
      }
    },
    async fetchPricingRules() {
      try {
        const ticketTypesResponse = await ticketApi.getTicketTypes()
        // [修正] 从 ticketTypesResponse 中正确提取数组
        const ticketTypes = ticketTypesResponse ?? []

        const priceRulePromises = ticketTypes.map(async (type) => {
          // [最终修正] 正确解析 getPriceRulesForTicketType 的响应
          const priceRulesResponse = await ticketApi.getPriceRulesForTicketType(type.ticketTypeId)

          // 假设后端返回的是一个数组，如果不是，需要在这里解构
          // 例如：const rules = priceRulesResponse.rules || [];
          // 为了健壮性，我们先假设它可能直接返回数组
          const rules = Array.isArray(priceRulesResponse) ? priceRulesResponse : []

          return rules.map((rule) => ({
            ...rule,
            ticketTypeName: type.typeName,
          }))
        })

        const results = await Promise.all(priceRulePromises)
        this.pricingRules = results.flat()

        if (this.pricingRules.length === 0) {
          console.log(
            '价格规则为空，可能是数据库中没有数据，或者 getPriceRulesForTicketType API 返回的结构不正确。',
          )
        }
      } catch (error) {
        ElMessage.error('获取价格规则失败')
        console.error('fetchPricingRules failed:', error) // 打印详细错误
        this.pricingRules = []
      }
    },
    async fetchStatistics() {
      try {
        const response = await ticketApi.getSalesStatistics()
        this.statistics = response
      } catch (error) {
        ElMessage.error('获取统计数据失败')
      }
    },
  },
})

// --- 预订管理 Store ---
// 负责：预订列表、预订详情
export const useReservationStore = defineStore('reservation', {
  state: () => ({
    reservations: {
      list: [],
      total: 0,
    },
    currentReservation: null,
  }),
  actions: {
    /**
     * @description 执行一个完整的销售流程 (创建预订 -> 处理支付)
     * @param {object} saleData - 来自销售页面的表单数据
     */
    async createSale(saleData) {
      try {
        // --- 第一步：根据手机号查找或创建游客 ---
        let visitorId

        if (saleData.visitorPhone && saleData.visitorPhone.trim()) {
          // 有手机号：先尝试查找现有游客
          try {
            const { searchVisitors } = await import('@/api/visitors.js')
            const searchResponse = await searchVisitors({
              keyword: saleData.visitorPhone.trim(), // 使用keyword参数进行搜索
              pageSize: 1
            })

            if (searchResponse.items && searchResponse.items.length > 0) {
              // 找到现有游客
              visitorId = searchResponse.items[0].visitorId
              console.log('找到现有游客:', visitorId)
            } else {
              // 没找到，创建新游客
              const { createVisitor } = await import('@/api/visitors.js')
              const newVisitorResponse = await createVisitor({
                username: `visitor_${Date.now()}`, // 自动生成用户名
                passwordHash: 'visitor', // 使用统一密码
                email: null,
                displayName: '游客',
                phoneNumber: saleData.visitorPhone.trim(),
                birthDate: null,
                gender: 0, // 0=未知, 1=男, 2=女
                visitorType: 'Regular', // 普通游客
                height: 170 // 默认身高
              })
              visitorId = newVisitorResponse.visitorId || newVisitorResponse
              console.log('创建新游客:', visitorId)
            }
          } catch (error) {
            console.warn('处理游客信息失败，使用默认游客ID:', error)
            // 如果出错，使用默认游客ID（假设ID为1的游客存在）
            visitorId = 1
          }
        } else {
          // 无手机号：创建匿名游客
          try {
            const { createVisitor } = await import('@/api/visitors.js')
            const anonymousResponse = await createVisitor({
              username: `anonymous_${Date.now()}`, // 自动生成用户名
              passwordHash: 'visitor', // 使用统一密码
              email: null,
              displayName: '匿名游客',
              phoneNumber: null,
              birthDate: null,
              gender: 0, // 0=未知
              visitorType: 'Regular', // 普通游客
              height: 170 // 默认身高
            })
            visitorId = anonymousResponse.visitorId || anonymousResponse
            console.log('创建匿名游客:', visitorId)
          } catch (error) {
            console.warn('创建匿名游客失败，使用默认游客ID:', error)
            // 如果创建失败，使用默认游客ID
            visitorId = 1
          }
        }

        // --- 第二步：准备创建预订的数据体 (Payload) ---
        const reservationPayload = {
          // 1. VisitorId: 使用查找到或创建的游客ID
          visitorId: visitorId,

          // 2. VisitDate: 游玩日期，使用用户选择的日期
          visitDate: saleData.visitDate ? new Date(saleData.visitDate).toISOString() : new Date().toISOString(),

          // 3. Items: 购买的票种和数量列表
          items: [
            {
              ticketTypeId: saleData.ticketTypeId,
              quantity: saleData.quantity,
            },
          ],

          // 4. 必需字段 - PaymentMethod
          paymentMethod: 'Cash', // 现场销售默认为现金支付

          // 5. 可选字段
          promotionId: null, // 如果有促销活动，可以在此传入ID
          specialRequests: '', // 特殊要求
        }

        // --- 调用 API ---

        // 步骤一：创建预订
        console.log('正在创建预订，Payload:', reservationPayload)
        const createResponse = await ticketApi.createReservation(reservationPayload)

        // 从返回的 CreateReservationResponseDto 中解构数据
        const { reservationId, totalAmount } = createResponse

        if (!reservationId) {
          throw new Error('创建预订失败，未返回预订ID')
        }
        console.log(`预订创建成功，ID: ${reservationId}, 总金额: ${totalAmount}`)

        // 步骤二：处理支付
        const paymentPayload = {
          paymentMethod: 'Cash', // 假设现场销售为现金支付
          amount: totalAmount, // 使用后端计算返回的总金额
        }

        console.log('正在处理支付，Payload:', paymentPayload)
        await ticketApi.processReservationPayment(reservationId, paymentPayload)

        ElMessage.success('销售成功！')
        return true
      } catch (error) {
        ElMessage.error(
          '销售失败：' + (error.response?.data?.message || error.message || '未知错误'),
        )
        console.error('createSale 过程出错:', error)
        return false
      }
    },
    /**
     * @description (对应 ReservationList.vue) 获取预订列表
     * @param {object} params - 查询参数 { page, size, keyword }
     */
    async fetchReservations(params) {
      try {
        const response = await ticketApi.getReservations(params)
        // [最终修正] 匹配后端返回的数据结构
        this.reservations.list = response.reservations ?? []
        this.reservations.total = response.totalCount ?? 0
      } catch (error) {
        ElMessage.error('获取预订列表失败')
      }
    },
    /**
     * @description (对应 ReservationDetail.vue) 根据ID获取预订详情
     * @param {string} id - 预订ID
     */
    async fetchReservationById(id) {
      this.currentReservation = null // 先清空
      try {
        const response = await ticketApi.getReservationById(id)
        this.currentReservation = response
      } catch (error) {
        ElMessage.error('获取预订详情失败')
      }
    },
  },
})

// /src/stores/ticket.js

// --- 退票管理 Store ---
export const useRefundStore = defineStore('refund', {
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
        const response = await ticketApi.searchRefunds(params)
        // 后端返回 { refunds: [...], totalCount: ... }
        this.refunds.list = response.refunds ?? []
        this.refunds.total = response.totalCount ?? 0
        console.log('🎫 退票记录加载成功:', {
          count: this.refunds.list.length,
          total: this.refunds.total,
          data: this.refunds.list
        })
      } catch (error) {
        console.error('获取退票记录失败:', error)
        ElMessage.error('获取退票记录失败')
      }
    },

    /**
     * @description 提交退票申请
     * @param {object} refundData
     */
    async createRefundRequest(refundData) {
      try {
        await ticketApi.requestRefund(refundData)
        ElMessage.success('退票申请提交成功！')
        return true
      } catch (error) {
        ElMessage.error('退票申请失败：' + (error.response?.data?.message || '未知错误'))
        return false
      }
    },

    /**
     * @description 处理退票申请
     * @param {object} processData
     */
    async processRefundRequest(processData) {
      try {
        await ticketApi.processRefund(processData)
        ElMessage.success('处理成功！')
        // 刷新当前列表
        await this.fetchRefunds({})
        return true
      } catch (error) {
        ElMessage.error('处理失败：' + (error.response?.data?.message || '未知错误'))
        return false
      }
    },
  },
})
// --- 促销管理 Store ---
// 负责：促销活动列表、创建活动
export const usePromotionStore = defineStore('promotion', {
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
        // [最终修正] 经过拦截器后，response 直接就是后端的业务数据
        const response = await ticketApi.getPromotions(params)

        // 判断后端返回的是否是一个数组
        if (Array.isArray(response)) {
          // 如果是数组，直接赋值
          this.promotions.list = response
          this.promotions.total = response.length
        } else {
          // 如果是分页对象（为了兼容性），则按对象解析
          this.promotions.list = response.items || []
          this.promotions.total = response.totalCount || 0
        }
      } catch (error) {
        ElMessage.error('获取活动列表失败')
        console.error('fetchPromotions failed:', error)
      }
    },
    /**
     * @description (对应 PromotionCreate.vue) 创建新活动
     * @param {object} promotionData - 活动数据
     */
    async createPromotion(promotionData) {
      try {
        await ticketApi.createPromotion(promotionData)
        ElMessage.success('创建成功')
        return true // 返回成功状态，方便UI跳转
      } catch (error) {
        ElMessage.error('创建活动失败')
        return false
      }
    },
  },
})

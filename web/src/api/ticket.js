import request from '@/utils/request'

// =========================================================================
// 请使用以下内容更新或替换您文件中的对应函数
// =========================================================================

// --- 票务核心 API ---

export function getTicketTypes() {
  return request({
    url: '/api/ticketing/ticket-types', // 更新
    method: 'get',
  })
}

export function createTicketType(data) {
  return request({
    url: '/api/ticketing/ticket-types', // 更新
    method: 'post',
    data,
  })
}

// [新增] 根据ID获取票种详情
export function getTicketTypeById(ticketTypeId) {
  return request({
    url: `/api/ticketing/ticket-types/${ticketTypeId}`,
    method: 'get',
  })
}
// [新增] 获取指定票种的价格规则
export function getPriceRulesForTicketType(ticketTypeId) {
  return request({
    url: `/api/ticketing/ticket-types/${ticketTypeId}/price-rules`,
    method: 'get',
  })
}

// [新增] 创建价格规则
export function createPriceRule(data) {
  return request({
    url: `/api/ticketing/ticket-types/${data.ticketTypeId}/price-rules`,
    method: 'post',
    data,
  })
}

// [新增] 更新价格规则
export function updatePriceRule(data) {
  return request({
    url: `/api/ticketing/ticket-types/${data.ticketTypeId}/price-rules/${data.ruleId}`,
    method: 'put',
    data,
  })
}

// [新增] 删除价格规则
export function deletePriceRule(ticketTypeId, ruleId) {
  return request({
    url: `/api/ticketing/ticket-types/${ticketTypeId}/price-rules/${ruleId}`,
    method: 'delete',
  })
}

// // 注意：后端没有提供直接的 "创建销售订单" 接口，只有一个搜索接口。
// // 我将保留 createSaleOrder 函数，但您需要与后端确认正确的URL
// export function createSaleOrder(data) {
//   return request({
//     url: '/api/ticketing/tickets/sales/create', // [待确认] 请与后端确认此URL
//     method: 'post',
//     data
//   });
// }

export function getSalesStatistics(params) {
  return request({
    url: '/api/ticketing/tickets/sales/stats', // 更新
    method: 'get',
    params, // stats接口现在接受查询参数
  })
}

/**
 * @description 搜索门票销售记录
 * @param {object} params - 搜索参数，包括 visitorId, ticketId 等
 */
export function searchTicketSales(params) {
  return request({
    url: '/api/ticketing/tickets/sales/search',
    method: 'get',
    params,
  })
}

// --- 预订管理 API ---

export function getReservations(params) {
  return request({
    url: '/api/ticketing/reservations/search', // 更新
    method: 'get',
    params,
  })
}
export function getReservationById(id, params) {
  return request({
    url: `/api/ticketing/reservations/${id}`,
    method: 'get',
    params,
  })
}
export function createReservation(data) {
  // 假设后端的创建接口就是 POST /api/ticketing/reservations
  return request.post('/api/ticketing/reservations', data)
}

/**
 * @description 为预订处理支付 (销售流程的第二步)
 * @param {number} reservationId - 预订ID
 * @param {object} data - { paymentMethod, amount }
 */
export function processReservationPayment(reservationId, data) {
  return request.post(`/api/ticketing/reservations/${reservationId}/payment`, data)
}
// --- 促销管理 API ---

export function getPromotions(params) {
  return request({
    url: '/api/ticketing/promotions', // 更新
    method: 'get',
    params,
  })
}

// [新增] 根据ID获取促销活动详情
export function getPromotionById(promotionId) {
  return request({
    url: `/api/ticketing/promotions/${promotionId}`,
    method: 'get',
  })
}

export function createPromotion(data) {
  return request({
    url: '/api/ticketing/promotions', // 更新
    method: 'post',
    data,
  })
}

// [新增] 获取指定促销活动的触发条件
export function getPromotionConditions(promotionId) {
  return request({
    url: `/api/ticketing/promotions/${promotionId}/conditions`,
    method: 'get',
  })
}

// [新增] 创建触发条件
export function createPromotionCondition(data) {
  return request({
    url: `/api/ticketing/promotions/${data.promotionId}/conditions`,
    method: 'post',
    data,
  })
}

// [新增] 获取指定促销活动的优惠动作
export function getPromotionActions(promotionId) {
  return request({
    url: `/api/ticketing/promotions/${promotionId}/actions`,
    method: 'get',
  })
}

// [新增] 创建优惠动作
export function createPromotionAction(data) {
  return request({
    url: `/api/ticketing/promotions/${data.promotionId}/actions`,
    method: 'post',
    data,
  })
}

// /src/api/ticket.js

// =========================================================================
// 退票管理 API (Refund) - 全新版本
// =========================================================================

/**
 * @description 提交退票申请
 * @param {object} data - { ticketId, reason, ... }
 */
export function requestRefund(data) {
  return request.post('/api/ticketing/refunds/request', data)
}

/**
 * @description 处理退票申请 (批准/驳回)
 * @param {object} data - { refundId, isApproved, notes }
 */
export function processRefund(data) {
  return request.post(`/api/ticketing/refunds/${data.refundId}/process`, data)
}

/**
 * @description 搜索退票记录
 * @param {object} params - { keyword, status, startDate, endDate, page, size }
 */
export function searchRefunds(params) {
  return request.get('/api/ticketing/refunds/search', { params })
}

/**
 * @description 根据ID获取退票详情
 * @param {number} id - 退票记录ID
 */
export function getRefundById(id) {
  return request.get(`/api/ticketing/refunds/${id}`)
}

// =========================================================================
// 检票入园 API
// =========================================================================

/**
 * @description 获取票据信息（通过搜索API）
 * @param {number} ticketId - 票据ID
 */
export function getTicketInfo(ticketId) {
  // 使用现有的搜索API来获取票据信息
  return request.get('/api/ticketing/tickets/sales/search', {
    params: { ticketId: ticketId, pageSize: 1 }
  }).then(response => {
    if (response.ticketSales && response.ticketSales.length > 0) {
      return response.ticketSales[0]
    } else {
      throw new Error('票据不存在')
    }
  })
}

/**
 * @description 处理检票入园/出园（模拟实现）
 * @param {object} data - { ticketId, entryType }
 */
export function processTicketEntry(data) {
  // 由于后端没有检票API，这里返回一个模拟的成功响应
  // 实际应用中需要后端提供相应的API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `${data.entryType === 'entry' ? '入园' : '出园'}成功`,
        ticketId: data.ticketId,
        entryTime: new Date().toISOString()
      })
    }, 500) // 模拟网络延迟
  })
}

/**
 * @description 获取票务销售统计信息
 * @param {Object} params - 查询参数
 */
export function getTicketSalesStats(params) {
  return request.get('/api/ticketing/tickets/sales/stats', { params })
}

/**
 * @description 获取分组的票务销售统计信息
 * @param {Object} params - 查询参数，包括groupBy字段
 */
export function getTicketSalesGroupedStats(params) {
  return request.get('/api/ticketing/tickets/sales/stats/grouped', { params })
}

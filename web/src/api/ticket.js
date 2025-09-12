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
  return request.post('/ticketing/reservations', data)
}

/**
 * @description 为预订处理支付 (销售流程的第二步)
 * @param {number} reservationId - 预订ID
 * @param {object} data - { paymentMethod, amount }
 */
export function processReservationPayment(reservationId, data) {
  return request.post(`/ticketing/reservations/${reservationId}/payment`, data)
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
  return request.post('/ticketing/refunds/request', data)
}

/**
 * @description 处理退票申请 (批准/驳回)
 * @param {object} data - { refundId, isApproved, notes }
 */
export function processRefund(data) {
  return request.post(`/ticketing/refunds/${data.refundId}/process`, data)
}

/**
 * @description 搜索退票记录
 * @param {object} params - { keyword, status, startDate, endDate, page, size }
 */
export function searchRefunds(params) {
  return request.get('/ticketing/refunds/search', { params })
}

/**
 * @description 根据ID获取退票详情
 * @param {number} id - 退票记录ID
 */
export function getRefundById(id) {
  return request.get(`/ticketing/refunds/${id}`)
}

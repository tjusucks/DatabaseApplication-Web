import { request } from "@/utils/request"; // 假设您的axios实例封装在 @/utils/request

/**
 * @description 获取可销售的门票类型列表
 */
export function getTicketTypes() {
  return request({
    url: "/api/tickets/types", // URL可以随意赋值，后续调整
    method: "get",
  });
}

/**
 * @description 创建一个新的门票销售订单
 * @param {object} saleData - 销售订单数据
 */
export function createTicketSale(saleData) {
  return request({
    url: "/api/tickets/sales",
    method: "post",
    data: saleData,
  });
}

/**
 * @description 获取票务统计数据
 * @param {object} params - 查询参数，如日期范围
 */
export function getTicketStatistics(params) {
  return request({
    url: "/api/tickets/statistics",
    method: "get",
    params,
  });
}

/**
 * @description 获取预订列表 (带分页和筛选)
 * @param {object} params - 查询参数，如 page, size, keyword
 */
export function getBookings(params) {
  return request({
    url: "/api/tickets/bookings",
    method: "get",
    params,
  });
}

/**
 * @description 获取退票申请列表
 * @param {object} params - 查询参数
 */
export function getRefunds(params) {
  return request({
    url: "/api/tickets/refunds",
    method: "get",
    params,
  });
}

/**
 * @description 处理退票审批
 * @param {number} refundId - 退票申请ID
 * @param {object} approvalData - 审批数据 { approved: boolean, reason: string }
 */
export function processRefund(refundId, approvalData) {
  return request({
    url: `/api/tickets/refunds/${refundId}/process`,
    method: "put",
    data: approvalData,
  });
}

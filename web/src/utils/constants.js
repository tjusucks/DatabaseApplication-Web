/**
 * @file constants.js
 * @description Defines constants for the application, such as enums from the backend.
 */

// Corresponds to the C# enum TransactionType
export const TransactionType = {
  Income: 0,
  Expense: 1,
  Refund: 2,
  Transfer: 3,
}

// Mapping from TransactionType enum value to its string representation
export const TransactionTypeNames = {
  [TransactionType.Income]: '收入',
  [TransactionType.Expense]: '支出',
  [TransactionType.Refund]: '退款',
  [TransactionType.Transfer]: '转账',
}

// 新增：统一的交易类型，用于替代旧的 description 描述方式
// 这些值需要与后端 FinancialRecord 的 TransactionType 枚举中的值对应
export const UnifiedTransactionType = {
  // 收入类
  TICKET_SALES: 10, // 门票销售
  OTHER_INCOME: 11, // 其他收入

  // 支出类
  SALARY_PAYMENT: 20, // 工资发放
  MAINTENANCE: 21, // 设备维护
  TICKET_REFUND: 22, // 门票退款
  OTHER_EXPENSE: 23, // 其他支出
}

export const incomeTypeOptions = [
  { value: UnifiedTransactionType.TICKET_SALES, label: '门票销售' },
  { value: UnifiedTransactionType.OTHER_INCOME, label: '其他收入' },
]

export const expenseTypeOptions = [
  { value: UnifiedTransactionType.TICKET_REFUND, label: '门票退款' },
  { value: UnifiedTransactionType.SALARY_PAYMENT, label: '工资发放' },
  { value: UnifiedTransactionType.MAINTENANCE, label: '设备维护' },
  { value: UnifiedTransactionType.OTHER_EXPENSE, label: '其他支出' },
]

const allTypeNames = {
  ...incomeTypeOptions.reduce((acc, cur) => ({ ...acc, [cur.value]: cur.label }), {}),
  ...expenseTypeOptions.reduce((acc, cur) => ({ ...acc, [cur.value]: cur.label }), {}),
}

/**
 * 根据交易记录的来源 (source) 和类型 (transactionType) 获取其可读的中文名称。
 * 注意：由于现在后端只接收基础类型（0-3），这个函数主要用于显示从不同来源获取的数据
 * @param {string} source - 记录的来源，如 'salary', 'maintenance', 'manual'。
 * @param {number} type - 记录的 `transactionType`（可能是扩展类型或基础类型）。
 * @returns {string} - 返回对应的中文类型名称。
 */
export const getSourceTypeName = (source, type) => {
  // 业务来源优先（这些通常来自其他系统，保持扩展类型用于显示）
  if (source === 'salary') return '工资发放'
  if (source === 'maintenance') return '设备维护'
  if (source === 'ticket') return '门票销售'
  if (source === 'refund') return '门票退款'

  // 手动录入的记录（这些会被映射为基础类型发送到后端）
  if (source === 'manual' || !source) {
    // 优先检查扩展类型（用于前端显示）
    if (type === UnifiedTransactionType.OTHER_EXPENSE) return '其他支出'
    if (type === UnifiedTransactionType.OTHER_INCOME) return '其他收入'
    if (type === UnifiedTransactionType.TICKET_REFUND) return '门票退款'
    if (type === UnifiedTransactionType.SALARY_PAYMENT) return '工资发放'
    if (type === UnifiedTransactionType.MAINTENANCE) return '设备维护'
    if (type === UnifiedTransactionType.TICKET_SALES) return '门票销售'

    // 兜底：映射基础类型（从后端返回的数据）
    if (type === TransactionType.Income) return '收入'
    if (type === TransactionType.Expense) return '支出'
    if (type === TransactionType.Refund) return '退款'
    if (type === TransactionType.Transfer) return '转账'
  }

  // 最终兜底
  return getTransactionTypeName(type)
}

export const getTransactionTypeName = (type) => {
  if (type === null || type === undefined) return '---'

  // 处理字符串类型（后端返回的枚举字符串）
  if (typeof type === 'string') {
    const stringToNameMap = {
      Income: '收入',
      Expense: '支出',
      Refund: '退款',
      Transfer: '转账',
    }
    if (stringToNameMap[type]) {
      return stringToNameMap[type]
    }
  }

  // 优先从 allTypeNames 中查找，如果找不到，再尝试从旧的 TransactionTypeNames 查找
  return allTypeNames[type] || TransactionTypeNames[type] || '未知类型'
}

/**
 * 将前端扩展的UnifiedTransactionType映射为后端基础的TransactionType枚举值
 * 这确保了前端发送给后端的transactionType值在数据库约束范围内（0-3）
 * @param {number} unifiedType - 前端扩展的交易类型值
 * @returns {number} 后端基础的TransactionType枚举值（0-3）
 */
export const mapToBackendTransactionType = (unifiedType) => {
  // 收入类型统一映射为 TransactionType.Income (0)
  if (
    unifiedType === UnifiedTransactionType.TICKET_SALES ||
    unifiedType === UnifiedTransactionType.OTHER_INCOME
  ) {
    return TransactionType.Income // 0
  }

  // 支出类型统一映射为 TransactionType.Expense (1)
  if (
    unifiedType === UnifiedTransactionType.SALARY_PAYMENT ||
    unifiedType === UnifiedTransactionType.MAINTENANCE ||
    unifiedType === UnifiedTransactionType.OTHER_EXPENSE
  ) {
    return TransactionType.Expense // 1
  }

  // 退款类型映射为 TransactionType.Refund (2)
  if (unifiedType === UnifiedTransactionType.TICKET_REFUND) {
    return TransactionType.Refund // 2
  }

  // 如果传入的已经是基础类型（0-3），直接返回
  if (unifiedType >= 0 && unifiedType <= 3) {
    return unifiedType
  }

  // 默认情况：如果无法识别，根据数值范围判断
  if (unifiedType >= 10 && unifiedType <= 19) {
    return TransactionType.Income // 收入类
  } else if (unifiedType >= 20 && unifiedType <= 29) {
    return TransactionType.Expense // 支出类
  }

  // 兜底：返回其他收入
  return TransactionType.Income
}

/**
 * 支付方式枚举
 * 与后端 DbApp.Domain.Enums.ResourceSystem.PaymentMethod 保持一致
 */
export const PaymentMethod = {
  Cash: 0,
  CreditCard: 1,
  MobilePay: 2,
  Crypto: 3,
}

export const PaymentMethodOptions = [
  { label: '现金', value: 0 },
  { label: '信用卡', value: 1 },
  { label: '移动支付', value: 2 },
  { label: '数字货币', value: 3 },
]

export const getPaymentMethodText = (value) => {
  if (value === null || value === undefined) return '---' // 处理 null 或 undefined

  let numericValue = value
  // 如果传入的是字符串键名 (e.g., "Cash"), 将其转换为对应的数字值
  if (typeof value === 'string' && PaymentMethod[value] !== undefined) {
    numericValue = PaymentMethod[value]
  }

  const option = PaymentMethodOptions.find((o) => o.value === numericValue)
  return option ? option.label : '未知'
}

export const getPaymentMethodName = (method) => {
  if (method === null || method === undefined) return '---' // 处理空值
  // 使用 getPaymentMethodText 函数来确保返回的是中文标签
  return getPaymentMethodText(method)
}

// --- 新增：维护类型 ---
export const MaintenanceType = {
  PREVENTIVE: 0,
  EMERGENCY: 1,
  REPLACEMENT: 2,
  SOFTWARE_UPDATE: 3,
}

export const maintenanceTypeOptions = [
  { value: MaintenanceType.PREVENTIVE, label: '预防性维护' },
  { value: MaintenanceType.EMERGENCY, label: '紧急维修' },
  { value: MaintenanceType.REPLACEMENT, label: '部件更换' },
  { value: MaintenanceType.SOFTWARE_UPDATE, label: '软件升级' },
]

export function getMaintenanceTypeName(value) {
  return parseEnum(value, MaintenanceType, '未知类型')
}

// --- 新增：门票状态 ---
export const TicketStatus = {
  ISSUED: 0,
  USED: 1,
  EXPIRED: 2,
  REFUNDED: 3,
  CANCELLED: 4,
}

export const ticketStatusOptions = [
  { value: TicketStatus.ISSUED, label: '已出票' },
  { value: TicketStatus.USED, label: '已使用' },
  { value: TicketStatus.EXPIRED, label: '已过期' },
  { value: TicketStatus.REFUNDED, label: '已退款' },
  { value: TicketStatus.CANCELLED, label: '已取消' },
]

export function getTicketStatusName(value) {
  return parseEnum(value, TicketStatus, '未知状态')
}

// --- 新增：预订状态 ---
export const ReservationStatus = {
  PENDING: 0,
  CONFIRMED: 1,
  CANCELLED: 2,
  COMPLETED: 3,
}

export const reservationStatusOptions = [
  { value: ReservationStatus.PENDING, label: '待确认' },
  { value: ReservationStatus.CONFIRMED, label: '已确认' },
  { value: ReservationStatus.CANCELLED, label: '已取消' },
  { value: ReservationStatus.COMPLETED, label: '已完成' },
]

export function getReservationStatusName(value) {
  return parseEnum(value, ReservationStatus, '未知状态')
}

// --- 新增：退款状态 ---
export const RefundStatus = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
  COMPLETED: 3,
}

export const refundStatusOptions = [
  { value: RefundStatus.PENDING, label: '待处理' },
  { value: RefundStatus.APPROVED, label: '已批准' },
  { value: RefundStatus.REJECTED, label: '已拒绝' },
  { value: RefundStatus.COMPLETED, label: '已完成' },
]

export function getRefundStatusName(value) {
  return parseEnum(value, RefundStatus, '未知状态')
}

// --- 新增：支付状态 ---
export const PaymentStatus = {
  PENDING: 0,
  PAID: 1,
  FAILED: 2,
  REFUNDED: 3,
}

export const paymentStatusOptions = [
  { value: PaymentStatus.PENDING, label: '待支付' },
  { value: PaymentStatus.PAID, label: '已支付' },
  { value: PaymentStatus.FAILED, label: '支付失败' },
  { value: PaymentStatus.REFUNDED, label: '已退款' },
]

export function getPaymentStatusName(value) {
  return parseEnum(value, PaymentStatus, '未知状态')
}

// --- 新增：工资单状态 ---
export const PayrollStatus = {
  PENDING: 0,
  PAID: 1,
  FAILED: 2,
}

export const payrollStatusOptions = [
  { value: PayrollStatus.PENDING, label: '待支付' },
  { value: PayrollStatus.PAID, label: '已支付' },
  { value: PayrollStatus.FAILED, label: '支付失败' },
]

export function getPayrollStatusName(value) {
  const statusMap = {
    [PayrollStatus.PENDING]: '待支付',
    [PayrollStatus.PAID]: '已支付',
    [PayrollStatus.FAILED]: '支付失败',
  }

  if (typeof value === 'string') {
    const upperValue = value.toUpperCase()
    for (const key in PayrollStatus) {
      if (key === upperValue) {
        return statusMap[PayrollStatus[key]]
      }
    }
  }

  return statusMap[value] || '未知状态'
}

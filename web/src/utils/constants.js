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
};

// Mapping from TransactionType enum value to its string representation
export const TransactionTypeNames = {
  [TransactionType.Income]: "收入",
  [TransactionType.Expense]: "支出",
  [TransactionType.Refund]: "退款",
  [TransactionType.Transfer]: "转账",
};

export const getTransactionTypeName = (type) => {
  if (type === null || type === undefined) return "---"; // 处理空值

  let numericType = type;
  // 如果传入的是字符串键名 (e.g., "Income"), 将其转换为对应的数字值
  if (typeof type === "string" && TransactionType[type] !== undefined) {
    numericType = TransactionType[type];
  }

  return TransactionTypeNames[numericType] || "未知类型";
};

// 后端 POST/PUT financial-records 时，并不需要 type 字段，
// 而是通过 description 字段来描述。
// 因此，我们不再需要 incomeTypeOptions 和 expenseTypeOptions。
// 我们将直接在表单中使用 description 字段。

/**
 * 支付方式枚举
 * 与后端 DbApp.Domain.Enums.ResourceSystem.PaymentMethod 保持一致
 */
export const PaymentMethod = {
  Cash: 0,
  CreditCard: 1,
  MobilePay: 2,
  Crypto: 3,
};

export const PaymentMethodOptions = [
  { label: "现金", value: 0 },
  { label: "信用卡", value: 1 },
  { label: "移动支付", value: 2 },
  { label: "数字货币", value: 3 },
];

export const getPaymentMethodText = (value) => {
  if (value === null || value === undefined) return "---"; // 处理 null 或 undefined

  let numericValue = value;
  // 如果传入的是字符串键名 (e.g., "Cash"), 将其转换为对应的数字值
  if (typeof value === "string" && PaymentMethod[value] !== undefined) {
    numericValue = PaymentMethod[value];
  }

  const option = PaymentMethodOptions.find((o) => o.value === numericValue);
  return option ? option.label : "未知";
};

export const getPaymentMethodName = (method) => {
  if (method === null || method === undefined) return "---"; // 处理空值
  // 使用 getPaymentMethodText 函数来确保返回的是中文标签
  return getPaymentMethodText(method);
};

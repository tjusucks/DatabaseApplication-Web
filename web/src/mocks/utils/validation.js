// 验证工具函数

// 验证用户名格式
export const validateUsername = (username) => {
  const errors = []
  
  if (!username) {
    errors.push('用户名不能为空')
    return errors
  }
  
  if (typeof username !== 'string') {
    errors.push('用户名必须是字符串')
    return errors
  }
  
  if (username.length < 2) {
    errors.push('用户名长度至少2个字符')
  }
  
  if (username.length > 50) {
    errors.push('用户名长度不能超过50个字符')
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('用户名只能包含字母、数字和下划线')
  }
  
  // 检查是否以数字开头
  if (/^[0-9]/.test(username)) {
    errors.push('用户名不能以数字开头')
  }
  
  // 检查保留用户名
  const reservedNames = ['admin', 'root', 'system', 'null', 'undefined', 'test']
  if (reservedNames.includes(username.toLowerCase()) && username.toLowerCase() !== 'admin') {
    errors.push('该用户名为系统保留，请选择其他用户名')
  }
  
  return errors
}

// 验证密码强度
export const validatePasswordStrength = (password) => {
  const errors = []
  
  if (!password) {
    errors.push('密码不能为空')
    return errors
  }
  
  if (typeof password !== 'string') {
    errors.push('密码必须是字符串')
    return errors
  }
  
  if (password.length < 6) {
    errors.push('密码长度至少6个字符')
  }
  
  if (password.length > 100) {
    errors.push('密码长度不能超过100个字符')
  }
  
  // 检查是否包含空格
  if (/\s/.test(password)) {
    errors.push('密码不能包含空格')
  }
  
  // 检查常见弱密码（在开发环境中放宽限制）
  const isDevelopment = import.meta.env.DEV
  if (!isDevelopment) {
    const weakPasswords = ['password', 'qwerty', 'abc123', '111111', '000000']
    if (weakPasswords.includes(password.toLowerCase())) {
      errors.push('密码过于简单，请使用更复杂的密码')
    }
  }
  
  return errors
}

// 验证邮箱格式
export const validateEmail = (email) => {
  if (!email) return [] // 邮箱是可选的
  
  const errors = []
  
  if (typeof email !== 'string') {
    errors.push('邮箱必须是字符串')
    return errors
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    errors.push('邮箱格式不正确')
  }
  
  if (email.length > 255) {
    errors.push('邮箱长度不能超过255个字符')
  }
  
  // 检查邮箱域名
  const domain = email.split('@')[1]
  if (domain) {
    const invalidDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com']
    if (invalidDomains.includes(domain.toLowerCase())) {
      errors.push('不支持临时邮箱，请使用常规邮箱')
    }
  }
  
  return errors
}

// 验证手机号格式
export const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return [] // 手机号是可选的
  
  const errors = []
  
  if (typeof phoneNumber !== 'string') {
    errors.push('手机号必须是字符串')
    return errors
  }
  
  // 中国大陆手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phoneNumber)) {
    errors.push('请输入正确的手机号码')
  }
  
  return errors
}

// 验证显示名称
export const validateDisplayName = (displayName) => {
  const errors = []
  
  if (!displayName) {
    errors.push('显示名称不能为空')
    return errors
  }
  
  if (typeof displayName !== 'string') {
    errors.push('显示名称必须是字符串')
    return errors
  }
  
  if (displayName.trim().length < 1) {
    errors.push('显示名称不能为空')
  }
  
  if (displayName.length > 100) {
    errors.push('显示名称长度不能超过100个字符')
  }
  
  // 检查是否包含特殊字符
  if (/[<>\"'&]/.test(displayName)) {
    errors.push('显示名称不能包含特殊字符 < > " \' &')
  }
  
  return errors
}

// 验证注册表单
export const validateRegistrationForm = (formData) => {
  const { username, password, confirmPassword, displayName, email, phoneNumber } = formData
  const errors = []
  
  // 验证各个字段
  errors.push(...validateUsername(username))
  errors.push(...validatePasswordStrength(password))
  errors.push(...validateDisplayName(displayName))
  errors.push(...validateEmail(email))
  errors.push(...validatePhoneNumber(phoneNumber))
  
  // 验证确认密码
  if (password !== confirmPassword) {
    errors.push('两次输入的密码不一致')
  }
  
  return errors
}

// 验证登录表单
export const validateLoginForm = (formData) => {
  const { username, password } = formData
  const errors = []
  
  if (!username) {
    errors.push('用户名不能为空')
  }
  
  if (!password) {
    errors.push('密码不能为空')
  }
  
  return errors
}

// 计算密码强度分数
export const calculatePasswordStrength = (password) => {
  if (!password) return { score: 0, level: 'very-weak', feedback: '请输入密码' }
  
  let score = 0
  const feedback = []
  
  // 长度检查
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('至少8个字符')
  }
  
  // 大写字母
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('包含大写字母')
  }
  
  // 小写字母
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('包含小写字母')
  }
  
  // 数字
  if (/[0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('包含数字')
  }
  
  // 特殊字符
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1
  } else {
    feedback.push('包含特殊字符')
  }
  
  // 长度奖励
  if (password.length >= 12) {
    score += 1
  }
  
  const levels = ['very-weak', 'weak', 'fair', 'good', 'strong', 'very-strong']
  const levelNames = ['很弱', '弱', '一般', '强', '很强', '极强']
  
  const level = Math.min(score, 5)
  
  return {
    score,
    level: levels[level],
    levelName: levelNames[level],
    feedback: feedback.length > 0 
      ? `密码强度: ${levelNames[level]}。建议: ${feedback.join('、')}`
      : `密码强度: ${levelNames[level]}`
  }
}

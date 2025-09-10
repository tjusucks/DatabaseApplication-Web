// JWT 工具函数（模拟实现）

// 生成访问令牌
export const generateAccessToken = (user) => {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    permissions: user.permissions,
    type: 'access',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24小时过期
    iss: 'theme-park-management-system',
    aud: 'theme-park-users'
  }
  
  // 这里只是模拟，实际应该使用真正的JWT库和密钥
  return btoa(JSON.stringify(payload))
}

// 生成刷新令牌
export const generateRefreshToken = (user) => {
  const payload = {
    userId: user.id,
    username: user.username,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7天过期
    iss: 'theme-park-management-system',
    aud: 'theme-park-users'
  }
  
  return btoa(JSON.stringify(payload))
}

// 验证令牌
export const verifyToken = (token) => {
  try {
    const payload = JSON.parse(atob(token))
    
    // 检查必要字段
    if (!payload.userId || !payload.username || !payload.type || !payload.exp) {
      throw new Error('令牌格式无效')
    }
    
    // 检查是否过期
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('令牌已过期')
    }
    
    // 检查发行者
    if (payload.iss !== 'theme-park-management-system') {
      throw new Error('令牌发行者无效')
    }
    
    return payload
  } catch (error) {
    throw new Error('无效的令牌')
  }
}

// 从请求头中提取令牌
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    throw new Error('未提供认证令牌')
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('认证令牌格式错误')
  }
  
  return authHeader.substring(7)
}

// 检查令牌是否即将过期（1小时内）
export const isTokenExpiringSoon = (token) => {
  try {
    const payload = JSON.parse(atob(token))
    const oneHourFromNow = Math.floor(Date.now() / 1000) + (60 * 60)
    return payload.exp < oneHourFromNow
  } catch (error) {
    return true
  }
}

// 获取令牌剩余有效时间（秒）
export const getTokenRemainingTime = (token) => {
  try {
    const payload = JSON.parse(atob(token))
    const now = Math.floor(Date.now() / 1000)
    return Math.max(0, payload.exp - now)
  } catch (error) {
    return 0
  }
}

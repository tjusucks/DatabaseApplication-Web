import { http, HttpResponse } from 'msw'
import {
  users,
  findUserByUsername,
  findUserByEmail,
  findUserById,
  addUser,
  updateLastLogin,
  recordLoginFailure,
  resetLoginFailures,
  isAccountLocked,
  getUserWithoutPassword
} from '../data/users.js'
import {
  validateLoginForm,
  validateRegistrationForm,
  calculatePasswordStrength
} from '../utils/validation.js'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  extractTokenFromHeader
} from '../utils/jwt.js'

export const authHandlers = [
  // 用户登录
  http.post('*/auth/login', async ({ request }) => {
    console.log('🔶 MSW: 拦截到登录请求', request.url)
    const requestData = await request.json()
    const { username, password, rememberMe } = requestData
    console.log('🔶 MSW: 登录数据', { username, password: '***' })

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800))

    // 验证输入格式
    const validationErrors = validateLoginForm({ username, password })
    if (validationErrors.length > 0) {
      return HttpResponse.json(
        { message: validationErrors[0] },
        { status: 400 }
      )
    }

    // 检查账户是否被锁定
    if (isAccountLocked(username)) {
      return HttpResponse.json(
        {
          message: '账户已被锁定，请30分钟后重试',
          code: 'ACCOUNT_LOCKED',
          lockoutEndTime: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        },
        { status: 423 }
      )
    }

    // 查找用户
    const user = findUserByUsername(username)
    if (!user) {
      recordLoginFailure(username)
      return HttpResponse.json(
        { message: '用户名或密码错误' },
        { status: 401 }
      )
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return HttpResponse.json(
        { message: '账户已被禁用，请联系管理员' },
        { status: 403 }
      )
    }

    // 验证密码
    if (user.password !== password) {
      recordLoginFailure(username)
      return HttpResponse.json(
        { message: '用户名或密码错误' },
        { status: 401 }
      )
    }

    // 登录成功，重置失败次数
    resetLoginFailures(username)
    updateLastLogin(user.id)

    // 生成tokens
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    // 返回用户信息（不包含密码）
    const userWithoutPassword = getUserWithoutPassword(user)

    return HttpResponse.json({
      message: '登录成功',
      accessToken,
      refreshToken,
      user: userWithoutPassword,
      expiresIn: 24 * 60 * 60, // 24小时（秒）
      tokenType: 'Bearer'
    })
  }),

  // 用户注册
  http.post('*/auth/register', async ({ request }) => {
    console.log('🔶 MSW: 拦截到注册请求', request.url)
    const requestData = await request.json()
    const { username, password, confirmPassword, displayName, email, phoneNumber } = requestData
    console.log('🔶 MSW: 注册数据', { username, displayName, email })

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 验证输入
    const validationErrors = validateRegistrationForm(requestData)
    if (validationErrors.length > 0) {
      return HttpResponse.json(
        {
          message: validationErrors[0],
          errors: validationErrors
        },
        { status: 400 }
      )
    }

    // 检查用户名是否已存在
    if (findUserByUsername(username)) {
      return HttpResponse.json(
        {
          message: '用户名已被使用',
          field: 'username'
        },
        { status: 409 }
      )
    }

    // 检查邮箱是否已存在
    if (email && findUserByEmail(email)) {
      return HttpResponse.json(
        {
          message: '邮箱已被使用',
          field: 'email'
        },
        { status: 409 }
      )
    }

    // 创建新用户
    const newUser = addUser({
      username,
      password,
      displayName,
      email: email || null,
      phoneNumber: phoneNumber || null,
      role: 'employee', // 默认角色
      permissions: ['read:dashboard', 'read:visitors'],
      avatar: ''
    })

    // 生成tokens
    const accessToken = generateAccessToken(newUser)
    const refreshToken = generateRefreshToken(newUser)

    // 返回用户信息（不包含密码）
    const userWithoutPassword = getUserWithoutPassword(newUser)

    return HttpResponse.json({
      message: '注册成功，欢迎使用！',
      accessToken,
      refreshToken,
      user: userWithoutPassword,
      expiresIn: 24 * 60 * 60, // 24小时（秒）
      tokenType: 'Bearer'
    })
  }),

  // 检查用户名可用性
  http.get('*/auth/check-username/:username', async ({ params }) => {
    const { username } = params

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300))

    // 验证用户名格式
    const validationErrors = validateLoginForm({ username, password: 'dummy' })
    if (validationErrors.some(error => error.includes('用户名'))) {
      return HttpResponse.json({
        isAvailable: false,
        message: '用户名格式不正确'
      })
    }

    const isAvailable = !findUserByUsername(username)

    return HttpResponse.json({
      isAvailable,
      message: isAvailable ? '用户名可用' : '用户名已被使用'
    })
  }),

  // 检查邮箱可用性
  http.get('*/auth/check-email/:email', async ({ params }) => {
    const { email } = params

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300))

    const decodedEmail = decodeURIComponent(email)

    // 如果邮箱为空，认为可用
    if (!decodedEmail) {
      return HttpResponse.json({
        isAvailable: true,
        message: '邮箱可用'
      })
    }

    const isAvailable = !findUserByEmail(decodedEmail)

    return HttpResponse.json({
      isAvailable,
      message: isAvailable ? '邮箱可用' : '邮箱已被使用'
    })
  }),

  // 获取用户信息
  http.get('*/auth/profile', async ({ request }) => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 200))

    try {
      const authHeader = request.headers.get('Authorization')
      const token = extractTokenFromHeader(authHeader)
      const payload = verifyToken(token)

      const user = findUserById(payload.userId)
      if (!user) {
        return HttpResponse.json(
          { message: '用户不存在' },
          { status: 404 }
        )
      }

      // 检查用户状态
      if (user.status !== 'active') {
        return HttpResponse.json(
          { message: '账户已被禁用' },
          { status: 403 }
        )
      }

      const userWithoutPassword = getUserWithoutPassword(user)
      return HttpResponse.json(userWithoutPassword)
    } catch (error) {
      return HttpResponse.json(
        { message: error.message },
        { status: 401 }
      )
    }
  }),

  // 刷新Token
  http.post('*/auth/refresh', async ({ request }) => {
    const { refreshToken } = await request.json()

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300))

    if (!refreshToken) {
      return HttpResponse.json(
        { message: '未提供刷新令牌' },
        { status: 400 }
      )
    }

    try {
      const payload = verifyToken(refreshToken)

      // 检查是否是刷新令牌
      if (payload.type !== 'refresh') {
        return HttpResponse.json(
          { message: '无效的刷新令牌类型' },
          { status: 401 }
        )
      }

      const user = findUserById(payload.userId)
      if (!user) {
        return HttpResponse.json(
          { message: '用户不存在' },
          { status: 404 }
        )
      }

      // 检查用户状态
      if (user.status !== 'active') {
        return HttpResponse.json(
          { message: '账户已被禁用' },
          { status: 403 }
        )
      }

      // 生成新的tokens
      const newAccessToken = generateAccessToken(user)
      const newRefreshToken = generateRefreshToken(user)

      return HttpResponse.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 24 * 60 * 60, // 24小时（秒）
        tokenType: 'Bearer'
      })
    } catch (error) {
      return HttpResponse.json(
        { message: error.message },
        { status: 401 }
      )
    }
  }),

  // 用户登出
  http.post('*/auth/logout', async ({ request }) => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 200))

    try {
      // 尝试验证token（可选）
      const authHeader = request.headers.get('Authorization')
      if (authHeader) {
        const token = extractTokenFromHeader(authHeader)
        verifyToken(token)
      }

      // 在实际应用中，这里会将refresh token加入黑名单
      return HttpResponse.json({
        message: '登出成功'
      })
    } catch (error) {
      // 即使token无效，也允许登出
      return HttpResponse.json({
        message: '登出成功'
      })
    }
  }),

  // 验证token（额外的端点）
  http.post('*/auth/validate-token', async ({ request }) => {
    const { token } = await request.json()

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 100))

    try {
      const payload = verifyToken(token)
      const user = findUserById(payload.userId)

      if (!user || user.status !== 'active') {
        return HttpResponse.json(
          { valid: false, message: '用户不存在或已被禁用' },
          { status: 401 }
        )
      }

      return HttpResponse.json({
        valid: true,
        payload: {
          userId: payload.userId,
          username: payload.username,
          role: payload.role,
          exp: payload.exp
        }
      })
    } catch (error) {
      return HttpResponse.json(
        { valid: false, message: error.message },
        { status: 401 }
      )
    }
  })
]

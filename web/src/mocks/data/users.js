// 模拟用户数据库
export const users = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    displayName: '系统管理员',
    email: 'admin@example.com',
    phoneNumber: '13800138000',
    role: 'super_admin',
    permissions: ['*'],
    avatar: '',
    status: 'active',
    lastLoginAt: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    username: 'employee',
    password: '123456',
    displayName: '普通员工',
    email: 'employee@example.com',
    phoneNumber: '13800138001',
    role: 'employee',
    permissions: ['read:dashboard', 'read:visitors', 'write:visitors', 'read:tickets'],
    avatar: '',
    status: 'active',
    lastLoginAt: '2024-01-14T16:45:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-14T16:45:00Z'
  },
  {
    id: 3,
    username: 'manager',
    password: '123456',
    displayName: '部门经理',
    email: 'manager@example.com',
    phoneNumber: '13800138002',
    role: 'operations_manager',
    permissions: [
      'read:dashboard', 'read:visitors', 'write:visitors',
      'read:tickets', 'write:tickets', 'read:finance',
      'read:hr', 'write:hr'
    ],
    avatar: '',
    status: 'active',
    lastLoginAt: '2024-01-15T09:15:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T09:15:00Z'
  },
  {
    id: 4,
    username: 'testuser',
    password: '123456',
    displayName: '测试用户',
    email: 'test@example.com',
    phoneNumber: '13800138003',
    role: 'employee',
    permissions: ['read:dashboard'],
    avatar: '',
    status: 'inactive',
    lastLoginAt: null,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  }
]

// 登录失败记录（用于模拟账户锁定）
export const loginAttempts = new Map()

// 获取用户（不包含密码）
export const getUserWithoutPassword = (user) => {
  const { password, ...userWithoutPassword } = user
  return userWithoutPassword
}

// 查找用户
export const findUserByUsername = (username) => {
  return users.find(u => u.username === username)
}

export const findUserByEmail = (email) => {
  return users.find(u => u.email === email)
}

export const findUserById = (id) => {
  return users.find(u => u.id === id)
}

// 添加新用户
export const addUser = (userData) => {
  const newUser = {
    id: Math.max(...users.map(u => u.id)) + 1,
    ...userData,
    status: 'active',
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  users.push(newUser)
  return newUser
}

// 更新用户最后登录时间
export const updateLastLogin = (userId) => {
  const user = findUserById(userId)
  if (user) {
    user.lastLoginAt = new Date().toISOString()
    user.updatedAt = new Date().toISOString()
  }
}

// 登录失败次数管理
export const recordLoginFailure = (username) => {
  const attempts = loginAttempts.get(username) || { count: 0, lastAttempt: null }
  attempts.count += 1
  attempts.lastAttempt = new Date()
  loginAttempts.set(username, attempts)
  return attempts
}

export const resetLoginFailures = (username) => {
  loginAttempts.delete(username)
}

export const getLoginFailures = (username) => {
  return loginAttempts.get(username) || { count: 0, lastAttempt: null }
}

export const isAccountLocked = (username) => {
  const attempts = getLoginFailures(username)
  const maxAttempts = 5
  const lockoutDuration = 30 * 60 * 1000 // 30分钟
  
  if (attempts.count >= maxAttempts) {
    const timeSinceLastAttempt = new Date() - new Date(attempts.lastAttempt)
    return timeSinceLastAttempt < lockoutDuration
  }
  
  return false
}

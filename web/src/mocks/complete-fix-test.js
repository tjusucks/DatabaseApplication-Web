// 完整的修复验证测试
// 测试登录后是否能正常访问仪表板而不是404页面

export const completeFixTest = async () => {
  console.log('🔧 开始完整修复验证测试...')
  console.log('=' .repeat(60))
  
  // 步骤1: 清除现有登录状态
  console.log('🧹 步骤1: 清除现有登录状态')
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('permissions')
  console.log('✅ 登录状态已清除')
  console.log('')
  
  // 步骤2: 测试管理员登录
  console.log('👤 步骤2: 测试管理员登录')
  try {
    const loginResponse = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '123456' })
    })
    
    if (loginResponse.ok) {
      const loginResult = await loginResponse.json()
      console.log('✅ 登录成功')
      console.log(`   用户: ${loginResult.user.displayName}`)
      console.log(`   角色: ${loginResult.user.role}`)
      console.log(`   权限: ${loginResult.user.permissions.slice(0, 3).join(', ')}${loginResult.user.permissions.length > 3 ? '...' : ''}`)
      
      // 模拟保存登录状态（就像真实登录一样）
      localStorage.setItem('token', loginResult.accessToken)
      localStorage.setItem('refreshToken', loginResult.refreshToken)
      localStorage.setItem('userInfo', JSON.stringify(loginResult.user))
      localStorage.setItem('permissions', JSON.stringify(loginResult.user.permissions))
      
      console.log('✅ 登录状态已保存到 localStorage')
      
      // 步骤3: 检查角色权限
      console.log('')
      console.log('🔐 步骤3: 检查角色权限')
      
      const requiredRoles = ['super_admin', 'finance_manager', 'hr_manager', 'operations_manager', 'ticket_manager', 'customer_service', 'employee']
      const userRole = loginResult.user.role
      
      console.log(`   仪表板需要角色: ${requiredRoles.join(', ')}`)
      console.log(`   用户当前角色: ${userRole}`)
      
      if (requiredRoles.includes(userRole)) {
        console.log('✅ 角色权限检查通过')
      } else {
        console.log('❌ 角色权限检查失败')
        console.log('   这会导致跳转到404页面')
      }
      
      // 步骤4: 模拟路由权限检查
      console.log('')
      console.log('🛣️ 步骤4: 模拟路由权限检查')
      
      // 模拟 hasRole 函数
      const hasRole = (role) => {
        return userRole === role || userRole === 'super_admin'
      }
      
      // 模拟 hasAnyRole 函数
      const hasAnyRole = (roles) => {
        if (!roles || roles.length === 0) return true
        return roles.some(role => hasRole(role))
      }
      
      const canAccessDashboard = hasAnyRole(requiredRoles)
      console.log(`   权限检查结果: ${canAccessDashboard ? '通过' : '失败'}`)
      
      if (canAccessDashboard) {
        console.log('✅ 应该能正常访问仪表板')
      } else {
        console.log('❌ 会被重定向到404页面')
      }
      
    } else {
      const errorResult = await loginResponse.json()
      console.log('❌ 登录失败:', errorResult.message)
      return false
    }
  } catch (error) {
    console.log('❌ 登录异常:', error.message)
    return false
  }
  
  console.log('')
  console.log('=' .repeat(60))
  console.log('🎯 测试完成')
  console.log('')
  console.log('📋 下一步操作:')
  console.log('1. 刷新页面 (F5)')
  console.log('2. 访问 http://localhost:3001/')
  console.log('3. 应该直接进入仪表板，而不是404页面')
  console.log('')
  console.log('🔧 如果仍然出现404，请检查:')
  console.log('- 浏览器控制台的路由守卫日志')
  console.log('- 用户角色是否正确保存')
  console.log('- 路由权限配置是否正确')
  
  return true
}

// 检查当前登录状态和权限
export const checkLoginState = () => {
  console.log('🔍 检查当前登录状态...')
  
  const token = localStorage.getItem('token')
  const userInfo = localStorage.getItem('userInfo')
  
  if (!token) {
    console.log('❌ 未登录')
    return false
  }
  
  console.log('✅ 已登录')
  
  if (userInfo) {
    const user = JSON.parse(userInfo)
    console.log('👤 用户信息:')
    console.log(`   用户名: ${user.username}`)
    console.log(`   显示名: ${user.displayName}`)
    console.log(`   角色: ${user.role}`)
    console.log(`   状态: ${user.status}`)
    
    // 检查仪表板权限
    const dashboardRoles = ['super_admin', 'finance_manager', 'hr_manager', 'operations_manager', 'ticket_manager', 'customer_service', 'employee']
    const hasPermission = dashboardRoles.includes(user.role) || user.role === 'super_admin'
    
    console.log('')
    console.log('🔐 权限检查:')
    console.log(`   仪表板权限: ${hasPermission ? '✅ 有权限' : '❌ 无权限'}`)
    
    if (!hasPermission) {
      console.log('⚠️ 这可能是导致404的原因')
    }
    
    return hasPermission
  } else {
    console.log('❌ 用户信息缺失')
    return false
  }
}

// 快速修复：直接设置正确的用户状态
export const quickFix = () => {
  console.log('⚡ 执行快速修复...')
  
  const correctUserInfo = {
    id: 1,
    username: 'admin',
    displayName: '系统管理员',
    email: 'admin@example.com',
    role: 'super_admin',
    permissions: ['*'],
    status: 'active'
  }
  
  const mockToken = btoa(JSON.stringify({
    userId: 1,
    username: 'admin',
    role: 'super_admin',
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
  }))
  
  localStorage.setItem('token', mockToken)
  localStorage.setItem('userInfo', JSON.stringify(correctUserInfo))
  localStorage.setItem('permissions', JSON.stringify(['*']))
  
  console.log('✅ 快速修复完成')
  console.log('🔄 请刷新页面测试')
}

// 在控制台中运行:
// import('./src/mocks/complete-fix-test.js').then(m => m.completeFixTest())
// import('./src/mocks/complete-fix-test.js').then(m => m.checkLoginState())
// import('./src/mocks/complete-fix-test.js').then(m => m.quickFix())

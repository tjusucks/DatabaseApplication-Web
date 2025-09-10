// 角色修复测试脚本
// 在浏览器控制台中运行此脚本来验证角色修复是否成功

export const testRoleFix = async () => {
  console.log('🔧 测试角色修复...')
  console.log('=' .repeat(50))
  
  // 测试管理员登录
  console.log('📋 测试管理员登录和角色')
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '123456' })
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ 管理员登录成功')
      console.log(`   用户角色: ${result.user.role}`)
      console.log(`   用户权限: ${result.user.permissions.join(', ')}`)
      
      // 检查角色是否为 super_admin
      if (result.user.role === 'super_admin') {
        console.log('✅ 角色修复成功: super_admin')
      } else {
        console.log('❌ 角色仍然不正确:', result.user.role)
      }
    } else {
      console.log('❌ 管理员登录失败')
    }
  } catch (error) {
    console.log('❌ 管理员登录异常:', error.message)
  }
  
  console.log('')
  
  // 测试员工登录
  console.log('📋 测试员工登录和角色')
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'employee', password: '123456' })
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ 员工登录成功')
      console.log(`   用户角色: ${result.user.role}`)
      console.log(`   用户权限: ${result.user.permissions.join(', ')}`)
      
      // 检查角色是否为 employee
      if (result.user.role === 'employee') {
        console.log('✅ 员工角色正确: employee')
      } else {
        console.log('❌ 员工角色不正确:', result.user.role)
      }
    } else {
      console.log('❌ 员工登录失败')
    }
  } catch (error) {
    console.log('❌ 员工登录异常:', error.message)
  }
  
  console.log('')
  
  // 测试经理登录
  console.log('📋 测试经理登录和角色')
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'manager', password: '123456' })
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ 经理登录成功')
      console.log(`   用户角色: ${result.user.role}`)
      console.log(`   用户权限: ${result.user.permissions.join(', ')}`)
      
      // 检查角色是否为 operations_manager
      if (result.user.role === 'operations_manager') {
        console.log('✅ 经理角色修复成功: operations_manager')
      } else {
        console.log('❌ 经理角色仍然不正确:', result.user.role)
      }
    } else {
      console.log('❌ 经理登录失败')
    }
  } catch (error) {
    console.log('❌ 经理登录异常:', error.message)
  }
  
  console.log('')
  console.log('=' .repeat(50))
  console.log('🎯 角色修复测试完成')
  console.log('')
  console.log('📝 预期结果:')
  console.log('   - admin 用户角色应为: super_admin')
  console.log('   - employee 用户角色应为: employee')
  console.log('   - manager 用户角色应为: operations_manager')
  console.log('')
  console.log('🔗 现在可以尝试登录并访问仪表板:')
  console.log('   1. 访问 /login')
  console.log('   2. 使用 admin/123456 登录')
  console.log('   3. 应该能成功跳转到仪表板而不是404页面')
}

// 快速测试当前用户状态
export const checkCurrentUserState = () => {
  console.log('👤 检查当前用户状态...')
  
  const token = localStorage.getItem('token')
  const userInfo = localStorage.getItem('userInfo')
  
  if (token) {
    console.log('✅ 已登录')
    console.log('   Token:', token.substring(0, 20) + '...')
    
    if (userInfo) {
      const user = JSON.parse(userInfo)
      console.log('   用户信息:', user)
      console.log('   用户角色:', user.role)
      console.log('   用户权限:', user.permissions)
    } else {
      console.log('❌ 用户信息缺失')
    }
  } else {
    console.log('❌ 未登录')
  }
}

// 清除登录状态
export const clearLoginState = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('permissions')
  console.log('🧹 已清除登录状态')
}

// 在控制台中运行:
// import('./src/mocks/test-role-fix.js').then(m => m.testRoleFix())
// import('./src/mocks/test-role-fix.js').then(m => m.checkCurrentUserState())
// import('./src/mocks/test-role-fix.js').then(m => m.clearLoginState())

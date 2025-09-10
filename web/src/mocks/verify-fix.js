// MSW 修复验证脚本
// 在浏览器控制台中运行此脚本来验证修复是否成功

export const verifyMSWFix = async () => {
  console.log('🔧 开始验证 MSW 修复...')
  console.log('=' .repeat(50))
  
  let allTestsPassed = true
  
  // 测试1: 验证 MSW 是否正确拦截登录请求
  console.log('📋 测试1: 验证登录请求拦截')
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '123456' })
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ 登录请求拦截成功')
      console.log(`   用户: ${result.user?.displayName}`)
      console.log(`   令牌: ${result.accessToken ? '已生成' : '未生成'}`)
    } else {
      console.log('❌ 登录请求失败:', response.status)
      allTestsPassed = false
    }
  } catch (error) {
    console.log('❌ 登录请求异常:', error.message)
    allTestsPassed = false
  }
  
  console.log('')
  
  // 测试2: 验证注册请求是否允许简单密码
  console.log('📋 测试2: 验证注册密码验证')
  try {
    const timestamp = Date.now()
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `testuser${timestamp}`,
        password: '123456',
        confirmPassword: '123456',
        displayName: '测试用户'
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ 注册请求成功（简单密码被允许）')
      console.log(`   用户: ${result.user?.displayName}`)
    } else {
      const result = await response.json()
      console.log('❌ 注册请求失败:', result.message)
      allTestsPassed = false
    }
  } catch (error) {
    console.log('❌ 注册请求异常:', error.message)
    allTestsPassed = false
  }
  
  console.log('')
  
  // 测试3: 验证用户名检查
  console.log('📋 测试3: 验证用户名可用性检查')
  try {
    const response = await fetch('/auth/check-username/admin')
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ 用户名检查请求成功')
      console.log(`   admin 可用性: ${result.isAvailable ? '可用' : '不可用'}`)
    } else {
      console.log('❌ 用户名检查失败:', response.status)
      allTestsPassed = false
    }
  } catch (error) {
    console.log('❌ 用户名检查异常:', error.message)
    allTestsPassed = false
  }
  
  console.log('')
  
  // 测试4: 验证网络配置
  console.log('📋 测试4: 验证网络配置')
  console.log(`   VITE_ENABLE_MSW: ${import.meta.env.VITE_ENABLE_MSW}`)
  console.log(`   VITE_API_BASE_URL: ${import.meta.env.VITE_API_BASE_URL || '(空)'}`)
  console.log(`   当前环境: ${import.meta.env.DEV ? '开发环境' : '生产环境'}`)
  
  console.log('')
  console.log('=' .repeat(50))
  
  if (allTestsPassed) {
    console.log('🎉 所有测试通过！MSW 修复成功！')
    console.log('')
    console.log('✅ 现在可以正常使用以下功能:')
    console.log('   - 登录页面的快速登录按钮')
    console.log('   - 注册页面的表单提交')
    console.log('   - 测试页面的自动化测试')
    console.log('   - 用户名和邮箱可用性检查')
  } else {
    console.log('❌ 部分测试失败，请检查配置')
  }
  
  return allTestsPassed
}

// 快速测试登录功能
export const quickTestLogin = async () => {
  console.log('🚀 快速测试登录功能...')
  
  const testAccounts = [
    { username: 'admin', password: '123456', role: '管理员' },
    { username: 'employee', password: '123456', role: '员工' },
    { username: 'manager', password: '123456', role: '经理' }
  ]
  
  for (const account of testAccounts) {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account)
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log(`✅ ${account.role} (${account.username}) 登录成功`)
      } else {
        const result = await response.json()
        console.log(`❌ ${account.role} (${account.username}) 登录失败: ${result.message}`)
      }
    } catch (error) {
      console.log(`❌ ${account.role} (${account.username}) 登录异常: ${error.message}`)
    }
  }
}

// 快速测试注册功能
export const quickTestRegister = async () => {
  console.log('🚀 快速测试注册功能...')
  
  const timestamp = Date.now()
  const testData = {
    username: `quicktest${timestamp}`,
    password: '123456',
    confirmPassword: '123456',
    displayName: '快速测试用户',
    email: `test${timestamp}@example.com`
  }
  
  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log(`✅ 注册成功: ${result.user?.displayName}`)
    } else {
      const result = await response.json()
      console.log(`❌ 注册失败: ${result.message}`)
    }
  } catch (error) {
    console.log(`❌ 注册异常: ${error.message}`)
  }
}

// 在控制台中可以运行:
// import('./src/mocks/verify-fix.js').then(m => m.verifyMSWFix())
// import('./src/mocks/verify-fix.js').then(m => m.quickTestLogin())
// import('./src/mocks/verify-fix.js').then(m => m.quickTestRegister())

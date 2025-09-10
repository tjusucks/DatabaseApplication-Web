// MSW 测试脚本
// 这个文件可以在浏览器控制台中运行来测试 MSW 功能

// 测试登录功能
export const testLogin = async () => {
  console.log('🧪 测试登录功能...')
  
  const testCases = [
    {
      name: '成功登录 - admin',
      data: { username: 'admin', password: '123456', rememberMe: true },
      expectedStatus: 200
    },
    {
      name: '成功登录 - employee',
      data: { username: 'employee', password: '123456', rememberMe: false },
      expectedStatus: 200
    },
    {
      name: '用户名错误',
      data: { username: 'wronguser', password: '123456' },
      expectedStatus: 401
    },
    {
      name: '密码错误',
      data: { username: 'admin', password: 'wrongpassword' },
      expectedStatus: 401
    },
    {
      name: '空用户名',
      data: { username: '', password: '123456' },
      expectedStatus: 400
    },
    {
      name: '空密码',
      data: { username: 'admin', password: '' },
      expectedStatus: 400
    }
  ]
  
  for (const testCase of testCases) {
    try {
      console.log(`  测试: ${testCase.name}`)
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.data)
      })
      
      const result = await response.json()
      
      if (response.status === testCase.expectedStatus) {
        console.log(`  ✅ ${testCase.name} - 通过`)
        if (response.ok) {
          console.log(`    用户: ${result.user?.displayName}, Token: ${result.accessToken?.substring(0, 20)}...`)
        } else {
          console.log(`    错误: ${result.message}`)
        }
      } else {
        console.log(`  ❌ ${testCase.name} - 失败 (期望状态: ${testCase.expectedStatus}, 实际状态: ${response.status})`)
      }
    } catch (error) {
      console.log(`  ❌ ${testCase.name} - 异常: ${error.message}`)
    }
  }
}

// 测试注册功能
export const testRegister = async () => {
  console.log('🧪 测试注册功能...')
  
  const testCases = [
    {
      name: '成功注册',
      data: {
        username: 'newuser' + Date.now(),
        password: 'password123',
        confirmPassword: 'password123',
        displayName: '新用户',
        email: `test${Date.now()}@example.com`,
        phoneNumber: '13800138999'
      },
      expectedStatus: 200
    },
    {
      name: '用户名已存在',
      data: {
        username: 'admin',
        password: 'password123',
        confirmPassword: 'password123',
        displayName: '管理员2',
        email: 'admin2@example.com'
      },
      expectedStatus: 409
    },
    {
      name: '邮箱已存在',
      data: {
        username: 'newuser2',
        password: 'password123',
        confirmPassword: 'password123',
        displayName: '新用户2',
        email: 'admin@example.com'
      },
      expectedStatus: 409
    },
    {
      name: '密码不一致',
      data: {
        username: 'newuser3',
        password: 'password123',
        confirmPassword: 'password456',
        displayName: '新用户3'
      },
      expectedStatus: 400
    },
    {
      name: '用户名格式错误',
      data: {
        username: 'a',
        password: 'password123',
        confirmPassword: 'password123',
        displayName: '新用户4'
      },
      expectedStatus: 400
    }
  ]
  
  for (const testCase of testCases) {
    try {
      console.log(`  测试: ${testCase.name}`)
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.data)
      })
      
      const result = await response.json()
      
      if (response.status === testCase.expectedStatus) {
        console.log(`  ✅ ${testCase.name} - 通过`)
        if (response.ok) {
          console.log(`    用户: ${result.user?.displayName}, Token: ${result.accessToken?.substring(0, 20)}...`)
        } else {
          console.log(`    错误: ${result.message}`)
        }
      } else {
        console.log(`  ❌ ${testCase.name} - 失败 (期望状态: ${testCase.expectedStatus}, 实际状态: ${response.status})`)
      }
    } catch (error) {
      console.log(`  ❌ ${testCase.name} - 异常: ${error.message}`)
    }
  }
}

// 测试用户名可用性检查
export const testUsernameCheck = async () => {
  console.log('🧪 测试用户名可用性检查...')
  
  const testCases = [
    { username: 'admin', expected: false },
    { username: 'employee', expected: false },
    { username: 'newuser123', expected: true },
    { username: 'testuser456', expected: true }
  ]
  
  for (const testCase of testCases) {
    try {
      console.log(`  测试用户名: ${testCase.username}`)
      const response = await fetch(`/auth/check-username/${encodeURIComponent(testCase.username)}`)
      const result = await response.json()
      
      if (result.isAvailable === testCase.expected) {
        console.log(`  ✅ ${testCase.username} - 通过 (${result.message})`)
      } else {
        console.log(`  ❌ ${testCase.username} - 失败 (期望: ${testCase.expected}, 实际: ${result.isAvailable})`)
      }
    } catch (error) {
      console.log(`  ❌ ${testCase.username} - 异常: ${error.message}`)
    }
  }
}

// 测试邮箱可用性检查
export const testEmailCheck = async () => {
  console.log('🧪 测试邮箱可用性检查...')
  
  const testCases = [
    { email: 'admin@example.com', expected: false },
    { email: 'employee@example.com', expected: false },
    { email: 'newuser@example.com', expected: true },
    { email: 'test123@example.com', expected: true }
  ]
  
  for (const testCase of testCases) {
    try {
      console.log(`  测试邮箱: ${testCase.email}`)
      const response = await fetch(`/auth/check-email/${encodeURIComponent(testCase.email)}`)
      const result = await response.json()
      
      if (result.isAvailable === testCase.expected) {
        console.log(`  ✅ ${testCase.email} - 通过 (${result.message})`)
      } else {
        console.log(`  ❌ ${testCase.email} - 失败 (期望: ${testCase.expected}, 实际: ${result.isAvailable})`)
      }
    } catch (error) {
      console.log(`  ❌ ${testCase.email} - 异常: ${error.message}`)
    }
  }
}

// 运行所有测试
export const runAllTests = async () => {
  console.log('🚀 开始运行 MSW 认证功能测试...')
  console.log('=' .repeat(50))
  
  await testLogin()
  console.log('')
  
  await testRegister()
  console.log('')
  
  await testUsernameCheck()
  console.log('')
  
  await testEmailCheck()
  console.log('')
  
  console.log('✨ 所有测试完成！')
}

// 在浏览器控制台中可以运行：
// import('./src/mocks/test-msw.js').then(module => module.runAllTests())

// 或者单独测试：
// import('./src/mocks/test-msw.js').then(module => module.testLogin())

<template>
  <div class="test-msw-container">
    <div class="test-header">
      <h2>MSW 认证功能测试</h2>
      <p>测试 Mock Service Worker 的认证 API 功能</p>
    </div>

    <div class="test-section">
      <h3>快速测试</h3>
      <div class="test-buttons">
        <el-button type="primary" @click="runAllTests" :loading="testing">
          运行所有测试
        </el-button>
        <el-button @click="testLogin">测试登录</el-button>
        <el-button @click="testRegister">测试注册</el-button>
        <el-button @click="clearResults">清空结果</el-button>
      </div>
    </div>

    <div class="test-section">
      <h3>手动测试</h3>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card title="登录测试">
            <el-form :model="loginForm" label-width="80px">
              <el-form-item label="用户名">
                <el-input v-model="loginForm.username" placeholder="admin" />
              </el-form-item>
              <el-form-item label="密码">
                <el-input v-model="loginForm.password" type="password" placeholder="123456" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="manualLogin" :loading="loginLoading">
                  登录
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card title="注册测试">
            <el-form :model="registerForm" label-width="80px">
              <el-form-item label="用户名">
                <el-input v-model="registerForm.username" placeholder="testuser" />
              </el-form-item>
              <el-form-item label="密码">
                <el-input v-model="registerForm.password" type="password" placeholder="123456" />
              </el-form-item>
              <el-form-item label="确认密码">
                <el-input v-model="registerForm.confirmPassword" type="password" placeholder="123456" />
              </el-form-item>
              <el-form-item label="显示名称">
                <el-input v-model="registerForm.displayName" placeholder="测试用户" />
              </el-form-item>
              <el-form-item>
                <el-button type="success" @click="manualRegister" :loading="registerLoading">
                  注册
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="test-section">
      <h3>测试结果</h3>
      <el-card>
        <div class="test-results" ref="resultsRef">
          <div v-for="(result, index) in testResults" :key="index" :class="['result-item', result.type]">
            <span class="result-icon">{{ result.type === 'success' ? '✅' : result.type === 'error' ? '❌' : 'ℹ️'
            }}</span>
            <span class="result-text">{{ result.message }}</span>
            <span class="result-time">{{ result.time }}</span>
          </div>
          <div v-if="testResults.length === 0" class="no-results">
            暂无测试结果
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

// 测试状态
const testing = ref(false)
const loginLoading = ref(false)
const registerLoading = ref(false)
const testResults = ref([])
const resultsRef = ref()

// 表单数据
const loginForm = reactive({
  username: 'admin',
  password: '123456'
})

const registerForm = reactive({
  username: 'testuser' + Date.now(),
  password: 'Test123456',
  confirmPassword: 'Test123456',
  displayName: '测试用户'
})

// 添加测试结果
const addResult = (type, message) => {
  testResults.value.push({
    type,
    message,
    time: new Date().toLocaleTimeString()
  })

  nextTick(() => {
    if (resultsRef.value) {
      resultsRef.value.scrollTop = resultsRef.value.scrollHeight
    }
  })
}

// 清空结果
const clearResults = () => {
  testResults.value = []
}

// 手动登录测试
const manualLogin = async () => {
  loginLoading.value = true
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm)
    })

    const result = await response.json()

    if (response.ok) {
      addResult('success', `登录成功: ${result.user?.displayName}`)
      ElMessage.success('登录成功')
    } else {
      addResult('error', `登录失败: ${result.message}`)
      ElMessage.error(result.message)
    }
  } catch (error) {
    addResult('error', `登录异常: ${error.message}`)
    ElMessage.error('登录异常')
  } finally {
    loginLoading.value = false
  }
}

// 手动注册测试
const manualRegister = async () => {
  registerLoading.value = true
  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerForm)
    })

    const result = await response.json()

    if (response.ok) {
      addResult('success', `注册成功: ${result.user?.displayName}`)
      ElMessage.success('注册成功')
      // 更新用户名以便下次测试
      registerForm.username = 'testuser' + Date.now()
    } else {
      addResult('error', `注册失败: ${result.message}`)
      ElMessage.error(result.message)
    }
  } catch (error) {
    addResult('error', `注册异常: ${error.message}`)
    ElMessage.error('注册异常')
  } finally {
    registerLoading.value = false
  }
}

// 测试登录功能
const testLogin = async () => {
  addResult('info', '开始测试登录功能...')

  const testCases = [
    { name: '管理员登录', data: { username: 'admin', password: '123456' }, shouldSucceed: true },
    { name: '员工登录', data: { username: 'employee', password: '123456' }, shouldSucceed: true },
    { name: '错误密码', data: { username: 'admin', password: 'wrong' }, shouldSucceed: false },
    { name: '不存在用户', data: { username: 'nonexist', password: '123456' }, shouldSucceed: false }
  ]

  for (const testCase of testCases) {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.data)
      })

      const result = await response.json()
      const success = response.ok

      if (success === testCase.shouldSucceed) {
        addResult('success', `${testCase.name}: 通过`)
      } else {
        addResult('error', `${testCase.name}: 失败 - ${result.message}`)
      }
    } catch (error) {
      addResult('error', `${testCase.name}: 异常 - ${error.message}`)
    }
  }
}

// 测试注册功能
const testRegister = async () => {
  addResult('info', '开始测试注册功能...')

  const timestamp = Date.now()
  const testCases = [
    {
      name: '正常注册',
      data: {
        username: `user${timestamp}`,
        password: 'Test123456',
        confirmPassword: 'Test123456',
        displayName: '测试用户'
      },
      shouldSucceed: true
    },
    {
      name: '用户名已存在',
      data: {
        username: 'admin',
        password: '123456',
        confirmPassword: '123456',
        displayName: '管理员2'
      },
      shouldSucceed: false
    },
    {
      name: '密码不一致',
      data: {
        username: `user${timestamp + 1}`,
        password: '123456',
        confirmPassword: '654321',
        displayName: '测试用户2'
      },
      shouldSucceed: false
    }
  ]

  for (const testCase of testCases) {
    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.data)
      })

      const result = await response.json()
      const success = response.ok

      if (success === testCase.shouldSucceed) {
        addResult('success', `${testCase.name}: 通过`)
      } else {
        addResult('error', `${testCase.name}: 失败 - ${result.message}`)
      }
    } catch (error) {
      addResult('error', `${testCase.name}: 异常 - ${error.message}`)
    }
  }
}

// 运行所有测试
const runAllTests = async () => {
  testing.value = true
  clearResults()

  try {
    addResult('info', '开始运行所有测试...')
    await testLogin()
    await testRegister()
    addResult('info', '所有测试完成！')
  } catch (error) {
    addResult('error', `测试异常: ${error.message}`)
  } finally {
    testing.value = false
  }
}
</script>

<style scoped>
.test-msw-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-header {
  text-align: center;
  margin-bottom: 30px;
}

.test-header h2 {
  color: #303133;
  margin-bottom: 10px;
}

.test-header p {
  color: #909399;
  margin: 0;
}

.test-section {
  margin-bottom: 30px;
}

.test-section h3 {
  color: #409eff;
  margin-bottom: 15px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 5px;
}

.test-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.test-results {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.result-item:last-child {
  border-bottom: none;
}

.result-icon {
  margin-right: 10px;
  font-size: 16px;
}

.result-text {
  flex: 1;
  font-family: 'Courier New', monospace;
}

.result-time {
  color: #909399;
  font-size: 12px;
  margin-left: 10px;
}

.result-item.success .result-text {
  color: #67c23a;
}

.result-item.error .result-text {
  color: #f56c6c;
}

.result-item.info .result-text {
  color: #409eff;
}

.no-results {
  text-align: center;
  color: #909399;
  padding: 20px;
}
</style>

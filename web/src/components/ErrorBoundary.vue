<template>
  <div v-if="hasError" class="error-boundary">
    <el-result icon="error" title="页面加载失败" sub-title="抱歉，页面组件加载时出现了错误">
      <template #extra>
        <el-button type="primary" @click="retry">重新加载</el-button>
        <el-button @click="goHome">返回首页</el-button>
      </template>
    </el-result>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'

const hasError = ref(false)
const router = useRouter()

// 捕获子组件错误
onErrorCaptured((error, instance, info) => {
  console.error('组件错误:', error)
  console.error('错误信息:', info)
  hasError.value = true
  return false // 阻止错误继续传播
})

// 重试加载
const retry = () => {
  hasError.value = false
  // 强制重新渲染
  router.go(0)
}

// 返回首页
const goHome = () => {
  hasError.value = false
  router.push('/')
}
</script>

<style scoped>
.error-boundary {
  padding: 50px;
  text-align: center;
}
</style>

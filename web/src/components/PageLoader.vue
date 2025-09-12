<template>
  <div class="page-loader" v-if="loading">
    <div class="loader-content">
      <el-skeleton :rows="5" animated />
    </div>
  </div>
  <div v-else class="page-content">
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const loading = ref(true)

onMounted(async () => {
  // 等待下一个tick确保DOM渲染完成
  await nextTick()

  // 短暂延迟以确保内容完全加载
  setTimeout(() => {
    loading.value = false
  }, 100)
})
</script>

<style scoped>
.page-loader {
  padding: 20px;
  min-height: 400px;
}

.loader-content {
  max-width: 1200px;
  margin: 0 auto;
}

.page-content {
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

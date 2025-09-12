<template>
  <div class="page-template-container" v-loading="isLoading">
    <el-card shadow="never" v-if="!isLoading">
      <template #header>
        <div class="page-header">
          <div class="header-content">
            <el-icon v-if="icon" :size="24" class="header-icon">
              <!-- 动态组件来显示Element Plus图标 -->
              <component :is="icon" />
            </el-icon>
            <div>
              <h2 class="title">{{ title }}</h2>
              <p class="description">{{ description }}</p>
            </div>
          </div>
        </div>
      </template>

      <!-- 主内容区域 -->
      <div class="page-content">
        <slot></slot>
      </div>
    </el-card>

    <!-- 骨架屏加载状态 -->
    <el-card shadow="never" v-else>
      <template #header>
        <el-skeleton :rows="1" animated />
      </template>
      <div class="page-skeleton">
        <el-skeleton :rows="6" animated />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { defineProps, ref, onMounted, nextTick, computed } from "vue";

// 接收父组件传递的属性
const props = defineProps({
  title: {
    type: String,
    required: true,
    default: "页面标题",
  },
  description: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    default: "",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  preloadDelay: {
    type: Number,
    default: 100,
  },
});

const internalLoading = ref(true);

onMounted(async () => {
  // 等待DOM渲染完成
  await nextTick();

  // 短暂延迟以确保内容完全加载，减少闪烁
  setTimeout(() => {
    internalLoading.value = false;
  }, props.preloadDelay);
});

// 计算最终的加载状态
const isLoading = computed(() => props.loading || internalLoading.value);
</script>

<style scoped>
.page-template-container {
  padding: 20px;
  opacity: 0;
  animation: fadeInPage 0.3s ease-out 0.1s forwards;
}

@keyframes fadeInPage {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInPage {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-content {
  display: flex;
  align-items: center;
}
.header-icon {
  margin-right: 12px;
  color: #409eff; /* 主题色 */
}
.title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
.description {
  margin: 4px 0 0;
  color: #909399;
  font-size: 14px;
}

.page-content {
  transition: all 0.3s ease;
}

.page-skeleton {
  padding: 20px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-template-container {
    padding: 15px;
  }

  .title {
    font-size: 18px;
  }

  .description {
    font-size: 13px;
  }
}
</style>

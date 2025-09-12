<template>
  <router-view />
</template>

<script setup>
import { onMounted } from "vue";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();

onMounted(() => {
  appStore.initApp();
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
  background-color: #f0f2f5;
  color: #303133;
}

#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

/* Custom scrollbar styles */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Element Plus style overrides */
.el-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-button {
  border-radius: 4px;
}

.el-input__wrapper {
  border-radius: 4px;
}

/* Responsive utility classes */
.hidden-xs {
  display: block;
}

.hidden-sm {
  display: block;
}

@media (max-width: 768px) {
  .hidden-xs {
    display: none !important;
  }
}

@media (max-width: 992px) {
  .hidden-sm {
    display: none !important;
  }
}

/* Ultra-wide screen optimizations */
@media (min-width: 1920px) {
  body {
    font-size: 16px;
  }
}

/* Minimum width constraint for desktop */
@media (min-width: 1024px) {
  #app {
    min-width: 1024px;
  }
}
</style>

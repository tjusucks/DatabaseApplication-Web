<template>
  <div class="navbar">
    <!-- 左侧区域 -->
    <div class="navbar-left">
      <!-- 折叠按钮 -->
      <el-button type="text" @click="toggleSidebar" class="collapse-btn">
        <el-icon size="20">
          <Expand v-if="appStore.sidebarCollapsed" />
          <Fold v-else />
        </el-icon>
      </el-button>
    </div>

    <!-- 右侧区域 -->
    <div class="navbar-right">
      <!-- 全屏按钮 -->
      <el-tooltip content="全屏" placement="bottom">
        <el-button type="text" @click="toggleFullscreen" class="action-btn">
          <el-icon size="18">
            <FullScreen />
          </el-icon>
        </el-button>
      </el-tooltip>

      <!-- 主题切换 -->
      <el-tooltip content="切换主题" placement="bottom">
        <el-button type="text" @click="toggleTheme" class="action-btn">
          <el-icon size="18">
            <Sunny v-if="appStore.theme === 'light'" />
            <Moon v-else />
          </el-icon>
        </el-button>
      </el-tooltip>

      <!-- 消息通知 -->
      <el-tooltip content="消息通知" placement="bottom">
        <el-badge :value="notificationCount" :hidden="notificationCount === 0">
          <el-button type="text" @click="showNotifications" class="action-btn">
            <el-icon size="18">
              <Bell />
            </el-icon>
          </el-button>
        </el-badge>
      </el-tooltip>

      <!-- 用户信息下拉菜单 -->
      <el-dropdown @command="handleUserCommand" class="user-dropdown">
        <div class="user-info">
          <el-avatar :size="32" :src="userStore.avatar" class="user-avatar">
            <el-icon>
              <User />
            </el-icon>
          </el-avatar>
          <span class="user-name">{{ userStore.userName }}</span>
          <el-icon class="dropdown-icon">
            <ArrowDown />
          </el-icon>
        </div>

        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon>
                <User />
              </el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon>
                <Setting />
              </el-icon>
              个人设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon>
                <SwitchButton />
              </el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import { useAppStore } from "@/stores/app";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();

// 通知数量（模拟数据）
const notificationCount = ref(3);

// 切换侧边栏
const toggleSidebar = () => {
  appStore.toggleSidebar();
};

// 切换主题
const toggleTheme = () => {
  appStore.toggleTheme();
};

// 切换全屏
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

// 显示通知
const showNotifications = () => {
  ElMessage.info("通知功能开发中...");
};

// 处理用户下拉菜单命令
const handleUserCommand = async (command) => {
  switch (command) {
    case "profile":
      router.push("/profile");
      break;
    case "settings":
      ElMessage.info("个人设置功能开发中...");
      break;
    case "logout":
      try {
        await ElMessageBox.confirm("确定要退出登录吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });

        await userStore.logout();
        router.push("/login");
      } catch (error) {
        // 用户取消操作
      }
      break;
  }
};
</script>

<style scoped>
.navbar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #fff;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  padding: 8px;
  margin-right: 10px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-btn {
  padding: 8px;
  color: #606266;
}

.action-btn:hover {
  color: #409eff;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  margin-right: 8px;
}

.user-name {
  font-size: 14px;
  color: #303133;
  margin-right: 8px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  font-size: 12px;
  color: #909399;
  transition: transform 0.3s;
}

.user-dropdown:hover .dropdown-icon {
  transform: rotate(180deg);
}

/* Responsive design */
@media (max-width: 768px) {
  .navbar {
    padding: 0 10px;
  }

  .user-name {
    display: none;
  }

  .navbar-right {
    gap: 5px;
  }
}
</style>

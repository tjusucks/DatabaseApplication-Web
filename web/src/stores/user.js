// import { defineStore } from "pinia";
// import { ref, computed } from "vue";
// import { ElMessage } from "element-plus";
// import {
//   login as loginApi,
//   logout as logoutApi,
//   getUserInfo,
// } from "@/api/auth";

// export const useUserStore = defineStore("user", () => {
//   // 状态
//   const token = ref(localStorage.getItem("token") || "");
//   const userInfo = ref(JSON.parse(localStorage.getItem("userInfo") || "{}"));
//   const permissions = ref(
//     JSON.parse(localStorage.getItem("permissions") || "[]")
//   );

//   // 计算属性
//   const isLoggedIn = computed(() => !!token.value);
//   const userName = computed(() => userInfo.value.name || "");
//   const userRole = computed(() => userInfo.value.role || "");
//   const avatar = computed(() => userInfo.value.avatar || "");

//   // 检查是否有指定角色
//   const hasRole = (role) => {
//     return (
//       userInfo.value.role === role || userInfo.value.role === "super_admin"
//     );
//   };

//   // 检查是否有任意一个角色
//   const hasAnyRole = (roles) => {
//     if (!roles || roles.length === 0) return true;
//     return roles.some((role) => hasRole(role));
//   };

//   // 检查是否有权限
//   const hasPermission = (permission) => {
//     return (
//       permissions.value.includes(permission) ||
//       userInfo.value.role === "super_admin"
//     );
//   };

//   // 登录
//   const login = async (loginForm) => {
//     try {
//       // [最终修正] 启用真正的 API 调用
//       const response = await loginApi(loginForm);

//       /*
//       // [已废弃] 模拟数据
//       const mockResponse = {
//         token: 'mock-jwt-token-' + Date.now(),
//         userInfo: { ... },
//         permissions: [...]
//       }
//       */

//       // [最终修正] 使用从后端 API 返回的真实数据
//       const realData = response.data; // 假设后端返回的数据在 response.data 中

//       // 保存到状态和本地存储
//       token.value = realData.token;
//       userInfo.value = realData.userInfo;
//       permissions.value = realData.permissions;

//       localStorage.setItem("token", realData.token);
//       localStorage.setItem("userInfo", JSON.stringify(realData.userInfo));
//       localStorage.setItem("permissions", JSON.stringify(realData.permissions));

//       ElMessage.success("登录成功");
//       // [最终修正] 返回真实数据
//       return realData;
//     } catch (error) {
//       ElMessage.error("登录失败：" + (error.message || "未知错误"));
//       throw error;
//     }
//   };

//   // 登出
//   const logout = async () => {
//     try {
//       // await logoutApi()

//       // 清除状态和本地存储
//       token.value = "";
//       userInfo.value = {};
//       permissions.value = [];

//       localStorage.removeItem("token");
//       localStorage.removeItem("userInfo");
//       localStorage.removeItem("permissions");

//       ElMessage.success("已退出登录");
//     } catch (error) {
//       console.error("登出失败:", error);
//       // 即使 API 调用失败，也要清除本地数据
//       token.value = "";
//       userInfo.value = {};
//       permissions.value = [];
//       localStorage.clear();
//     }
//   };

//   // 获取用户信息
//   const fetchUserInfo = async () => {
//     try {
//       if (!token.value) return null;

//       // const response = await getUserInfo()
//       // userInfo.value = response.data
//       // permissions.value = response.permissions

//       return userInfo.value;
//     } catch (error) {
//       console.error("获取用户信息失败:", error);
//       await logout();
//       throw error;
//     }
//   };

//   // 更新用户信息
//   const updateUserInfo = (newUserInfo) => {
//     userInfo.value = { ...userInfo.value, ...newUserInfo };
//     localStorage.setItem("userInfo", JSON.stringify(userInfo.value));
//   };

//   return {
//     // 状态
//     token,
//     userInfo,
//     permissions,

//     // 计算属性
//     isLoggedIn,
//     userName,
//     userRole,
//     avatar,

//     // 方法
//     hasRole,
//     hasAnyRole,
//     hasPermission,
//     login,
//     logout,
//     fetchUserInfo,
//     updateUserInfo,
//   };
// });

// /src/stores/user.js

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
// import { login as loginApi } from '@/api/auth' // 暂时注释掉真实API

export const useUserStore = defineStore("user", () => {
  // 状态
  const token = ref(localStorage.getItem("token") || "");
  const userInfo = ref(JSON.parse(localStorage.getItem("userInfo") || "{}"));
  const permissions = ref(
    JSON.parse(localStorage.getItem("permissions") || "[]")
  );

  // 计算属性
  const isLoggedIn = computed(() => !!token.value);
  const userName = computed(() => userInfo.value.name || "");
  const userRole = computed(() => userInfo.value.role || "guest");

  // 检查是否有任意一个角色
  const hasAnyRole = (roles) => {
    if (!roles || roles.length === 0) return true;
    if (userInfo.value.role === "super_admin") return true;
    return roles.includes(userInfo.value.role);
  };

  // 登录 (强化模拟版本)
  const login = async (loginForm) => {
    // --- 真实 API 调用 (等待后端完成后取消注释) ---

    try {
      const response = await loginApi(loginForm);
      const realData = response.data;

      token.value = realData.token;
      userInfo.value = realData.userInfo;
      permissions.value = realData.permissions;

      localStorage.setItem("token", realData.token);
      localStorage.setItem("userInfo", JSON.stringify(realData.userInfo));
      localStorage.setItem("permissions", JSON.stringify(realData.permissions));

      ElMessage.success("登录成功");
      return realData;
    } catch (error) {
      ElMessage.error("登录失败：" + (error.message || "未知错误"));
      throw error;
    }

    // // --- 开发环境模拟登录 (立即生效) ---
    // console.warn("注意：当前正在使用模拟登录！");

    // let mockData = {};

    // if (loginForm.username === "admin") {
    //   mockData = {
    //     token: "mock-super-admin-token-" + Date.now(),
    //     userInfo: {
    //       id: 1,
    //       name: "系统管理员",
    //       username: "admin",
    //       role: "super_admin", // 超级管理员
    //     },
    //     permissions: ["*"], // 拥有所有权限
    //   };
    // } else {
    //   // 模拟普通员工
    //   mockData = {
    //     token: "mock-employee-token-" + Date.now(),
    //     userInfo: {
    //       id: 2,
    //       name: "普通员工",
    //       username: "employee",
    //       role: "employee", // 普通员工
    //     },
    //     permissions: ["dashboard:read", "ticket:read"], // 假设有一些基本权限
    //   };
    // }

    // 保存到状态和本地存储
    token.value = mockData.token;
    userInfo.value = mockData.userInfo;
    permissions.value = mockData.permissions;

    localStorage.setItem("token", mockData.token);
    localStorage.setItem("userInfo", JSON.stringify(mockData.userInfo));
    localStorage.setItem("permissions", JSON.stringify(mockData.permissions));

    ElMessage.success("模拟登录成功");
    return mockData; // 必须返回一个 Promise.resolve 的结果
  };

  // 登出
  const logout = async () => {
<<<<<<< HEAD
    try {
      // await logoutApi()

      // 清除状态和本地存储
      token.value = ''
      userInfo.value = {}
      permissions.value = []

      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('permissions')

      ElMessage.success('已退出登录')
    } catch (error) {
      console.error('登出失败:', error)
      // 即使 API 调用失败，也要清除本地数据
      token.value = ''
      userInfo.value = {}
      permissions.value = []
      localStorage.clear()
    }
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      if (!token.value) return null

      // const response = await getUserInfo()
      // userInfo.value = response.data
      // permissions.value = response.permissions

      return userInfo.value
    } catch (error) {
      console.error('获取用户信息失败:', error)
      await logout()
      throw error
    }
  }

  // 更新用户信息
  const updateUserInfo = (newUserInfo) => {
    userInfo.value = { ...userInfo.value, ...newUserInfo }
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  }
=======
    token.value = "";
    userInfo.value = {};
    permissions.value = [];
    localStorage.clear();
    ElMessage.success("已退出登录");
  };
>>>>>>> 7dd28f3 (feat:link db)

  return {
    token,
    userInfo,
    permissions,
<<<<<<< HEAD

    // 计算属性
    isLoggedIn,
    userName,
    userRole,
    avatar,

    // 方法
    hasRole,
=======
    isLoggedIn,
    userName,
    userRole,
>>>>>>> 7dd28f3 (feat:link db)
    hasAnyRole,
    login,
    logout,
<<<<<<< HEAD
    fetchUserInfo,
    updateUserInfo,
  }
})
=======
  };
});
>>>>>>> 7dd28f3 (feat:link db)

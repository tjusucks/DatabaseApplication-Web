import { request } from "@/utils/request";

// 用户登录
export const login = (data) => {
  return request.post("/auth/login", data);
};

// 用户登出
export const logout = () => {
  return request.post("/auth/logout");
};

// 获取用户信息
export const getUserInfo = () => {
  return request.get("/auth/userinfo");
};

// 刷新 token
export const refreshToken = () => {
  return request.post("/auth/refresh");
};

// 修改密码
export const changePassword = (data) => {
  return request.post("/auth/change-password", data);
};

// 重置密码
export const resetPassword = (data) => {
  return request.post("/auth/reset-password", data);
};

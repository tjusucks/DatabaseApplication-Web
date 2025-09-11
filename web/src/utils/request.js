import axios from "axios";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStore } from "@/stores/user";
import { useAppStore } from "@/stores/app";
import router from "@/router";

// 创建 axios 实例
const service = axios.create({
  baseURL: '/api', // 使用 Vite 代理，指向 vite.config.js 中配置的 target
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    const appStore = useAppStore();

    // 显示全局加载状态
    appStore.setGlobalLoading(true);

    // 添加认证 token
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
    }

    // 添加请求时间戳，防止缓存
    if (config.method === "get") {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    return config;
  },
  (error) => {
    const appStore = useAppStore();
    appStore.setGlobalLoading(false);
    console.error("请求错误:", error);
    return Promise.reject(error);
  },
);

service.interceptors.response.use(
  (response) => {
    const appStore = useAppStore();
    appStore.setGlobalLoading(false);

    const { data, status } = response;

    // 检查状态码是否在 2xx 成功范围内
    if (status >= 200 && status < 300) {
      // 对于 DELETE 请求或返回 204 No Content 的情况，data 可能为空，直接返回 response
      if (status === 204 || response.config.method.toLowerCase() === "delete") {
        return response;
      }
      return data;
    }

    // 对于不在 2xx 范围内的响应，统一作为错误处理
    ElMessage.error(data.message || `请求失败，状态码: ${status}`);
    return Promise.reject(
      new Error(data.message || `请求失败，状态码: ${status}`),
    );
  },
  (error) => {
    const appStore = useAppStore();
    const userStore = useUserStore();
    appStore.setGlobalLoading(false);

    const { response, message } = error;

    if (response) {
      const { status, data } = response;

      switch (status) {
        case 400:
          ElMessage.error(data.message || "请求参数错误");
          break;
        case 401:
          ElMessage.error("登录已过期，请重新登录");
          userStore.logout();
          router.push("/login");
          break;
        case 403:
          ElMessage.error("没有权限访问该资源");
          break;
        case 404:
          ElMessage.error("请求的资源不存在");
          break;
        case 500:
          ElMessage.error("服务器内部错误");
          break;
        case 502:
          ElMessage.error("网关错误");
          break;
        case 503:
          ElMessage.error("服务不可用");
          break;
        case 504:
          ElMessage.error("网关超时");
          break;
        default:
          ElMessage.error(data.message || `请求失败 (${status})`);
      }
    } else if (message.includes("timeout")) {
      ElMessage.error("请求超时，请稍后重试");
    } else if (message.includes("Network Error")) {
      ElMessage.error("网络连接失败，请检查网络");
    } else {
      ElMessage.error("请求失败，请稍后重试");
    }

    return Promise.reject(error);
  },
);

// 封装常用请求方法
export const request = {
  get(url, params = {}, config = {}) {
    return service.get(url, { params, ...config });
  },

  post(url, data = {}, config = {}) {
    return service.post(url, data, config);
  },

  put(url, data = {}, config = {}) {
    return service.put(url, data, config);
  },

  delete(url, config = {}) {
    return service.delete(url, config);
  },

  patch(url, data = {}, config = {}) {
    return service.patch(url, data, config);
  },

  upload(url, formData, config = {}) {
    return service.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...config,
    });
  },

  download(url, params = {}, filename = "") {
    return service
      .get(url, {
        params,
        responseType: "blob",
      })
      .then((response) => {
        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename || "download";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      });
  },
};

export default service;

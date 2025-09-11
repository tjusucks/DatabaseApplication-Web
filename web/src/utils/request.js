import axios from "axios";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStore } from "@/stores/user";
import { useAppStore } from "@/stores/app";
import router from "@/router";

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

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
  }
);

service.interceptors.response.use(
  /**
   * 成功回调 (onFulfilled)
   * HTTP 状态码在 2xx 范围内时，会触发此函数。
   */
  /**
   * 成功回调 (onFulfilled)
   * HTTP 状态码在 2xx 范围内时，会触发此函数。
   */
  (response) => {
    // 1. 获取 store 实例
    const appStore = useAppStore();

    // 2. 关闭全局加载状态
    appStore.setGlobalLoading(false);

    // 3. 优先处理特殊情况：文件下载
    // 检查响应头中的 'content-type'
    const contentType = response.headers["content-type"] || "";
    if (
      contentType.includes("application/octet-stream") ||
      contentType.includes("application/vnd.ms-excel")
    ) {
      // 对于文件下载，我们需要返回完整的 response 对象，
      // 以便在 API 调用层可以访问到文件名等 headers 信息。
      return response;
    }

    // 4. 对于所有其他成功的 API 请求，直接返回后端响应体中的数据 (response.data)
    // 这是核心的简化，确保了 store 或组件中拿到的都是纯粹的业务数据。
    return response.data;
  },

  /**
   * 失败回调 (onRejected)
   * HTTP 状态码超出 2xx 范围时，会触发此函数。
   */
  (error) => {
    // 1. 获取 store 实例
    const appStore = useAppStore();
    const userStore = useUserStore();

    // 2. 关闭全局加载状态
    appStore.setGlobalLoading(false);

    // 3. 从 error 对象中解构需要的信息
    const { response, message } = error;

    // 4. 根据是否有 response 对象，进行分类处理
    if (response) {
      // 情况一：服务器返回了响应，但状态码是错误的 (如 401, 404, 500)
      const { status, data } = response;

      switch (status) {
        case 400:
          // 尝试从 ASP.NET Core 验证错误的标准结构中提取更详细的信息
          const errorMsg = data.errors
            ? Object.values(data.errors).flat().join("\n")
            : data.message || "请求参数错误";
          ElMessage.error(errorMsg);
          break;
        case 401:
          ElMessage.error("登录已过期，请重新登录");
          userStore.logout();
          router.push("/login");
          break;
        case 403:
          ElMessage.error("您没有权限访问该资源");
          break;
        case 404:
          ElMessage.error("请求的资源不存在 (404)");
          break;
        case 500:
          ElMessage.error("服务器内部错误 (500)");
          break;
        case 502:
          ElMessage.error("网关错误 (502)");
          break;
        case 503:
          ElMessage.error("服务不可用 (503)");
          break;
        case 504:
          ElMessage.error("网关超时 (504)");
          break;
        default:
          ElMessage.error(data.message || `请求失败，状态码: ${status}`);
      }
    } else if (message.includes("timeout")) {
      // 情况二：请求超时
      ElMessage.error("请求超时，请检查网络或联系管理员");
    } else if (message.includes("Network Error")) {
      // 情况三：网络错误 (如后端服务未启动)
      ElMessage.error("网络连接失败，请检查您的网络连接");
    } else {
      // 情况四：其他未知错误 (如请求被取消等)
      ElMessage.error(message || "发生未知错误");
    }

    // 5. 必须将错误继续抛出，以便 API 调用处的 .catch() 可以捕获到
    return Promise.reject(error);
  }
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

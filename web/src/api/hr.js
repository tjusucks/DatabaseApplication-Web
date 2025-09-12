import request from "@/utils/request";

// 人力资源管理 API

// ========== 考勤管理 ==========

/**
 * 创建考勤记录
 * @param {Object} data 考勤记录数据
 */
export function createAttendance(data) {
  return request({
    url: "/api/resource/attendance",
    method: "post",
    data,
  });
}

/**
 * 更新考勤记录
 * @param {string} id 考勤记录ID
 * @param {Object} data 更新数据
 */
export function updateAttendance(id, data) {
  return request({
    url: `/api/resource/attendance/${id}`,
    method: "put",
    data,
  });
}

/**
 * 删除考勤记录
 * @param {string} id 考勤记录ID
 */
export function deleteAttendance(id) {
  return request({
    url: `/api/resource/attendance/${id}`,
    method: "delete",
  });
}

/**
 * 员工签到
 * @param {Object} data 签到数据
 */
export function checkIn(data) {
  return request({
    url: "/api/resource/attendance/checkin",
    method: "post",
    data,
  });
}

/**
 * 员工签退
 * @param {Object} data 签退数据
 */
export function checkOut(data) {
  return request({
    url: "/api/resource/attendance/checkout",
    method: "post",
    data,
  });
}

/**
 * 申请请假
 * @param {Object} data 请假数据
 */
export function applyLeave(data) {
  return request({
    url: "/api/resource/attendance/leave",
    method: "post",
    data,
  });
}

/**
 * 更新考勤状态
 * @param {string} id 考勤记录ID
 * @param {Object} data 状态数据
 */
export function updateAttendanceStatus(id, data) {
  return request({
    url: `/api/resource/attendance/status/${id}`,
    method: "put",
    data,
  });
}

/**
 * 统一查询接口，支持复杂查询条件
 * @param {Object} params 查询参数
 */
export function queryAttendance(params) {
  return request({
    url: "/api/resource/attendance/search",
    method: "get",
    params,
  });
}

// ========== 员工管理 ==========

/**
 * 创建员工
 * @param {Object} data 员工数据
 */
export function createEmployee(data) {
  return request({
    url: "/api/user/employees",
    method: "post",
    data,
  });
}

/**
 * 根据ID获取员工信息
 * @param {string} id 员工ID
 */
export function getEmployeeById(id) {
  return request({
    url: `/api/user/employees/${id}`,
    method: "get",
  });
}

/**
 * 更新员工信息
 * @param {string} id 员工ID
 * @param {Object} data 更新数据
 */
export function updateEmployee(id, data) {
  return request({
    url: `/api/user/employees/${id}`,
    method: "put",
    data,
  });
}

/**
 * 删除员工
 * @param {string} id 员工ID
 */
export function deleteEmployee(id) {
  return request({
    url: `/api/user/employees/${id}`,
    method: "delete",
  });
}

/**
 * 统一查询端点，支持多种查询条件
 * @param {Object} params 查询参数
 */
export function getEmployees(params) {
  return request({
    url: "/api/user/employees/search",
    method: "get",
    params,
  });
}

// ========== 员工绩效评估 ==========

/**
 * 创建绩效记录
 * @param {Object} data 绩效记录数据
 */
export function createEmployeeReview(data) {
  return request({
    url: "/api/resource/employee-reviews",
    method: "post",
    data,
  });
}

/**
 * 更新绩效记录
 * @param {string} id 绩效记录ID
 * @param {Object} data 更新数据
 */
export function updateEmployeeReview(id, data) {
  return request({
    url: `/api/resource/employee-reviews/${id}`,
    method: "put",
    data,
  });
}

/**
 * 删除绩效记录
 * @param {string} id 绩效记录ID
 */
export function deleteEmployeeReview(id) {
  return request({
    url: `/api/resource/employee-reviews/${id}`,
    method: "delete",
  });
}

/**
 * 查询绩效记录
 * @param {Object} params 查询参数
 */
export function getEmployeeReviews(params) {
  return request({
    url: "/api/resource/employee-reviews/search",
    method: "get",
    params,
  });
}

import axios from 'axios';

const BASE_URL = '/api/resource/inspections';

/**
 * 创建安全检查记录
 * @param {Object} data - CreateInspectionRecordCommand 数据
 * @returns {Promise<number>} 返回创建的记录ID
 */
export const createInspectionRecord = async (data) => {
  const response = await axios.post(BASE_URL, data);
  return response.data; // 返回记录ID (int32)
};

/**
 * 根据ID获取单个检查记录
 * @param {number} id - 检查记录ID
 * @returns {Promise<Object>} 返回 InspectionRecordSummaryDto
 */
export const getInspectionRecord = async (id) => {
  const response = await axios.get(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * 更新检查记录
 * @param {number} id - 检查记录ID
 * @param {Object} data - UpdateInspectionRecordCommand 数据
 * @returns {Promise<void>}
 */
export const updateInspectionRecord = async (id, data) => {
  await axios.put(`${BASE_URL}/${id}`, data);
};

/**
 * 删除检查记录
 * @param {number} id - 检查记录ID
 * @returns {Promise<void>}
 */
export const deleteInspectionRecord = async (id) => {
  await axios.delete(`${BASE_URL}/${id}`);
};

/**
 * 搜索检查记录（带分页和筛选）
 * @param {Object} params - 搜索参数
 * @param {string} [params.keyword] - 关键词
 * @param {number} [params.rideId] - 游乐设施ID
 * @param {number} [params.teamId] - 团队ID
 * @param {string} [params.checkType] - 检查类型
 * @param {boolean} [params.isPassed] - 是否通过
 * @param {string} [params.checkDateFrom] - 检查开始日期 (ISO datetime)
 * @param {string} [params.checkDateTo] - 检查结束日期 (ISO datetime)
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=10] - 每页大小
 * @returns {Promise<Object>} 返回 InspectionRecordResult
 */
export const searchInspectionRecords = async (params = {}) => {
  const response = await axios.get(`${BASE_URL}/search`, { params });
  return response.data;
};

/**
 * 获取检查记录统计信息
 * @param {Object} params - 统计参数
 * @param {string} [params.startDate] - 开始日期 (ISO datetime)
 * @param {string} [params.endDate] - 结束日期 (ISO datetime)
 * @param {number} [params.rideId] - 游乐设施ID
 * @returns {Promise<Object>} 返回 InspectionRecordStatsDto
 */
export const getInspectionStats = async (params = {}) => {
  const response = await axios.get(`${BASE_URL}/stats`, { params });
  return response.data;
};

// 为了保持向后兼容，可以保留一些旧的函数名作为别名
export const getSafetyInspections = searchInspectionRecords;
export const addSafetyInspection = createInspectionRecord;
export const deleteSafetyInspection = deleteInspectionRecord;
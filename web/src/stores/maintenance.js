import { defineStore } from 'pinia';
import { request } from '@/utils/request';

export const useMaintenanceStore = defineStore('maintenance', {
  state: () => ({
    records: [],
    recordDetail: null,
  }),

  actions: {
    async getRecords(params) {
      const response = await request.get('/maintenance/records', { params });
      return {
        items: response.data.items || [],
        total: response.data.total || 0,
      };
    },

    async getRecordDetail(id) {
      const response = await request.get(`/maintenance/records/${id}`);
      this.recordDetail = response.data;
      return this.recordDetail;
    },
  },
});
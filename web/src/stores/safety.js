import { defineStore } from 'pinia';
import { request } from '@/utils/request';

export const useSafetyStore = defineStore('safety', {
  state: () => ({
    inspections: [],
    inspectionDetail: null,
  }),

  actions: {
    async getInspections(params) {
      const response = await request.get('/safety/inspections', { params });
      return {
        items: response.data.items || [],
        total: response.data.total || 0,
      };
    },

    async addInspection(data) {
      await request.post('/safety/inspections', data);
    },

    async deleteInspection(id) {
      await request.delete(`/safety/inspections/${id}`);
    },
  },
});
import { defineStore } from 'pinia';
import { request } from '@/utils/request';

export const useFacilityStore = defineStore('facilities', {
  state: () => ({
    facilities: [],
    facilityDetail: null,
  }),

  actions: {
    async getFacilities(params) {
      const response = await request.get('/facilities', { params });
      return {
        items: response.data.items || [],
        total: response.data.total || 0,
      };
    },

    async getFacilityDetail(id) {
      const response = await request.get(`/facilities/${id}`);
      this.facilityDetail = response.data;
      return this.facilityDetail;
    },
  },
});
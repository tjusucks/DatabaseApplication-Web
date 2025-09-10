<template>
  <PageTemplate title="退票列表" description="查看所有已处理和未处理的退票申请记录" icon="Tickets">
    <el-table :data="refunds" border>
      <el-table-column prop="refundId" label="退票申请ID" />
      <el-table-column prop="bookingId" label="原预订号" />
      <el-table-column prop="refundAmount" label="退款金额" />
      <el-table-column prop="requestTime" label="申请时间" />
      <el-table-column label="状态">
        <template #default="{ row }">
          <el-tag :type="statusMap[row.status].type">{{ statusMap[row.status].text }}</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </PageTemplate>
</template>

<script setup>
import { ref } from 'vue'
import PageTemplate from '@/components/PageTemplate.vue'
const statusMap = {
  PENDING: { text: '待审批', type: 'warning' },
  APPROVED: { text: '已批准', type: 'success' },
  REJECTED: { text: '已驳回', type: 'danger' },
}
const refunds = ref([
  {
    refundId: 'RF001',
    bookingId: 'BK20240520003',
    refundAmount: '¥180.00',
    requestTime: '2024-05-21 14:00',
    status: 'APPROVED',
  },
  {
    refundId: 'RF002',
    bookingId: 'BK20240520005',
    refundAmount: '¥360.00',
    requestTime: '2024-05-21 15:30',
    status: 'PENDING',
  },
  {
    refundId: 'RF003',
    bookingId: 'BK20240519012',
    refundAmount: '¥180.00',
    requestTime: '2024-05-20 10:00',
    status: 'REJECTED',
  },
])
</script>

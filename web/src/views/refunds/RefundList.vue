<template>
  <PageTemplate title="退票列表" description="查询、查看和处理所有退票申请记录" icon="List">
    <el-form :inline="true" :model="queryParams" @submit.prevent="handleSearch" class="search-bar">
      <el-form-item label="关键词">
        <el-input v-model="queryParams.keyword" placeholder="票号/退票单号" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="选择状态" clearable>
          <el-option label="待处理" value="Pending" />
          <el-option label="已批准" value="Approved" />
          <el-option label="已驳回" value="Rejected" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="refunds.list" border stripe v-loading="loading">
      <el-table-column prop="refundId" label="退票单号" />
      <el-table-column prop="ticketId" label="关联票号" />
      <el-table-column prop="requestDate" label="申请时间" />
      <el-table-column prop="refundAmount" label="退款金额" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" link icon="View" @click="viewDetails(row.refundId)"
            >详情</el-button
          >
          <el-tooltip content="批准或驳回申请" placement="top">
            <el-button
              v-if="row.status === 'Pending'"
              size="small"
              type="primary"
              link
              icon="Finished"
              @click="process(row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="refunds.total"
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.size"
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>
  </PageTemplate>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRefundStore } from '@/stores/tickets.js'
import { storeToRefs } from 'pinia'
import PageTemplate from '@/components/PageTemplate.vue'
import { ElMessageBox, ElMessage } from 'element-plus'

const refundStore = useRefundStore()
const { refunds } = storeToRefs(refundStore)
const loading = ref(false)
const queryParams = reactive({ keyword: '', status: '', page: 1, size: 10 })

const getStatusType = (status) => {
  if (status === 'Approved') return 'success'
  if (status === 'Rejected') return 'danger'
  return 'warning'
}

const loadData = async () => {
  loading.value = true
  await refundStore.fetchRefunds(queryParams)
  loading.value = false
}

const handleSearch = () => {
  queryParams.page = 1
  loadData()
}

const viewDetails = (id) => {
  ElMessage.info(`查看详情功能待实现，ID: ${id}`)
}

const process = (row) => {
  ElMessageBox.confirm(`处理退票单 ${row.refundId}，请选择操作：`, '处理退票', {
    distinguishCancelAndClose: true,
    confirmButtonText: '批准申请',
    cancelButtonText: '驳回申请',
  })
    .then(() => {
      refundStore.processRefundRequest({
        refundId: row.refundId,
        isApproved: true,
        notes: '管理员批准通过',
      })
    })
    .catch((action) => {
      if (action === 'cancel') {
        ElMessageBox.prompt('请输入驳回理由', '驳回申请').then(({ value }) => {
          refundStore.processRefundRequest({
            refundId: row.refundId,
            isApproved: false,
            notes: value || '管理员驳回',
          })
        })
      }
    })
}

onMounted(loadData)
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
.search-bar {
  margin-bottom: 20px;
}
</style>

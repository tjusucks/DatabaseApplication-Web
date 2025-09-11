<template>
  <PageTemplate
    title="退票列表"
    description="查询、查看和处理所有退票申请记录"
    icon="List"
  >
    <el-form :inline="true" :model="queryParams" @submit.prevent="handleSearch">
      <el-form-item label="关键词">
        <el-input
          v-model="queryParams.keyword"
          placeholder="票号/退票单号"
          clearable
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="queryParams.status"
          placeholder="选择状态"
          clearable
        >
          <el-option label="待处理" value="Pending" />
          <el-option label="已批准" value="Approved" />
          <el-option label="已驳回" value="Rejected" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch"
          >查询</el-button
        >
      </el-form-item>
    </el-form>

    <el-table :data="refunds.list" border v-loading="loading">
      <el-table-column prop="refundId" label="退票单号" />
      <el-table-column prop="ticketId" label="关联票号" />
      <el-table-column prop="requestDate" label="申请时间" />
      <el-table-column prop="refundAmount" label="退款金额" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button size="small" @click="viewDetails(row.refundId)"
            >详情</el-button
          >
          <el-button
            v-if="row.status === 'Pending'"
            size="small"
            type="primary"
            @click="process(row)"
            >处理</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </PageTemplate>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRefundStore } from "@/stores/tickets.js";
import { storeToRefs } from "pinia";
import PageTemplate from "@/components/PageTemplate.vue";
import { ElMessageBox } from "element-plus";

const refundStore = useRefundStore();
const { refunds } = storeToRefs(refundStore);
const loading = ref(false);
const queryParams = reactive({ keyword: "", status: "", page: 1, size: 10 });

const getStatusType = (status) => {
  if (status === "Approved") return "success";
  if (status === "Rejected") return "danger";
  return "warning";
};

const loadData = async () => {
  loading.value = true;
  await refundStore.fetchRefunds(queryParams);
  loading.value = false;
};

const handleSearch = () => {
  queryParams.page = 1;
  loadData();
};

const viewDetails = (id) => {
  console.log("查看详情", id);
};

const process = (row) => {
  ElMessageBox.confirm(`处理退票单 ${row.refundId}，请选择操作：`, "处理退票", {
    distinguishCancelAndClose: true,
    confirmButtonText: "批准",
    cancelButtonText: "驳回",
  })
    .then(() => {
      refundStore.processRefundRequest({
        refundId: row.refundId,
        isApproved: true,
        notes: "批准通过",
      });
    })
    .catch((action) => {
      if (action === "cancel") {
        refundStore.processRefundRequest({
          refundId: row.refundId,
          isApproved: false,
          notes: "驳回申请",
        });
      }
    });
};

onMounted(loadData);
</script>

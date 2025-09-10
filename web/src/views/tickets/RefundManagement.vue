<template>
  <PageTemplate
    title="退票处理流程"
    description="审批或驳回游客提交的退票申请"
    icon="Failed"
  >
    <el-table :data="refunds.list" v-loading="loading" style="width: 100%">
      <el-table-column prop="refundId" label="退票申请ID" />
      <el-table-column prop="bookingId" label="原预订号" />
      <el-table-column prop="ticketName" label="门票名称" />
      <el-table-column prop="refundAmount" label="退款金额" />
      <el-table-column prop="requestTime" label="申请时间" />
      <el-table-column label="状态">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <div v-if="row.status === 'PENDING'">
            <el-button size="small" type="success" @click="handleApprove(row)"
              >批准</el-button
            >
            <el-button size="small" type="danger" @click="handleReject(row)"
              >驳回</el-button
            >
          </div>
          <span v-else>已处理</span>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="margin-top: 20px"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="refunds.total"
      v-model:current-page="queryParams.page"
      v-model:page-size="queryParams.size"
      @size-change="fetchData"
      @current-change="fetchData"
    />
  </PageTemplate>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useTicketStore } from "@/stores/ticket";
import { storeToRefs } from "pinia";
import { ElMessageBox, ElMessage } from "element-plus";
import PageTemplate from "@/components/PageTemplate.vue"; // 引入通用模板

const ticketStore = useTicketStore();
const { refunds } = storeToRefs(ticketStore);

const loading = ref(false);
const queryParams = reactive({ page: 1, size: 10 });

const statusMap = {
  PENDING: { text: "待审批", type: "warning" },
  APPROVED: { text: "已批准", type: "success" },
  REJECTED: { text: "已驳回", type: "danger" },
};
const getStatusText = (status) => statusMap[status]?.text || "未知";
const getStatusType = (status) => statusMap[status]?.type || "info";

const fetchData = async () => {
  loading.value = true;
  await ticketStore.fetchRefunds(queryParams);
  loading.value = false;
};

const handleApprove = (row) => {
  ElMessageBox.confirm(
    `确定要批准ID为 ${row.refundId} 的退票申请吗?`,
    "确认批准",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      await ticketStore.processRefundRequest(row.id, { approved: true });
    })
    .catch(() => {
      ElMessage.info("操作已取消");
    });
};

const handleReject = (row) => {
  ElMessageBox.prompt("请输入驳回理由", "确认驳回", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(async ({ value }) => {
      await ticketStore.processRefundRequest(row.id, {
        approved: false,
        reason: value,
      });
    })
    .catch(() => {
      ElMessage.info("操作已取消");
    });
};

onMounted(() => {
  fetchData();
});
</script>

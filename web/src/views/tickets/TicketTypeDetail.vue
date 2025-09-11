<template>
  <PageTemplate
    :title="`价格规则管理 - ${ticketTypeDetail?.typeName || ''}`"
    description="为当前票种设置不同条件下的价格"
  >
    <div class="action-bar">
      <el-button type="primary" icon="Plus" @click="openDialog('create')">
        新增价格规则
      </el-button>
    </div>

    <el-table :data="priceRulesForType" border stripe v-loading="loading">
      <el-table-column prop="ruleId" label="规则ID" width="100" />
      <el-table-column prop="description" label="规则描述" />
      <el-table-column prop="price" label="价格" />
      <el-table-column prop="startDate" label="生效日期" />
      <el-table-column prop="endDate" label="失效日期" />
      <el-table-column label="操作" fixed="right" align="center">
        <template #default="{ row }">
          <el-button
            size="small"
            type="primary"
            link
            icon="Edit"
            @click="openDialog('edit', row)"
            >编辑</el-button
          >
          <el-button
            size="small"
            type="danger"
            link
            icon="Delete"
            @click="handleDelete(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetForm"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <!-- [最终修正] “规则描述”变为下拉选择框 -->
        <el-form-item label="规则描述" prop="ruleName">
          <el-select
            v-model="form.ruleName"
            placeholder="请选择规则类型"
            style="width: 100%"
          >
            <el-option label="平日价" value="平日价" />
            <el-option label="周末价" value="周末价" />
            <el-option label="节假日特惠" value="节假日特惠" />
            <el-option label="早鸟票" value="早鸟票" />
            <el-option label="夜场票" value="夜场票" />
          </el-select>
        </el-form-item>

        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="form.price"
            :precision="2"
            :step="10"
            :min="0"
          />
        </el-form-item>
        <el-form-item label="生效日期" prop="startDate">
          <el-date-picker
            v-model="form.startDate"
            type="date"
            placeholder="选择开始日期"
            style="width: 100%"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="失效日期" prop="endDate">
          <el-date-picker
            v-model="form.endDate"
            type="date"
            placeholder="选择结束日期 (可选)"
            style="width: 100%"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="isSubmitting"
          >
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </PageTemplate>
</template>

<script setup>
import { onMounted, ref, reactive, computed } from "vue";
import { useRoute } from "vue-router";
import { useTicketStore } from "@/stores/tickets.js";
import { storeToRefs } from "pinia";
import PageTemplate from "@/components/PageTemplate.vue";
import { ElMessageBox, ElMessage } from "element-plus";

// 1. 初始化
const route = useRoute();
const ticketStore = useTicketStore();
const ticketTypeId = Number(route.params.id);
const { ticketTypeDetail, priceRulesForType } = storeToRefs(ticketStore);
const { fetchTicketTypeById, fetchPriceRulesForTicketType, createPriceRule } =
  ticketStore;

const loading = ref(false);
const isSubmitting = ref(false);
const dialogVisible = ref(false);
const dialogMode = ref("create");
const formRef = ref(null);

const dialogTitle = computed(() =>
  dialogMode.value === "create" ? "新增价格规则" : "编辑价格规则"
);

// 2. 表单数据和规则
// [最终修正] 字段名与后端期望的 JSON 字段名完全匹配
const form = reactive({
  ruleId: null,
  ruleName: "", // 对应后端的 RuleName
  price: 0.0,
  startDate: null,
  endDate: null,
  ticketTypeId: ticketTypeId,
});

// [最终修正] 验证规则也使用新的属性名
const rules = reactive({
  ruleName: [{ required: true, message: "请输入规则描述", trigger: "blur" }],
  price: [{ required: true, message: "请输入价格", trigger: "blur" }],
  startDate: [{ required: true, message: "请选择生效日期", trigger: "change" }],
});

// 3. 方法
const loadData = async () => {
  loading.value = true;
  await Promise.all([
    fetchTicketTypeById(ticketTypeId),
    fetchPriceRulesForTicketType(ticketTypeId),
  ]);
  loading.value = false;
};

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields();
  form.ruleId = null;
};

const openDialog = (mode, rowData = null) => {
  resetForm();
  dialogMode.value = mode;
  if (mode === "edit" && rowData) {
    // [最终修正] 编辑时，将表格的 description 赋值给表单的 ruleName
    const { description, ...rest } = rowData;
    Object.assign(form, { ...rest, ruleName: description });
  }
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      isSubmitting.value = true;
      let success = false;
      if (dialogMode.value === "create") {
        success = await createPriceRule(form);
      } else {
        // success = await ticketStore.updatePriceRule(form);
        console.warn("更新价格规则功能待实现");
        success = true; // 模拟成功
      }

      if (success) {
        dialogVisible.value = false;
        await loadData();
      }
      isSubmitting.value = false;
    }
  });
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除规则 "${row.description}" 吗？`,
      "警告",
      {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    // await ticketStore.deletePriceRule(ticketTypeId, row.ruleId);
    ElMessage.info(`删除规则 ${row.ruleId} 功能待与后端联调`);
    await loadData();
  } catch (e) {
    if (e !== "cancel") ElMessage.error("删除失败");
  }
};

// 4. 生命周期
onMounted(loadData);
</script>

<style scoped>
.action-bar {
  margin-bottom: 20px;
}
</style>

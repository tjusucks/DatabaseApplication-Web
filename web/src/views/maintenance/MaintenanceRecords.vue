<template>
  <div class="maintenance-records">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>维护记录</span>
          <el-input v-model="searchQuery" placeholder="搜索维护记录" clearable @input="fetchRecords" />
          <el-button type="primary" @click="openAddDialog">新增维护记录</el-button>
        </div>
      </template>

      <el-table :data="records" :loading="loading" @row-click="viewRecordDetail">
        <el-table-column prop="maintenanceId" label="记录ID" width="100" />
        <el-table-column prop="rideName" label="设施名称" />
        <el-table-column prop="teamName" label="维护团队" />
        <el-table-column prop="startTime" label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="isCompleted" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isCompleted ? 'success' : 'warning'">
              {{ row.isCompleted ? '已完成' : '进行中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="费用" width="100" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click.stop="viewRecordDetail(row)">查看详情</el-button>
            <el-button size="small" type="primary" @click.stop="editRecord(row)">编辑</el-button>
            <el-button size="small" type="danger" @click.stop="deleteRecord(row.maintenanceId)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="fetchRecords"
      />
    </el-card>

    <!-- 新增/编辑维护记录对话框 -->
    <el-dialog v-model="isDialogVisible" :title="isEditing ? '编辑维护记录' : '新增维护记录'" width="600px">
      <el-form :model="form" ref="formRef" label-width="120px" :rules="rules">
        <el-form-item label="设施ID" prop="rideId">
          <el-input-number v-model="form.rideId" :min="1" placeholder="请输入设施ID" />
        </el-form-item>
        <el-form-item label="维护团队ID" prop="teamId">
          <el-input-number v-model="form.teamId" :min="1" placeholder="请输入团队ID" />
        </el-form-item>
        <el-form-item label="管理员ID" prop="managerId">
          <el-input-number v-model="form.managerId" :min="1" placeholder="请输入管理员ID（可选）" />
        </el-form-item>
        <el-form-item label="维护类型" prop="maintenanceType">
          <el-select v-model="form.maintenanceType" placeholder="请选择维护类型">
            <el-option label="日常维护" :value="1" />
            <el-option label="紧急维修" :value="2" />
            <el-option label="定期检查" :value="3" />
            <el-option label="大修" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker 
            v-model="form.startTime" 
            type="datetime" 
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss.sssZ"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker 
            v-model="form.endTime" 
            type="datetime" 
            placeholder="选择结束时间（可选）"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss.sssZ"
          />
        </el-form-item>
        <el-form-item label="费用" prop="cost">
          <el-input-number v-model="form.cost" :min="0" :precision="2" placeholder="请输入费用" />
        </el-form-item>
        <el-form-item label="更换部件" prop="partsReplaced">
          <el-input v-model="form.partsReplaced" type="textarea" placeholder="请输入更换的部件（可选）" />
        </el-form-item>
        <el-form-item label="维护详情" prop="maintenanceDetails">
          <el-input v-model="form.maintenanceDetails" type="textarea" placeholder="请输入维护详情（可选）" />
        </el-form-item>
        <el-form-item label="是否完成" prop="isCompleted">
          <el-switch v-model="form.isCompleted" />
        </el-form-item>
        <el-form-item label="是否验收" prop="isAccepted" v-if="form.isCompleted">
          <el-switch v-model="form.isAccepted" />
        </el-form-item>
        <el-form-item label="验收日期" prop="acceptanceDate" v-if="form.isAccepted">
          <el-date-picker 
            v-model="form.acceptanceDate" 
            type="datetime" 
            placeholder="选择验收日期"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss.sssZ"
          />
        </el-form-item>
        <el-form-item label="验收意见" prop="acceptanceComments" v-if="form.isAccepted">
          <el-input v-model="form.acceptanceComments" type="textarea" placeholder="请输入验收意见" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="isDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRecord">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { searchMaintenanceRecords, createMaintenanceRecord, updateMaintenanceRecord, deleteMaintenanceRecord } from '@/api/maintenance';
import { ElMessage, ElMessageBox } from 'element-plus';

const records = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const pagination = ref({ page: 1, pageSize: 10, total: 0 });
const isDialogVisible = ref(false);
const isEditing = ref(false);
const formRef = ref();

const form = ref({
  rideId: null,
  teamId: null,
  managerId: null,
  maintenanceType: null,
  startTime: '',
  endTime: null,
  cost: 0,
  partsReplaced: null,
  maintenanceDetails: null,
  isCompleted: false,
  isAccepted: null,
  acceptanceDate: null,
  acceptanceComments: null
});

const rules = {
  rideId: [{ required: true, message: '请输入设施ID', trigger: 'blur' }],
  teamId: [{ required: true, message: '请输入团队ID', trigger: 'blur' }],
  maintenanceType: [{ required: true, message: '请选择维护类型', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  cost: [{ required: true, message: '请输入费用', trigger: 'blur' }]
};

const fetchRecords = async () => {
  loading.value = true;
  try {
    const data = await searchMaintenanceRecords({
      query: searchQuery.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    });
    records.value = data.maintenanceRecords || [];
    pagination.value.total = data.totalCount || 0;
  } catch (error) {
    ElMessage.error('获取维护记录失败');
    console.error('获取维护记录失败:', error);
  } finally {
    loading.value = false;
  }
};

const viewRecordDetail = (record) => {
  console.log('查看维护记录详情:', record);
  // 这里可以跳转到详情页面或显示详情弹窗
};

const openAddDialog = () => {
  isEditing.value = false;
  form.value = {
    rideId: null,
    teamId: null,
    managerId: null,
    maintenanceType: null,
    startTime: '',
    endTime: null,
    cost: 0,
    partsReplaced: null,
    maintenanceDetails: null,
    isCompleted: false,
    isAccepted: null,
    acceptanceDate: null,
    acceptanceComments: null
  };
  isDialogVisible.value = true;
};

const editRecord = (record) => {
  isEditing.value = true;
  form.value = { ...record };
  isDialogVisible.value = true;
};

const saveRecord = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    if (isEditing.value) {
      await updateMaintenanceRecord(form.value.maintenanceId, form.value);
      ElMessage.success('更新维护记录成功');
    } else {
      await createMaintenanceRecord(form.value);
      ElMessage.success('新增维护记录成功');
    }
    
    isDialogVisible.value = false;
    fetchRecords();
  } catch (error) {
    ElMessage.error(isEditing.value ? '更新维护记录失败' : '新增维护记录失败');
    console.error('保存维护记录失败:', error);
  }
};

const deleteRecord = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条维护记录吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await deleteMaintenanceRecord(id);
    ElMessage.success('删除维护记录成功');
    fetchRecords();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除维护记录失败');
      console.error('删除维护记录失败:', error);
    }
  }
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-';
  return new Date(dateTime).toLocaleString('zh-CN');
};

onMounted(() => {
  fetchRecords();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
</style>
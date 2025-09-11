<template>
  <div class="maintenance-schedule">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>维护计划</span>
          <el-input v-model="searchQuery" placeholder="搜索维护计划" clearable @input="fetchSchedules" />
          <el-button type="primary" @click="openAddDialog">新增维护计划</el-button>
        </div>
      </template>

      <el-table :data="schedules" :loading="loading" @row-click="editSchedule">
        <el-table-column prop="maintenanceId" label="计划ID" width="100" />
        <el-table-column prop="rideName" label="设施名称" />
        <el-table-column prop="teamName" label="负责团队" />
        <el-table-column prop="startTime" label="计划日期" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="maintenanceType" label="维护类型" width="120">
          <template #default="{ row }">
            {{ getMaintenanceTypeName(row.maintenanceType) }}
          </template>
        </el-table-column>
        <el-table-column prop="isCompleted" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isCompleted ? 'success' : 'info'">
              {{ row.isCompleted ? '已执行' : '待执行' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click.stop="editSchedule(row)">编辑</el-button>
            <el-button size="small" type="success" @click.stop="executeSchedule(row)" v-if="!row.isCompleted">执行</el-button>
            <el-button size="small" type="danger" @click.stop="deleteSchedule(row.maintenanceId)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="fetchSchedules"
      />
    </el-card>

    <!-- 新增/编辑维护计划对话框 -->
    <el-dialog v-model="isDialogVisible" :title="isEditing ? '编辑维护计划' : '新增维护计划'" width="500px">
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
        <el-form-item label="计划时间" prop="startTime">
          <el-date-picker 
            v-model="form.startTime" 
            type="datetime" 
            placeholder="选择计划执行时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss.sssZ"
          />
        </el-form-item>
        <el-form-item label="预估费用" prop="cost">
          <el-input-number v-model="form.cost" :min="0" :precision="2" placeholder="请输入预估费用" />
        </el-form-item>
        <el-form-item label="计划详情" prop="maintenanceDetails">
          <el-input v-model="form.maintenanceDetails" type="textarea" placeholder="请输入维护计划详情" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="isDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveSchedule">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 执行维护对话框 -->
    <el-dialog v-model="isExecuteDialogVisible" title="执行维护计划" width="500px">
      <el-form :model="executeForm" ref="executeFormRef" label-width="120px">
        <el-form-item label="实际开始时间">
          <el-date-picker 
            v-model="executeForm.startTime" 
            type="datetime" 
            placeholder="选择实际开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss.sssZ"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker 
            v-model="executeForm.endTime" 
            type="datetime" 
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss.sssZ"
          />
        </el-form-item>
        <el-form-item label="实际费用">
          <el-input-number v-model="executeForm.cost" :min="0" :precision="2" placeholder="请输入实际费用" />
        </el-form-item>
        <el-form-item label="更换部件">
          <el-input v-model="executeForm.partsReplaced" type="textarea" placeholder="请输入更换的部件" />
        </el-form-item>
        <el-form-item label="维护详情">
          <el-input v-model="executeForm.maintenanceDetails" type="textarea" placeholder="请输入实际维护详情" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="isExecuteDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmExecute">确认执行</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { searchMaintenanceRecords, createMaintenanceRecord, updateMaintenanceRecord, deleteMaintenanceRecord } from '@/api/maintenance';
import { ElMessage, ElMessageBox } from 'element-plus';

const schedules = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const pagination = ref({ page: 1, pageSize: 10, total: 0 });
const isDialogVisible = ref(false);
const isExecuteDialogVisible = ref(false);
const isEditing = ref(false);
const formRef = ref();
const executeFormRef = ref();
const currentSchedule = ref(null);

const form = ref({
  rideId: null,
  teamId: null,
  managerId: null,
  maintenanceType: null,
  startTime: '',
  cost: 0,
  maintenanceDetails: '',
  isCompleted: false // 计划默认未完成
});

const executeForm = ref({
  startTime: '',
  endTime: '',
  cost: 0,
  partsReplaced: '',
  maintenanceDetails: ''
});

const rules = {
  rideId: [{ required: true, message: '请输入设施ID', trigger: 'blur' }],
  teamId: [{ required: true, message: '请输入团队ID', trigger: 'blur' }],
  maintenanceType: [{ required: true, message: '请选择维护类型', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择计划时间', trigger: 'change' }],
  cost: [{ required: true, message: '请输入预估费用', trigger: 'blur' }]
};

// 获取维护计划（实际上是获取未完成的维护记录作为计划）
const fetchSchedules = async () => {
  loading.value = true;
  try {
    const data = await searchMaintenanceRecords({
      query: searchQuery.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      // 可以添加过滤条件来区分计划和记录
    });
    schedules.value = data.maintenanceRecords || [];
    pagination.value.total = data.totalCount || 0;
  } catch (error) {
    ElMessage.error('获取维护计划失败');
    console.error('获取维护计划失败:', error);
  } finally {
    loading.value = false;
  }
};

const openAddDialog = () => {
  isEditing.value = false;
  form.value = {
    rideId: null,
    teamId: null,
    managerId: null,
    maintenanceType: null,
    startTime: '',
    cost: 0,
    maintenanceDetails: '',
    isCompleted: false
  };
  isDialogVisible.value = true;
};

const editSchedule = (schedule) => {
  isEditing.value = true;
  form.value = { ...schedule };
  isDialogVisible.value = true;
};

const saveSchedule = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    if (isEditing.value) {
      await updateMaintenanceRecord(form.value.maintenanceId, form.value);
      ElMessage.success('更新维护计划成功');
    } else {
      await createMaintenanceRecord(form.value);
      ElMessage.success('新增维护计划成功');
    }
    
    isDialogVisible.value = false;
    fetchSchedules();
  } catch (error) {
    ElMessage.error(isEditing.value ? '更新维护计划失败' : '新增维护计划失败');
    console.error('保存维护计划失败:', error);
  }
};

const executeSchedule = (schedule) => {
  currentSchedule.value = schedule;
  executeForm.value = {
    startTime: new Date().toISOString(),
    endTime: '',
    cost: schedule.cost,
    partsReplaced: '',
    maintenanceDetails: schedule.maintenanceDetails || ''
  };
  isExecuteDialogVisible.value = true;
};

const confirmExecute = async () => {
  try {
    const updateData = {
      ...currentSchedule.value,
      ...executeForm.value,
      isCompleted: true
    };
    
    await updateMaintenanceRecord(currentSchedule.value.maintenanceId, updateData);
    ElMessage.success('维护计划执行成功');
    isExecuteDialogVisible.value = false;
    fetchSchedules();
  } catch (error) {
    ElMessage.error('执行维护计划失败');
    console.error('执行维护计划失败:', error);
  }
};

const deleteSchedule = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个维护计划吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await deleteMaintenanceRecord(id);
    ElMessage.success('删除维护计划成功');
    fetchSchedules();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除维护计划失败');
      console.error('删除维护计划失败:', error);
    }
  }
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-';
  return new Date(dateTime).toLocaleString('zh-CN');
};

const getMaintenanceTypeName = (type) => {
  const types = {
    1: '日常维护',
    2: '紧急维修',
    3: '定期检查',
    4: '大修'
  };
  return types[type] || '未知';
};

onMounted(() => {
  fetchSchedules();
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
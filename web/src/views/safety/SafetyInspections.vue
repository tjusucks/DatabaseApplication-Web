<template>
  <div class="safety-inspections">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>安全检查记录</span>
          <div class="search-controls">
            <el-input
              v-model="searchParams.keyword"
              placeholder="搜索检查记录"
              clearable
              @input="handleSearch"
              style="width: 200px; margin-right: 10px"
            />
            <el-select
              v-model="searchParams.isPassed"
              placeholder="检查结果"
              clearable
              @change="handleSearch"
              style="width: 120px; margin-right: 10px"
            >
              <el-option label="通过" :value="true" />
              <el-option label="未通过" :value="false" />
            </el-select>
            <el-button type="primary" @click="openAddDialog">新增检查记录</el-button>
          </div>
        </div>
      </template>

      <el-table :data="inspections" :loading="loading" @row-click="editInspection">
        <el-table-column prop="inspectionId" label="检查ID" width="80" />
        <el-table-column label="设施信息" width="150">
          <template #default="{ row }">
            <div>
              <div style="font-weight: bold">{{ row.rideName }}</div>
              <div style="font-size: 12px; color: #666">ID: {{ row.rideId }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="检查团队" width="150">
          <template #default="{ row }">
            <div>
              <div style="font-weight: bold">{{ row.teamName }}</div>
              <div style="font-size: 12px; color: #666">ID: {{ row.teamId }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="checkDate" label="检查日期" width="180">
          <template #default="{ row }">
            {{ formatDate(row.checkDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="checkType" label="检查类型" width="100">
          <template #default="{ row }">
            {{ getCheckTypeName(row.checkType) }}
          </template>
        </el-table-column>
        <el-table-column prop="isPassed" label="检查结果" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isPassed ? 'success' : 'danger'">
              {{ row.isPassed ? '通过' : '未通过' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="issuesFound" label="发现问题" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click.stop="editInspection(row)">编辑</el-button>
            <el-button size="small" type="danger" @click.stop="confirmDelete(row.inspectionId)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="fetchInspections"
        @size-change="fetchInspections"
        style="margin-top: 20px; justify-content: center"
      />
    </el-card>

    <el-dialog
      v-model="isDialogVisible"
      :title="isEditing ? '编辑检查记录' : '新增检查记录'"
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <!-- 游乐设施 -->
        <el-form-item label="游乐设施ID" prop="rideId">
          <el-input v-model="form.rideId" placeholder="请输入游乐设施ID" />
        </el-form-item>

        <el-form-item label="游乐设施名称">
          <el-input v-model="form.rideName" placeholder="请输入游乐设施名称（可选）" />
        </el-form-item>

        <!-- 检查团队 -->
        <el-form-item label="检查团队ID" prop="teamId">
          <el-input v-model="form.teamId" placeholder="请输入检查团队ID" />
        </el-form-item>

        <el-form-item label="检查团队名称">
          <el-input v-model="form.teamName" placeholder="请输入检查团队名称（可选）" />
        </el-form-item>

        <!-- 检查日期 -->
        <el-form-item label="检查日期" prop="checkDate">
          <el-date-picker
            v-model="form.checkDate"
            type="datetime"
            placeholder="选择检查日期"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 检查类型 -->
        <el-form-item label="检查类型" prop="checkType">
          <el-select v-model="form.checkType" placeholder="请选择检查类型" style="width: 100%">
            <el-option label="日常检查" :value="1" />
            <el-option label="定期检查" :value="2" />
            <el-option label="专项检查" :value="3" />
            <el-option label="年度检查" :value="4" />
          </el-select>
        </el-form-item>

        <!-- 检查结果 -->
        <el-form-item label="检查结果" prop="isPassed">
          <el-radio-group v-model="form.isPassed">
            <el-radio :label="true">通过</el-radio>
            <el-radio :label="false">未通过</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 发现问题 -->
        <el-form-item label="发现问题">
          <el-input
            v-model="form.issuesFound"
            type="textarea"
            :rows="3"
            placeholder="请描述发现的问题（可选）"
          />
        </el-form-item>

        <!-- 建议措施 -->
        <el-form-item label="建议措施">
          <el-input
            v-model="form.recommendations"
            type="textarea"
            :rows="3"
            placeholder="请填写改进建议（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="cancelDialog">取消</el-button>
        <el-button type="primary" @click="saveInspection" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  searchInspectionRecords,
  createInspectionRecord,
  updateInspectionRecord,
  deleteInspectionRecord,
} from '@/api/safety'

// 响应式数据
const inspections = ref([])
const loading = ref(false)
const saving = ref(false)
const isDialogVisible = ref(false)
const isEditing = ref(false)
const formRef = ref(null)

// 搜索参数
const searchParams = reactive({
  keyword: '',
  rideId: null,
  teamId: null,
  checkType: null,
  isPassed: null,
  checkDateFrom: null,
  checkDateTo: null,
})

// 分页参数
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
})

// 表单数据
const form = reactive({
  inspectionId: null,
  rideId: null,
  rideName: null,
  teamId: null,
  teamName: null,
  checkDate: null,
  checkType: null,
  isPassed: true,
  issuesFound: null,
  recommendations: null,
})

// 表单验证规则
const formRules = {
  rideId: [{ required: true, message: '请输入游乐设施ID', trigger: 'blur' }],
  teamId: [{ required: true, message: '请输入检查团队ID', trigger: 'blur' }],
  checkDate: [{ required: true, message: '请选择检查日期', trigger: 'change' }],
  checkType: [{ required: true, message: '请选择检查类型', trigger: 'change' }],
  isPassed: [{ required: true, message: '请选择检查结果', trigger: 'change' }],
}

// 方法
const fetchInspections = async () => {
  loading.value = true
  try {
    const params = {
      ...searchParams,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }

    // 清除空值
    Object.keys(params).forEach((key) => {
      if (params[key] === null || params[key] === '') {
        delete params[key]
      }
    })

    const data = await searchInspectionRecords(params)
    inspections.value = data.inspectionRecords || []
    pagination.total = data.totalCount || 0
    pagination.totalPages = data.totalPages || 0
  } catch (error) {
    ElMessage.error('获取检查记录失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1 // 搜索时重置到第一页
  fetchInspections()
}

const openAddDialog = () => {
  isEditing.value = false
  resetForm()
  isDialogVisible.value = true
}

const editInspection = (inspection) => {
  isEditing.value = true
  Object.assign(form, {
    inspectionId: inspection.inspectionId,
    rideId: inspection.rideId,
    teamId: inspection.teamId,
    checkDate: new Date(inspection.checkDate),
    checkType: inspection.checkType,
    isPassed: inspection.isPassed,
    issuesFound: inspection.issuesFound,
    recommendations: inspection.recommendations,
  })
  isDialogVisible.value = true
}

const saveInspection = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    saving.value = true

    const submitData = {
      ...form,
      rideId: parseInt(form.rideId),
      teamId: parseInt(form.teamId),
      checkType: parseInt(form.checkType),
      checkDate: form.checkDate ? form.checkDate.toISOString() : new Date().toISOString(),
      issuesFound: form.issuesFound || null,
      recommendations: form.recommendations || null,
    }

    if (isEditing.value) {
      await updateInspectionRecord(form.inspectionId, submitData)
      ElMessage.success('检查记录更新成功')
    } else {
      // 创建时不需要inspectionId
      const { inspectionId, rideName, teamName, ...createData } = submitData
      await createInspectionRecord(createData)
      ElMessage.success('检查记录创建成功')
    }

    isDialogVisible.value = false
    fetchInspections()
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message)
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (inspectionId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条检查记录吗？', '确认删除', {
      type: 'warning',
    })

    await deleteInspectionRecord(inspectionId)
    ElMessage.success('删除成功')
    fetchInspections()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + error.message)
    }
  }
}

const cancelDialog = () => {
  isDialogVisible.value = false
  resetForm()
}

const resetForm = () => {
  Object.assign(form, {
    inspectionId: null,
    rideId: '',
    teamId: '',
    checkDate: new Date(),
    checkType: '',
    isPassed: true,
    issuesFound: '',
    recommendations: '',
  })
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

const getCheckTypeName = (checkType) => {
  const types = {
    1: '日常检查',
    2: '定期检查',
    3: '专项检查',
    4: '年度检查',
  }
  return types[checkType] || '未知类型'
}

// 生命周期
onMounted(() => {
  fetchInspections()
})
</script>

<style scoped>
.safety-inspections {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.search-controls {
  display: flex;
  align-items: center;
}

:deep(.el-pagination) {
  display: flex;
  justify-content: center;
}
</style>

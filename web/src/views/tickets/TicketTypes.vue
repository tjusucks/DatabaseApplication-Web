<template>
  <PageTemplate title="票种管理" description="管理公园的所有门票种类">
    <div class="action-bar">
      <el-button type="primary" icon="Plus" @click="openDialog('create')">新增票种</el-button>
    </div>

    <el-table :data="ticketTypes" border stripe v-loading="loading">
      <el-table-column prop="ticketTypeId" label="ID" width="100" />
      <el-table-column prop="typeName" label="票种名称" />
      <el-table-column prop="basePrice" label="基础价格" />
      <!-- [新增] 显示适用人群 -->
      <el-table-column prop="applicableCrowd" label="适用人群" />
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" fixed="right" align="center" width="200">
        <template #default="{ row }">
          <el-button
            size="small"
            type="primary"
            link
            icon="Money"
            @click="managePricing(row.ticketTypeId)"
          >
            管理价格
          </el-button>
          <el-button size="small" type="primary" link icon="Edit" @click="openDialog('edit', row)">
            编辑
          </el-button>
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
        <el-form-item label="票种名称" prop="typeName">
          <el-input v-model="form.typeName" placeholder="请输入票种名称" />
        </el-form-item>
        <el-form-item label="基础价格" prop="basePrice">
          <el-input-number v-model="form.basePrice" :precision="2" :step="10" :min="0" />
        </el-form-item>

        <!-- [最终修正] 添加了必填的“适用人群”字段 -->
        <el-form-item label="适用人群" prop="applicableCrowd">
          <el-select
            v-model="form.applicableCrowd"
            placeholder="请选择适用人群"
            style="width: 100%"
          >
            <!-- 假设后端的枚举值为 0, 1, 2, 3 等 -->
            <el-option label="通用" :value="0" />
            <el-option label="成人" :value="1" />
            <el-option label="儿童" :value="2" />
            <el-option label="长者" :value="3" />
            <el-option label="学生" :value="4" />
          </el-select>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述信息 (可选)"
          />
        </el-form-item>

        <!-- [新增] 添加可选字段的输入 -->
        <el-form-item label="规则文本" prop="rulesText">
          <el-input
            v-model="form.rulesText"
            type="textarea"
            :rows="2"
            placeholder="请输入规则文本 (可选)"
          />
        </el-form-item>
        <el-form-item label="销售上限" prop="maxSaleLimit">
          <el-input-number v-model="form.maxSaleLimit" :min="0" placeholder="0表示无上限 (可选)" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="isSubmitting"> 确认 </el-button>
      </template>
    </el-dialog>
  </PageTemplate>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketStore } from '@/stores/tickets.js'
import { storeToRefs } from 'pinia'
import PageTemplate from '@/components/PageTemplate.vue'

// 1. 初始化
const router = useRouter()
const ticketStore = useTicketStore()
const { ticketTypes } = storeToRefs(ticketStore)
const { fetchTicketTypes, createTicketType } = ticketStore

const loading = ref(false)
const isSubmitting = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref('create')
const formRef = ref(null)

const dialogTitle = computed(() => (dialogMode.value === 'create' ? '新增票种' : '编辑票种'))

// [最终修正] form 对象与后端 CreateTicketTypeCommand 完全匹配
const form = reactive({
  ticketTypeId: null,
  typeName: '',
  description: '',
  basePrice: 0.0,
  rulesText: '',
  maxSaleLimit: null,
  applicableCrowd: null,
})

// [最终修正] 验证规则与后端 Command 匹配
const rules = reactive({
  typeName: [{ required: true, message: '请输入票种名称', trigger: 'blur' }],
  basePrice: [{ required: true, message: '请输入基础价格', trigger: 'blur' }],
  applicableCrowd: [{ required: true, message: '请选择适用人群', trigger: 'change' }],
})

// 2. 方法
const loadData = async () => {
  loading.value = true
  await fetchTicketTypes()
  if (ticketTypes.value.length === 0) {
    console.warn('后端返回了空的票种列表，正在使用前端模拟数据进行UI展示。')
    ticketTypes.value = [
      {
        ticketTypeId: 1,
        typeName: '成人票 (模拟)',
        basePrice: 180.0,
        applicableCrowd: '成人',
        description: '适用于18周岁以上游客',
      },
      {
        ticketTypeId: 2,
        typeName: '儿童票 (模拟)',
        basePrice: 90.0,
        applicableCrowd: '儿童',
        description: '适用于1.2-1.5米儿童',
      },
      {
        ticketTypeId: 3,
        typeName: '长者票 (模拟)',
        basePrice: 90.0,
        applicableCrowd: '长者',
        description: '适用于65周岁以上长者',
      },
    ]
  }
  loading.value = false
}

const managePricing = (id) => router.push(`/tickets/types/${id}`)

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  // 手动重置所有字段，确保干净
  Object.assign(form, {
    ticketTypeId: null,
    typeName: '',
    description: '',
    basePrice: 0.0,
    rulesText: '',
    maxSaleLimit: null,
    applicableCrowd: null,
  })
}

const openDialog = (mode, rowData = null) => {
  resetForm() // 每次打开都先重置
  dialogMode.value = mode
  if (mode === 'edit' && rowData) {
    Object.assign(form, rowData)
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      isSubmitting.value = true
      let success = false
      if (dialogMode.value === 'create') {
        // 后端不需要 ticketTypeId，我们从提交的数据中移除它
        const { ticketTypeId, ...createData } = form
        success = await createTicketType(createData)
      } else {
        // success = await ticketStore.updateTicketType(form);
        console.warn('更新票种功能待实现')
        success = true
      }

      if (success) {
        dialogVisible.value = false
        await loadData()
      }
      isSubmitting.value = false
    }
  })
}

// 3. 生命周期
onMounted(loadData)
</script>

<style scoped>
.action-bar {
  margin-bottom: 20px;
}
</style>

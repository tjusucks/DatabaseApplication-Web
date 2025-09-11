<template>
  <PageTemplate title="创建新活动" description="填写活动详细信息以创建一个新的促销活动" icon="CirclePlus">
    <el-card shadow="never" class="form-card">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" label-position="right">
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入活动名称" clearable />
        </el-form-item>

        <el-form-item label="活动类型" prop="promotionType">
          <el-select v-model="form.promotionType" placeholder="请选择活动类型" style="width: 100%">
            <el-option label="折扣" value="Discount" />
            <el-option label="满减" value="Threshold" />
            <el-option label="套餐" value="Package" />
          </el-select>
        </el-form-item>

        <el-form-item label="活动时间" prop="dateRange">
          <el-date-picker v-model="form.dateRange" type="datetimerange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="活动描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入活动描述信息" />
        </el-form-item>
        <el-form-item label="是否激活" prop="isActive">
          <el-switch v-model="form.isActive" />
        </el-form-item>
        <el-form-item class="form-footer">
          <el-button @click="onCancel">取消</el-button>
          <el-button type="primary" @click="onSubmit" :loading="isSubmitting">
            立即创建
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </PageTemplate>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePromotionStore } from '@/stores/tickets.js'
import { useUserStore } from '@/stores/user.js' // [最终修正] 导入 userStore
import PageTemplate from '@/components/PageTemplate.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const promotionStore = usePromotionStore()
const userStore = useUserStore() // [最终修正] 初始化 userStore
const { createPromotion } = promotionStore

const formRef = ref(null)
const isSubmitting = ref(false)

const form = reactive({
  promotionName: '',
  promotionType: null,
  description: '',
  dateRange: [],
  startDatetime: '',
  endDatetime: '',
  isActive: true,
});

const rules = reactive({
  promotionName: [
    { required: true, message: "请输入活动名称", trigger: "blur" },
  ],
  promotionType: [
    { required: true, message: "请选择活动类型", trigger: "change" },
  ],
  dateRange: [{ required: true, message: "请选择活动时间", trigger: "change" }],
});

const onSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      isSubmitting.value = true
      const [start, end] = form.dateRange

      // [最终修正] 从 userStore 获取当前用户ID，并添加到 payload 中
      const payload = {
        promotionName: form.promotionName,
        promotionType: form.promotionType,
        description: form.description,
        startDatetime: start,
        endDatetime: end,
        isActive: form.isActive,
        employeeId: userStore.userInfo.id, // <-- 关键改动
      }

      const success = await createPromotion(payload)
      if (success) {
        router.push('/promotions/list')
      }
      isSubmitting.value = false
    } else {
      ElMessage.error('请检查表单输入项')
    }
  })
}

const onCancel = () => router.back()
</script>

<style scoped>
.form-card {
  max-width: 800px;
  margin: 0 auto;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
}
</style>

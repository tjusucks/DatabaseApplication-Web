<template>
  <PageTemplate title="创建活动" description="填写活动信息以创建一个新的促销活动" icon="CirclePlus">
    <el-form :model="form" label-width="120px" style="max-width: 600px">
      <el-form-item label="活动名称">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="活动类型">
        <el-select v-model="form.type" placeholder="请选择活动类型">
          <el-option label="折扣" value="discount" />
          <el-option label="套餐优惠" value="package" />
          <el-option label="限时特价" value="special" />
        </el-select>
      </el-form-item>
      <el-form-item label="活动时间">
        <el-date-picker
          v-model="form.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item label="活动描述">
        <el-input v-model="form.description" type="textarea" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">立即创建</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </PageTemplate>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import PageTemplate from '@/components/PageTemplate.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const form = reactive({ name: '', type: '', dateRange: '', description: '' })

const onSubmit = () => {
  ElMessage.success('创建成功!')
  router.push('/promotions/list')
}

const onCancel = () => router.back()
</script>

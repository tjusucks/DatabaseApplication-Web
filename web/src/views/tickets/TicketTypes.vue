<template>
  <PageTemplate title="票种管理" description="管理公园的所有门票种类">
    <el-button type="primary" icon="Plus" @click="dialogVisible = true" style="margin-bottom: 20px"
      >新增票种</el-button
    >
    <el-table :data="ticketTypes" border>
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column prop="name" label="票种名称" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作">
        <template #default>
          <el-button size="small">编辑</el-button>
          <el-button size="small" type="danger">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" title="新增票种">
      <el-form label-width="100px">
        <el-form-item label="票种名称"><el-input /></el-form-item>
        <el-form-item label="描述"><el-input type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确认</el-button>
      </template>
    </el-dialog>
  </PageTemplate>
</template>

<script setup>
import { ref } from 'vue'
import PageTemplate from '@/components/PageTemplate.vue'
const dialogVisible = ref(false)
const ticketTypes = ref([
  { id: 1, name: '成人票', description: '适用于18周岁以上成人' },
  { id: 2, name: '儿童票', description: '适用于1.2米-1.5米儿童' },
])
</script>

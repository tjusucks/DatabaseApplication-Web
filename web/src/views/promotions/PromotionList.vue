<template>
  <PageTemplate
    title="优惠活动"
    description="管理所有营销和促销活动"
    icon="Present"
  >
    <div style="margin-bottom: 20px;">
      <el-button type="primary" icon="Plus" @click="handleCreate">创建新活动</el-button>
    </div>
    <el-table :data="promotions" border style="width: 100%">
      <el-table-column prop="name" label="活动名称" />
      <el-table-column prop="type" label="活动类型" />
      <el-table-column prop="startTime" label="开始时间" />
      <el-table-column prop="endTime" label="结束时间" />
      <el-table-column label="状态">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'info'">{{ row.isActive ? '进行中' : '已结束' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default>
          <el-button size="small">编辑</el-button>
          <el-button size="small" type="danger">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </PageTemplate>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import PageTemplate from '@/components/PageTemplate.vue';

const router = useRouter();
const promotions = ref([
  { id: 1, name: '暑期家庭套餐', type: '套餐优惠', startTime: '2024-07-01', endTime: '2024-08-31', isActive: true },
  { id: 2, name: '周末全票8折', type: '折扣', startTime: '2024-05-01', endTime: '2024-09-30', isActive: true },
  { id: 3, name: '春季踏青活动', type: '限时特价', startTime: '2024-03-15', endTime: '2024-04-15', isActive: false },
]);
const handleCreate = () => router.push('/promotions/create');
</script>

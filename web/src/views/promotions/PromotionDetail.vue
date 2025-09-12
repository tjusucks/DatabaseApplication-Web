<template>
  <PageTemplate
    :title="`活动详情 - ${promotion?.promotionName || ''}`"
    description="管理促销活动的基本信息、触发条件和优惠动作"
  >
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="基本信息" name="info">
        <el-card v-loading="loading" shadow="never">
          <el-descriptions :column="2" border v-if="promotion">
            <el-descriptions-item label="活动ID">{{ promotion.promotionId }}</el-descriptions-item>
            <el-descriptions-item label="活动名称">{{
              promotion.promotionName
            }}</el-descriptions-item>
            <el-descriptions-item label="活动类型">
              <el-tag>{{ promotion.promotionType }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="promotion.isActive ? 'success' : 'info'">
                {{ promotion.isActive ? '进行中' : '已结束' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="开始时间">{{
              promotion.startDatetime
            }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{
              promotion.endDatetime
            }}</el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">{{
              promotion.description
            }}</el-descriptions-item>
          </el-descriptions>
          <el-skeleton v-else :rows="5" animated />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="触发条件" name="conditions">
        <el-button type="primary" icon="Plus" style="margin-bottom: 20px">新增条件</el-button>
        <el-table :data="conditions" border v-loading="loading">
          <el-table-column prop="conditionId" label="ID" width="80" />
          <el-table-column prop="description" label="条件描述" />
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="优惠动作" name="actions">
        <el-button type="primary" icon="Plus" style="margin-bottom: 20px">新增动作</el-button>
        <el-table :data="actions" border v-loading="loading">
          <el-table-column prop="actionId" label="ID" width="80" />
          <el-table-column prop="description" label="动作描述" />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </PageTemplate>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePromotionStore } from '@/stores/tickets.js'
import PageTemplate from '@/components/PageTemplate.vue'
import { ElMessage } from 'element-plus'

// 假设 store 和 api 已更新，添加了获取详情/条件/动作的方法
const route = useRoute()
const promotionId = route.params.id
const promotionStore = usePromotionStore()

const loading = ref(false)
const activeTab = ref('info')

const promotion = ref(null)
const conditions = ref([])
const actions = ref([])

onMounted(async () => {
  loading.value = true
  try {
    // 假设 API 返回 promotion 详情
    // const promotionRes = await promotionStore.fetchPromotionById(promotionId);
    // promotion.value = promotionRes.data;

    // 模拟数据
    promotion.value = {
      promotionId: promotionId,
      promotionName: '暑期家庭套餐',
      promotionType: 'Package',
      description: '购买2张成人票+1张儿童票即可享受优惠',
      startDatetime: '2024-07-01 00:00:00',
      endDatetime: '2024-08-31 23:59:59',
      isActive: true,
    }
    conditions.value = [{ conditionId: 1, description: '购买2张成人票+1张儿童票' }]
    actions.value = [{ actionId: 1, description: '总价优惠50元' }]
  } catch (e) {
    ElMessage.error('加载活动详情失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.el-tabs--border-card {
  border: none;
  box-shadow: none;
}
</style>

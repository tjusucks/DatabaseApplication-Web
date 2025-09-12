<template>
  <PageTemplate title="优惠活动" description="管理所有营销和促销活动" icon="Present">
    <div class="action-bar">
      <el-button type="primary" icon="Plus" @click="handleCreate"> 创建新活动 </el-button>
    </div>
    <el-table :data="promotions.list" v-loading="loading" border stripe style="width: 100%">
      <el-table-column prop="promotionName" label="活动名称" min-width="180" />
      <el-table-column prop="promotionType" label="活动类型" width="120">
        <template #default="{ row }">
          <el-tag>{{ row.promotionType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startDatetime" label="开始时间" width="180" />
      <el-table-column prop="endDatetime" label="结束时间" width="180" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'info'">
            {{ row.isActive ? '进行中' : '已结束' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
            size="small"
            type="primary"
            link
            icon="View"
            @click="managePromotion(row.promotionId)"
          >
            详情
          </el-button>
          <el-button size="small" type="primary" link icon="Edit"> 编辑 </el-button>
          <el-button size="small" type="danger" link icon="Delete"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="promotions.total"
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.size"
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>
  </PageTemplate>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { usePromotionStore } from '@/stores/tickets.js'
import PageTemplate from '@/components/PageTemplate.vue'

const router = useRouter()
const promotionStore = usePromotionStore()
const { promotions } = storeToRefs(promotionStore)
const { fetchPromotions } = promotionStore
const loading = ref(false)

const queryParams = reactive({ page: 1, size: 10 })

const loadData = async () => {
  loading.value = true
  await fetchPromotions(queryParams)
  loading.value = false
}

const handleCreate = () => router.push('/promotions/create')
const managePromotion = (id) => {
  router.push(`/promotions/detail/${id}`)
}

onMounted(loadData)
</script>

<style scoped>
.action-bar {
  margin-bottom: 20px;
}
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>

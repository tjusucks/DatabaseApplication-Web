<template>
  <PageTemplate :title="`报表详情 - ${reportId}`" description="查看单个财务报表的详细信息" icon="Document">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
    <div v-else-if="reportData">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="报表ID">{{ reportData.id }}</el-descriptions-item>
        <el-descriptions-item label="生成日期">{{ reportData.generatedDate }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ reportData.type }}</el-descriptions-item>
        <el-descriptions-item label="期间">{{ reportData.period }}</el-descriptions-item>
      </el-descriptions>
      
      <el-card class="box-card" style="margin-top: 20px;">
        <template #header>
          <div class="clearfix">
            <span>报表内容</span>
          </div>
        </template>
        <!-- 在这里展示报表的具体内容，例如一个表格或者图表 -->
        <pre>{{ reportData.content }}</pre>
      </el-card>
    </div>
    <div v-else>
      <el-empty description="无法加载报表数据"></el-empty>
    </div>
  </PageTemplate>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PageTemplate from '@/components/PageTemplate.vue'
// 假设有一个API可以获取报表详情
// import { getReportDetail } from '@/api/finance'

const route = useRoute()
const reportId = ref(route.params.id)
const reportData = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    // const response = await getReportDetail(reportId.value)
    // reportData.value = response.data
    
    // 模拟数据
    reportData.value = {
      id: reportId.value,
      generatedDate: new Date().toLocaleDateString(),
      type: '月度总结',
      period: '2023-10',
      content: '这里是报表的详细内容...\n总收入: 50000元\n总支出: 30000元\n净利润: 20000元'
    }
  } catch (error) {
    console.error('获取报表详情失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.loading-container {
  padding: 20px;
}
</style>

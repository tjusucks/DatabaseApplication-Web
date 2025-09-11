<template>
  <div class="performance-reports">
    <el-page-header title="返回" @back="goBack">
      <template #content>
        <div class="page-header-content">
          <el-icon class="header-icon"><Document /></el-icon>
          <span class="page-title">绩效报表</span>
          <span class="page-description">生成员工绩效分析报表</span>
        </div>
      </template>
    </el-page-header>

    <div class="content-wrapper">
      <el-row :gutter="20" class="mb-4">
        <el-col :span="24">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>绩效概览</span>
              </div>
            </template>
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="statistic-card">
                  <el-statistic :value="statistics.totalReviews">
                    <template #title>
                      <div style="display: inline-flex; align-items: center">
                        总绩效记录
                      </div>
                    </template>
                  </el-statistic>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="statistic-card">
                  <el-statistic :value="statistics.averageScore" :precision="2">
                    <template #title>
                      <div style="display: inline-flex; align-items: center">
                        平均分
                      </div>
                    </template>
                  </el-statistic>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="statistic-card">
                  <el-statistic :value="statistics.excellentReviews">
                    <template #title>
                      <div style="display: inline-flex; align-items: center">
                        优秀绩效
                      </div>
                    </template>
                  </el-statistic>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="statistic-card">
                  <el-statistic :value="statistics.poorReviews">
                    <template #title>
                      <div style="display: inline-flex; align-items: center">
                        不合格绩效
                      </div>
                    </template>
                  </el-statistic>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="mb-4">
        <el-col :span="16">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>最新绩效记录</span>
              </div>
            </template>
            <el-table :data="latestReviews" style="width: 100%" stripe v-loading="loading">
              <el-table-column prop="reviewId" label="评估ID" width="80" />
              <el-table-column prop="employee.staffNumber" label="员工编号" width="120" />
              <el-table-column prop="employee.position" label="职位" width="150" />
              <el-table-column prop="employee.departmentName" label="部门" width="150" />
              <el-table-column prop="period" label="考核周期" width="120" />
              <el-table-column prop="score" label="得分" width="80">
                <template #default="scope">
                  <el-tag :type="getScoreTagType(scope.row.score)">
                    {{ scope.row.score }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="evaluationLevel" label="评级" width="100">
                <template #default="scope">
                  <el-tag :type="getLevelTagType(scope.row.evaluationLevel)">
                    {{ scope.row.evaluationLevel }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="创建时间" width="180">
                <template #default="scope">
                  {{ formatDate(scope.row.createdAt) }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>最近不合格绩效</span>
              </div>
            </template>
            <el-table :data="poorReviews" style="width: 100%" stripe v-loading="loading">
              <el-table-column prop="reviewId" label="评估ID" width="80" />
              <el-table-column prop="employee.staffNumber" label="员工编号" width="100" />
              <el-table-column prop="employee.position" label="职位" width="120" />
              <el-table-column prop="employee.departmentName" label="部门" width="120" />
              <el-table-column prop="period" label="考核周期" width="100" />
              <el-table-column prop="score" label="得分" width="80">
                <template #default="scope">
                  <el-tag type="danger">
                    {{ scope.row.score }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="创建时间" width="160">
                <template #default="scope">
                  {{ formatDate(scope.row.createdAt) }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>绩效评级分布</span>
              </div>
            </template>
            <div class="chart-container">
              <el-table :data="levelDistribution" style="width: 100%" v-loading="loading">
                <el-table-column prop="level" label="评级">
                  <template #default="scope">
                    <el-tag :type="getLevelTagType(scope.row.level)">
                      {{ scope.row.level }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="count" label="数量" />
                <el-table-column label="占比">
                  <template #default="scope">
                    <el-progress 
                      :percentage="scope.row.percentage" 
                      :status="getProgressStatus(scope.row.level)"
                      :show-text="true"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Document } from '@element-plus/icons-vue'
import { getEmployeeReviews } from '@/api/hr'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 数据
const latestReviews = ref([])
const poorReviews = ref([])
const levelDistribution = ref([])
const statistics = ref({
  totalReviews: 0,
  averageScore: 0,
  excellentReviews: 0,
  poorReviews: 0
})

const loading = ref(false)

// 返回上一页
const goBack = () => {
  router.back()
}

// 格式化日期
const formatDate = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 根据得分获取标签类型
const getScoreTagType = (score) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 70) return 'warning'
  return 'danger'
}

// 根据评级获取标签类型
const getLevelTagType = (level) => {
  switch (level) {
    case '优秀': return 'success'
    case '良好': return 'primary'
    case '合格': return 'warning'
    case '不合格': return 'danger'
    default: return 'info'
  }
}

// 根据评级获取进度条状态
const getProgressStatus = (level) => {
  switch (level) {
    case '优秀': return 'success'
    case '良好': return 'primary'
    case '合格': return 'warning'
    case '不合格': return 'exception'
    default: return 'info'
  }
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 获取所有绩效记录
    const response = await getEmployeeReviews({})
    
    // 处理响应数据，兼容不同的响应格式
    let reviews = []
    if (response && response.data) {
      if (Array.isArray(response.data)) {
        // 如果data是数组，直接使用
        reviews = response.data
      } else if (response.data.items) {
        // 如果data包含items属性，使用items
        reviews = response.data.items
      } else {
        // 其他情况，直接使用data
        reviews = [response.data]
      }
    } else if (Array.isArray(response)) {
      // 如果响应本身就是数组
      reviews = response
    } else {
      // 默认空数组
      reviews = []
    }
    
    // 按创建时间排序，获取最新10条记录
    latestReviews.value = [...reviews]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
    
    // 获取不合格绩效记录（分数低于70或评级为不合格）
    poorReviews.value = [...reviews]
      .filter(review => review.score < 70 || review.evaluationLevel === '不合格')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
    
    // 统计数据
    statistics.value.totalReviews = reviews.length
    statistics.value.averageScore = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length 
      : 0
    
    statistics.value.excellentReviews = reviews.filter(review => review.score >= 90).length
    statistics.value.poorReviews = poorReviews.value.length
    
    // 计算评级分布
    calculateLevelDistribution(reviews)
  } catch (error) {
    console.error('加载绩效数据失败:', error)
    ElMessage.error('加载绩效数据失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 计算评级分布
const calculateLevelDistribution = (reviews) => {
  // 统计各评级的数量
  const levelCount = {}
  reviews.forEach(review => {
    const level = review.evaluationLevel || '未评级'
    levelCount[level] = (levelCount[level] || 0) + 1
  })
  
  // 转换为数组并计算百分比
  const total = reviews.length
  levelDistribution.value = Object.keys(levelCount).map(level => ({
    level: level,
    count: levelCount[level],
    percentage: total > 0 ? Math.round((levelCount[level] / total) * 100) : 0
  }))
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.performance-reports {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.page-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 24px;
  color: #409eff;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-right: 12px;
}

.page-description {
  color: #606266;
  font-size: 14px;
}

.content-wrapper {
  margin-top: 20px;
}

.mb-4 {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistic-card {
  text-align: center;
  padding: 20px 0;
}

.chart-container {
  padding: 20px 0;
}
</style>
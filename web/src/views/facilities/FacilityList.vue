<template>
  <div class="facility-list">
    <!-- 添加页面头部装饰区域 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">游乐设施管理</h1>
        <p class="page-subtitle">欢乐世界，安全第一</p>
      </div>
      <div class="header-images">
        <div class="floating-image" style="animation-delay: 0s">
          <img src="@/images/facilities/ferris-wheel.png" alt="摩天轮" />
        </div>
        <div class="floating-image" style="animation-delay: -2s">
          <img src="@/images/facilities/roller-coaster.png" alt="过山车" />
        </div>
        <div class="floating-image" style="animation-delay: -4s">
          <img src="@/images/facilities/carousel.png" alt="旋转木马" />
        </div>
      </div>
    </div>

    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="card-title">设施列表</span>
            <!-- 添加小装饰图标 -->
            <div class="title-decoration">
              <img src="@/images/facilities/ticket-icon.png" alt="票" class="small-icon" />
            </div>
          </div>
          <el-input 
            v-model="searchQuery.keyword" 
            placeholder="搜索设施" 
            clearable 
            @input="fetchFacilities"
            class="search-input"
          />
        </div>
      </template>

      <el-table :data="facilities" :loading="loading" @row-click="viewFacilityDetail">
        <el-table-column prop="id" label="设施ID" width="100" />
        <el-table-column prop="name" label="设施名称" />
        <el-table-column prop="status" label="状态" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" @click.stop="viewFacilityDetail(row)">查看详情</el-button>
            <el-button size="small" type="primary" @click.stop="editFacility(row)">更改</el-button>
            <el-button size="small" type="danger" @click.stop="deleteFacility(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="fetchFacilities"
      />

      <div class="action-section">
        <el-button type="primary" @click="openAddFacilityDialog" class="add-button">
          <span>新增设施</span>
          <!-- <img src="@/images/facilities/plus-icon.png" alt="+" class="button-icon" /> -->
        </el-button>
        
        <!-- 添加装饰性的小设施图片 -->
        <div class="action-decorations">
          <img src="@/images/facilities/bumper-car.png" alt="碰碰车" class="decoration-small" />
          <img src="@/images/facilities/pirate-ship.png" alt="海盗船" class="decoration-small" />
        </div>
      </div>

      <el-dialog title="新增设施" v-model="isAddDialogVisible">
        <el-form :model="newFacility" ref="addFacilityForm">
          <el-form-item label="设施名称" prop="name" :rules="[{ required: true, message: '请输入设施名称', trigger: 'blur' }]">
            <el-input v-model="newFacility.name" />
          </el-form-item>
          <el-form-item label="状态" prop="status" :rules="[{ required: true, message: '请选择状态', trigger: 'change' }]">
            <el-select v-model="newFacility.status" placeholder="请选择状态">
              <el-option label="启用" value="enabled" />
              <el-option label="禁用" value="disabled" />
            </el-select>
          </el-form-item>
          <el-form-item label="位置" prop="location" :rules="[{ required: true, message: '请输入位置', trigger: 'blur' }]">
            <el-input v-model="newFacility.location" />
          </el-form-item>
          <el-form-item label="容量" prop="capacity" :rules="[{ required: true, message: '请输入容量', trigger: 'blur' }]">
            <el-input-number v-model="newFacility.capacity" />
          </el-form-item>
          <el-form-item label="运行时长 (分钟)" prop="duration" :rules="[{ required: true, message: '请输入运行时长', trigger: 'blur' }]">
            <el-input-number v-model="newFacility.duration" />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input type="textarea" v-model="newFacility.description" />
          </el-form-item>
          <el-form-item label="开放日期" prop="openDate">
            <el-date-picker v-model="newFacility.openDate" type="date" />
          </el-form-item>
          <el-form-item label="负责人" prop="managerId">
            <el-input v-model="newFacility.managerId" />
          </el-form-item>
        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="isAddDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addFacility">确 定</el-button>
          </div>
        </template>
      </el-dialog>

      <div class="stats-container">
        <div class="stats-header">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            placeholder="选择日期范围"
            @change="fetchStats"
          />
          <!-- 添加统计区域装饰 -->
          <div class="stats-decoration">
            <img src="@/images/facilities/chart-icon.png" alt="图表" class="stats-icon" />
          </div>
        </div>
        
        <el-card class="stats-card">
          <div class="stats-grid">
            <div class="stat-item">
              <img src="@/images/facilities/total-icon.png" alt="总数" class="stat-icon" />
              <div class="stat-content">
                <span class="stat-label">设施总数</span>
                <span class="stat-value">{{ stats.totalRides }}</span>
              </div>
            </div>
            <div class="stat-item">
              <img src="@/images/facilities/active-icon.png" alt="启用" class="stat-icon" />
              <div class="stat-content">
                <span class="stat-label">启用设施</span>
                <span class="stat-value">{{ stats.operationalRides }}</span>
              </div>
            </div>
            <div class="stat-item">
              <img src="@/images/facilities/maintenance-icon.png" alt="维护" class="stat-icon" />
              <div class="stat-content">
                <span class="stat-label">维护中设施</span>
                <span class="stat-value">{{ stats.maintenanceRides }}</span>
              </div>
            </div>
            <div class="stat-item">
              <img src="@/images/facilities/closed-icon.png" alt="关闭" class="stat-icon" />
              <div class="stat-content">
                <span class="stat-label">关闭设施</span>
                <span class="stat-value">{{ stats.closedRides }}</span>
              </div>
            </div>
            <div class="stat-item">
              <img src="@/images/facilities/capacity-icon.png" alt="容量" class="stat-icon" />
              <div class="stat-content">
                <span class="stat-label">总容量</span>
                <span class="stat-value">{{ stats.totalCapacity }}</span>
              </div>
            </div>
            <div class="stat-item">
              <img src="@/images/facilities/average-icon.png" alt="平均" class="stat-icon" />
              <div class="stat-content">
                <span class="stat-label">平均容量</span>
                <span class="stat-value">{{ stats.averageCapacity }}</span>
              </div>
            </div>
            <div class="stat-item">
              <img src="@/images/facilities/time-icon.png" alt="时间" class="stat-icon" />
              <div class="stat-content">
                <span class="stat-label">平均运行时长</span>
                <span class="stat-value">{{ stats.averageDuration }}</span>
              </div>
            </div>
            <div class="stat-item">
              <img src="@/images/facilities/calendar-icon.png" alt="日期" class="stat-icon" />
              <div class="stat-content">
                <span class="stat-label">最早开放日期</span>
                <span class="stat-value">{{ stats.firstOpenDate }}</span>
              </div>
            </div>
            <div class="stat-item">
              <img src="@/images/facilities/recent-icon.png" alt="最近" class="stat-icon" />
              <div class="stat-content">
                <span class="stat-label">最近开放日期</span>
                <span class="stat-value">{{ stats.lastOpenDate }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </el-card>

    <!-- 页面底部装饰 -->
    <div class="page-footer">
      <div class="footer-images">
        <img src="@/images/facilities/castle.png" alt="城堡" class="footer-decoration" />
        <img src="@/images/facilities/balloon.png" alt="气球" class="footer-decoration floating" />
        <img src="@/images/facilities/flag.png" alt="旗帜" class="footer-decoration" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { searchRides, deleteRide, createRide, getRideStats } from '@/api/facilities';

const facilities = ref([]);
const loading = ref(false);
const pagination = ref({ page: 1, pageSize: 10, total: 0 });
const isAddDialogVisible = ref(false);
const newFacility = ref({
  rideName: '',
  location: '',
  rideStatus: 1,
  capacity: 10,
  duration: 30,
  heightLimitMin: 120,
  heightLimitMax: 200,
  description: '',
  openDate: null,
  managerId: null,
});
const searchQuery = ref({
  keyword: '',
  status: null,
  location: '',
  managerId: null,
  minCapacity: null,
  maxCapacity: null,
});
const stats = ref({
  totalRides: 0,
  operationalRides: 0,
  maintenanceRides: 0,
  closedRides: 0,
  totalCapacity: 0,
  averageCapacity: 0,
  averageDuration: 0,
  firstOpenDate: null,
  lastOpenDate: null,
});
const dateRange = ref([null, null]);

const fetchFacilities = async () => {
  loading.value = true;
  try {
    const data = await searchRides({
      ...searchQuery.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    });
    facilities.value = data.amusementRides;
    pagination.value.total = data.totalCount;
  } finally {
    loading.value = false;
  }
};

const fetchStats = async () => {
  const [startDate, endDate] = dateRange.value;
  const data = await getRideStats({ startDate, endDate });
  stats.value = data;
};

const viewFacilityDetail = (facility) => {
  console.log('查看设施详情:', facility);
};

const editFacility = (facility) => {
  console.log('编辑设施:', facility);
  // 打开编辑弹窗或跳转到编辑页面
};

const deleteFacility = async (id) => {
  try {
    await deleteRide(id);
    fetchFacilities(); // 重新加载设施列表
  } catch (error) {
    console.error('删除设施失败:', error);
  }
};

const openAddFacilityDialog = () => {
  console.log('打开新增设施弹窗'); // 添加调试信息
  newFacility.value = {
    rideName: '',
    location: '',
    rideStatus: 1,
    capacity: 10,
    duration: 30,
    heightLimitMin: 120,
    heightLimitMax: 200,
    description: '',
    openDate: null,
    managerId: null,
  };
  isAddDialogVisible.value = true;
};

const addFacility = async () => {
  try {
    console.log('新增设施数据:', newFacility.value); // 添加调试信息
    await createRide(newFacility.value);
    isAddDialogVisible.value = false;
    fetchFacilities(); // 重新加载设施列表
  } catch (error) {
    console.error('新增设施失败:', error);
  }
};

const resetSearch = () => {
  searchQuery.value = {
    keyword: '',
    status: null,
    location: '',
    managerId: null,
    minCapacity: null,
    maxCapacity: null,
  };
  fetchFacilities();
};

onMounted(() => {
  fetchFacilities();
  fetchStats();
});
</script>

<style scoped>
.facility-list {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

/* 页面头部样式 */
.page-header {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.header-content {
  text-align: center;
  z-index: 2;
  position: relative;
}

.page-title {
  font-size: 2.5em;
  font-weight: bold;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.page-subtitle {
  font-size: 1.2em;
  color: #666;
  margin: 0;
}

.header-images {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-image {
  position: absolute;
  animation: float 6s ease-in-out infinite;
}

.floating-image:nth-child(1) {
  top: 10%;
  left: 10%;
  transform: scale(0.8);
}

.floating-image:nth-child(2) {
  top: 20%;
  right: 10%;
  transform: scale(0.6);
}

.floating-image:nth-child(3) {
  bottom: 10%;
  left: 15%;
  transform: scale(0.7);
}

.floating-image img {
  width: 80px;
  height: 80px;
  opacity: 0.3;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(1deg); }
  50% { transform: translateY(-20px) rotate(0deg); }
  75% { transform: translateY(-10px) rotate(-1deg); }
}

/* 主卡片样式 */
.main-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.card-title {
  font-size: 1.5em;
  font-weight: bold;
  color: #333;
}

.title-decoration {
  display: flex;
  align-items: center;
}

.small-icon {
  width: 24px;
  height: 24px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.search-input {
  width: 300px;
}

/* 操作区域样式 */
.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
  padding: 20px;
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
  border-radius: 15px;
  position: relative;
  overflow: hidden;
}

.add-button {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1em;
  padding: 12px 24px;
  border-radius: 25px;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.button-icon {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
}

.action-decorations {
  display: flex;
  gap: 20px;
}

.decoration-small {
  width: 50px;
  height: 50px;
  opacity: 0.7;
  animation: rotate 8s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 统计区域样式 */
.stats-container {
  margin-top: 30px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats-decoration {
  display: flex;
  align-items: center;
}

.stats-icon {
  width: 32px;
  height: 32px;
  animation: pulse 3s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.stats-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 15px;
  overflow: hidden;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  padding: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 15px;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.stat-icon {
  width: 40px;
  height: 40px;
  /* 使用CSS遮罩方式显示白色图标 */
  background: white;
  mask-size: contain;
  -webkit-mask-size: contain;
  opacity: 0.8;
}

/* 为每个统计图标设置不同的遮罩 */
.stat-item:nth-child(1) .stat-icon {
  mask: url('@/images/facilities/total-icon.png') no-repeat center;
  -webkit-mask: url('@/images/facilities/total-icon.png') no-repeat center;
}

.stat-item:nth-child(2) .stat-icon {
  mask: url('@/images/facilities/active-icon.png') no-repeat center;
  -webkit-mask: url('@/images/facilities/active-icon.png') no-repeat center;
}

.stat-item:nth-child(3) .stat-icon {
  mask: url('@/images/facilities/maintenance-icon.png') no-repeat center;
  -webkit-mask: url('@/images/facilities/maintenance-icon.png') no-repeat center;
}

.stat-item:nth-child(4) .stat-icon {
  mask: url('@/images/facilities/closed-icon.png') no-repeat center;
  -webkit-mask: url('@/images/facilities/closed-icon.png') no-repeat center;
}

.stat-item:nth-child(5) .stat-icon {
  mask: url('@/images/facilities/capacity-icon.png') no-repeat center;
  -webkit-mask: url('@/images/facilities/capacity-icon.png') no-repeat center;
}

.stat-item:nth-child(6) .stat-icon {
  mask: url('@/images/facilities/average-icon.png') no-repeat center;
  -webkit-mask: url('@/images/facilities/average-icon.png') no-repeat center;
}

.stat-item:nth-child(7) .stat-icon {
  mask: url('@/images/facilities/time-icon.png') no-repeat center;
  -webkit-mask: url('@/images/facilities/time-icon.png') no-repeat center;
}

.stat-item:nth-child(8) .stat-icon {
  mask: url('@/images/facilities/calendar-icon.png') no-repeat center;
  -webkit-mask: url('@/images/facilities/calendar-icon.png') no-repeat center;
}

.stat-item:nth-child(9) .stat-icon {
  mask: url('@/images/facilities/recent-icon.png') no-repeat center;
  -webkit-mask: url('@/images/facilities/recent-icon.png') no-repeat center;
}

.stat-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.stat-label {
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.3em;
  font-weight: bold;
  color: white;
}

/* 页面底部装饰 */
.page-footer {
  margin-top: 40px;
  text-align: center;
}

.footer-images {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 50px;
  height: 120px;
}

.footer-decoration {
  height: 80px;
  width: auto;
  opacity: 0.6;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

.footer-decoration.floating {
  animation: float 4s ease-in-out infinite;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    padding: 20px;
  }
  
  .page-title {
    font-size: 2em;
  }
  
  .card-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .action-section {
    flex-direction: column;
    gap: 15px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-images {
    gap: 20px;
    height: 80px;
  }
  
  .footer-decoration {
    height: 60px;
  }
  
  .floating-image img {
    width: 60px;
    height: 60px;
  }
}

/* 表格样式优化 */
:deep(.el-table) {
  background: transparent;
  border-radius: 10px;
  overflow: hidden;
}

:deep(.el-table th) {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: bold;
}

:deep(.el-table tr:hover > td) {
  background: rgba(102, 126, 234, 0.1) !important;
}

/* 分页样式优化 */
:deep(.el-pagination) {
  justify-content: center;
  margin: 20px 0;
}

:deep(.el-pagination .btn-next),
:deep(.el-pagination .btn-prev) {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
}

:deep(.el-pagination .el-pager li.active) {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 5px;
}
</style>
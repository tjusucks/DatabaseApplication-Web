import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 导入页面组件
const Login = () => import('@/views/auth/Login.vue')
const Register = () => import('@/views/auth/Register.vue')
const ResetPassword = () => import('@/views/auth/ResetPassword.vue')
const Profile = () => import('@/views/auth/Profile.vue')
const Layout = () => import('@/layout/index.vue')
const Dashboard = () => import('@/views/dashboard/index.vue')
const NotFound = () => import('@/views/error/404.vue')

// 游客管理模块
const VisitorList = () => import('@/views/visitors/VisitorList.vue')
const VisitorCreate = () => import('@/views/visitors/VisitorCreate.vue')
const VisitorEdit = () => import('@/views/visitors/VisitorEdit.vue')
const VisitorDetail = () => import('@/views/visitors/VisitorDetail.vue')
const VisitorRecords = () => import('@/views/visitors/VisitorRecords.vue')
const VisitorBlacklist = () => import('@/views/visitors/VisitorBlacklist.vue')
const MemberManagement = () => import('@/views/visitors/MemberManagement.vue')

// 票务管理模块
const TicketTypes = () => import('@/views/tickets/TicketTypes.vue')
const TicketPricing = () => import('@/views/tickets/TicketPricing.vue')
const TicketSales = () => import('@/views/tickets/TicketSales.vue')
const TicketStatistics = () => import('@/views/tickets/TicketStatistics.vue')
const ReservationList = () => import('@/views/reservations/ReservationList.vue')
const ReservationDetail = () => import('@/views/reservations/ReservationDetail.vue')
const PromotionList = () => import('@/views/promotions/PromotionList.vue')
const PromotionCreate = () => import('@/views/promotions/PromotionCreate.vue')
const RefundList = () => import('@/views/refunds/RefundList.vue')
const RefundRequest = () => import('@/views/refunds/RefundRequest.vue')
const PromotionDetail = () => import('@/views/promotions/PromotionDetail.vue')
const TicketTypeDetail = () => import('@/views/tickets/TicketTypeDetail.vue')

// 权限管理模块
const TeamManagement = () => import('@/views/auth/TeamManagement.vue')
const RolePermissions = () => import('@/views/auth/RolePermissions.vue')

// 设施管理模块
const FacilityList = () => import('@/views/facilities/FacilityList.vue')
const FacilityDetail = () => import('@/views/facilities/FacilityDetail.vue')
const FacilityMonitoring = () => import('@/views/facilities/FacilityMonitoring.vue')
const MaintenanceRecords = () => import('@/views/maintenance/MaintenanceRecords.vue')
const MaintenanceSchedule = () => import('@/views/maintenance/MaintenanceSchedule.vue')
const SafetyInspections = () => import('@/views/safety/SafetyInspections.vue')
const OperationsAnalytics = () => import('@/views/operations/OperationsAnalytics.vue')

// 财务管理模块
const FinanceIncome = () => import('@/views/finance/FinanceIncome.vue')
const FinanceExpenses = () => import('@/views/finance/FinanceExpenses.vue')
const FinanceReports = () => import('@/views/finance/FinanceReports.vue')
const FinanceReportDetail = () => import('@/views/finance/FinanceReportDetail.vue') // 新增报表详情页
const ConsumptionRecords = () => import('@/views/finance/ConsumptionRecords.vue')

// 人力资源模块
const EmployeeList = () => import('@/views/hr/employees/EmployeeList.vue')
const EmployeeDetail = () => import('@/views/hr/employees/EmployeeDetail.vue')
const PayrollGenerate = () => import('@/views/hr/payroll/PayrollGenerate.vue')
const PayrollRecords = () => import('@/views/hr/payroll/PayrollRecords.vue')
const AttendanceRecords = () => import('@/views/hr/attendance/AttendanceRecords.vue')
const AttendanceStatistics = () => import('@/views/hr/attendance/AttendanceStatistics.vue')
const PerformanceEvaluations = () => import('@/views/hr/performance/PerformanceEvaluations.vue')
const PerformanceReports = () => import('@/views/hr/performance/PerformanceReports.vue')

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',

      requiresAuth: false
    }

  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      title: '注册',
      requiresAuth: false
    }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: {
      title: '重置密码',
      requiresAuth: false
    }
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          title: '仪表板',
          icon: 'House',

          roles: ['Admin', 'Manager', 'Employee', 'Visitor']
        }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: {
          title: '个人资料',
          icon: 'User',
          roles: ['Admin', 'Manager', 'Employee', 'Visitor']
        }
      }
    ]

  },
  // 游客管理路由
  {
    path: '/visitors',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'list',
        name: 'VisitorList',
        component: VisitorList,
        meta: {
          title: '游客列表',

          roles: ['Admin', 'Manager', 'Employee']
        }
      },
      {
        path: ':id',
        name: 'VisitorDetail',
        component: VisitorDetail,
        meta: {
          title: '游客详情',
          roles: ['super_admin', 'customer_service']
        }

      },
      {
        path: 'records',
        name: 'VisitorRecords',
        component: VisitorRecords,
        meta: {
          title: '进出记录',
          roles: ['super_admin', 'operations_manager', 'customer_service'],
        },
      },
      {
        path: 'members',
        name: 'MemberManagement',
        component: MemberManagement,
        meta: {
          title: '会员管理',
          roles: ['super_admin', 'customer_service'],
        },
      },
      {
        path: 'create',
        name: 'VisitorCreate',
        component: VisitorCreate,
        meta: {
          title: '新增游客',
          roles: ['super_admin', 'customer_service'],
        },
      },
      {
        path: ':id/edit',
        name: 'VisitorEdit',
        component: VisitorEdit,
        meta: {
          title: '编辑游客',
          roles: ['super_admin', 'customer_service'],
        },
      },
      {
        path: ':id',
        name: 'VisitorDetail',
        component: VisitorDetail,
        meta: {
          title: '游客详情',
          roles: ['super_admin', 'customer_service'],
        },
      },
      {
        path: 'blacklist',
        name: 'VisitorBlacklist',
        component: VisitorBlacklist,
        meta: {
          title: '黑名单管理',
          roles: ['super_admin', 'customer_service'],
        },
      },
    ],
  },
  // 票务管理路由
  {
    path: '/tickets',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'types',
        name: 'TicketTypes',
        component: TicketTypes,
        meta: {
          title: '票种管理',
          roles: ['super_admin', 'ticket_manager'],
        },
      },
      {
        path: 'detail',
        name: 'TicketTypeDetail',
        component: TicketTypeDetail,
        meta: {
          title: '票种详情',
          roles: ['super_admin', 'ticket_manager'],
        },
      },
      {
        path: 'pricing',
        name: 'TicketPricing',
        component: TicketPricing,
        meta: {
          title: '价格管理',
          roles: ['super_admin', 'ticket_manager'],
        },
      },
      {
        path: 'sales',
        name: 'TicketSales',
        component: TicketSales,
        meta: {
          title: '门票销售',
          roles: ['super_admin', 'ticket_manager'],
        },
      },
      {
        path: 'statistics',
        name: 'TicketStatistics',
        component: TicketStatistics,
        meta: {
          title: '销售统计',
          roles: ['super_admin', 'ticket_manager'],
        },
      },
      // [新增详情页路由]
      {
        path: 'types/:id',
        name: 'TicketTypeDetail',
        component: TicketTypeDetail,
        meta: {
          title: '价格规则管理',
          roles: ['super_admin', 'ticket_manager'],
          //hidden: true, // 不在侧边栏显示
        },
      },
    ],
  },
  // 预订管理路由
  {
    path: '/reservations',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'list',
        name: 'ReservationList',
        component: ReservationList,
        meta: {
          title: '预订列表',
          roles: ['super_admin', 'ticket_manager'],
        },
      },
      {
        path: ':id',
        name: 'ReservationDetail',
        component: ReservationDetail,
        meta: {
          title: '预订详情',
          roles: ['super_admin', 'ticket_manager'],
        },
      },
    ],
  },

  // 退票管理路由
  {
    path: '/refunds',
    component: Layout,
    meta: { requiresAuth: true, title: '退票管理', icon: 'RefreshLeft' },
    redirect: '/refunds/list',
    children: [
      {
        path: 'list',
        name: 'RefundList',
        component: RefundList,
        meta: { title: '退票列表', roles: ['super_admin', 'ticket_manager'] },
      },
      {
        path: 'request',
        name: 'RefundRequest',
        component: RefundRequest,
        meta: {
          title: '申请退票',
          roles: ['super_admin', 'ticket_manager', 'customer_service'],
        },
      },
    ],
  },

  // 营销管理路由
  {
    path: '/promotions',
    component: Layout,
    meta: { requiresAuth: true },
    redirect: '/promotions/list',
    children: [
      {
        path: 'list',
        name: 'PromotionList',
        component: PromotionList,
        meta: {
          title: '优惠活动',
          roles: ['super_admin', 'ticket_manager'],
        },
      },
      // [新增详情页路由]
      {
        path: `detail/:id`,
        name: 'PromotionDetail',
        component: PromotionDetail,
        meta: {
          title: '活动详情管理',
          roles: ['super_admin', 'ticket_manager'],
          //hidden: true, // 不在侧边栏显示
        },
      },
      {
        path: 'create',
        name: 'PromotionCreate',
        component: PromotionCreate,
        meta: {
          title: '创建活动',
          roles: ['super_admin', 'ticket_manager'],
        },
      },
    ],
  },
  // 设施管理路由
  {
    path: '/facilities',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'list',
        name: 'FacilityList',
        component: FacilityList,
        meta: {
          title: '设施列表',
          roles: ['super_admin', 'operations_manager'],
        },
      },
      {
        path: ':id',
        name: 'FacilityDetail',
        component: FacilityDetail,
        meta: {
          title: '设施详情',
          roles: ['super_admin', 'operations_manager'],
        },
      },
      {
        path: 'monitoring',
        name: 'FacilityMonitoring',
        component: FacilityMonitoring,
        meta: {
          title: '设施监控',
          roles: ['super_admin', 'operations_manager'],
        },
      },
    ],
  },
  // 维护管理路由
  {
    path: '/maintenance',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'records',
        name: 'MaintenanceRecords',
        component: MaintenanceRecords,
        meta: {
          title: '维护记录',
          roles: ['super_admin', 'operations_manager'],
        },
      },
      {
        path: 'schedule',
        name: 'MaintenanceSchedule',
        component: MaintenanceSchedule,
        meta: {
          title: '维护计划',
          roles: ['super_admin', 'operations_manager'],
        },
      },
    ],
  },
  // 安全检查路由
  {
    path: '/safety',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'inspections',
        name: 'SafetyInspections',
        component: SafetyInspections,
        meta: {
          title: '安全检查',
          roles: ['super_admin', 'operations_manager'],
        },
      },
    ],
  },
  // 运营分析路由
  {
    path: '/operations',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'analytics',
        name: 'OperationsAnalytics',
        component: OperationsAnalytics,
        meta: {
          title: '运营分析',
          roles: ['super_admin', 'operations_manager'],
        },
      },
    ],
  },
  // 财务管理路由
  {
    path: '/finance',
    component: Layout,
    meta: {
      requiresAuth: true,
      roles: ['super_admin', 'finance_manager'],
    },
    children: [
      {
        path: 'income',
        name: 'FinanceIncome',
        component: FinanceIncome,
        meta: {
          title: '收入管理',
          roles: ['super_admin', 'finance_manager'],
        },
      },
      {
        path: 'expenses',
        name: 'FinanceExpenses',
        component: FinanceExpenses,
        meta: {
          title: '支出管理',
          roles: ['super_admin', 'finance_manager'],
        },
      },
      {
        path: 'reports',
        name: 'FinanceReports',
        component: FinanceReports,
        meta: {
          title: '财务报表',
          roles: ['super_admin', 'finance_manager'],
        },
      },
      {
        path: 'reports/:id',
        name: 'FinanceReportDetail',
        component: FinanceReportDetail,
        meta: {
          title: '报表详情',
          roles: ['super_admin', 'finance_manager'],
          hidden: true, // 不在菜单中显示
        },
      },
      {
        path: 'consumption-records',
        name: 'ConsumptionRecords',
        component: ConsumptionRecords,
        meta: {
          title: '消费记录',
          roles: ['super_admin', 'finance_manager'],
        },
      },
    ],
  },
  // 人力资源路由
  {
    path: '/hr',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'employees/list',
        name: 'EmployeeList',
        component: EmployeeList,
        meta: {
          title: '员工列表',
          roles: ['super_admin', 'hr_manager'],
        },
      },
      {
        path: 'employees/:id',
        name: 'EmployeeDetail',
        component: EmployeeDetail,
        meta: {
          title: '员工详情',
          roles: ['super_admin', 'hr_manager'],
        },
      },
      {
        path: 'payroll/generate',
        name: 'PayrollGenerate',
        component: PayrollGenerate,
        meta: {
          title: '工资单生成',
          roles: ['super_admin', 'hr_manager'],
        },
      },
      {
        path: 'payroll/records',
        name: 'PayrollRecords',
        component: PayrollRecords,
        meta: {
          title: '工资记录',
          roles: ['super_admin', 'hr_manager'],
        },
      },
      {
        path: 'attendance/records',
        name: 'AttendanceRecords',
        component: AttendanceRecords,
        meta: {
          title: '考勤记录',
          roles: ['super_admin', 'hr_manager'],
        },
      },
      {
        path: 'attendance/statistics',
        name: 'AttendanceStatistics',
        component: AttendanceStatistics,
        meta: {
          title: '考勤统计',
          roles: ['super_admin', 'hr_manager'],
        },
      },
      {
        path: 'performance/evaluations',
        name: 'PerformanceEvaluations',
        component: PerformanceEvaluations,
        meta: {
          title: '绩效评估',
          roles: ['super_admin', 'hr_manager'],
        },
      },
      {
        path: 'performance/reports',
        name: 'PerformanceReports',
        component: PerformanceReports,
        meta: {
          title: '绩效报表',
          roles: ['super_admin', 'hr_manager'],
        },
      },
    ],
  },
  // 权限管理路由
  {
    path: '/auth',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'teams',
        name: 'TeamManagement',
        component: TeamManagement,
        meta: {
          title: '团队管理',
          roles: ['super_admin'],
        },
      },
      {
        path: 'roles',
        name: 'RolePermissions',
        component: RolePermissions,
        meta: {
          title: '角色权限',
          roles: ['super_admin'],
        },
      },
    ],
  },

  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: '页面未找到' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 路由守卫

router.beforeEach((to, _, next) => {
  const userStore = useUserStore()

  console.log('🔍 路由守卫调试信息:')
  console.log('  目标路由:', to.path)
  console.log('  用户登录状态:', userStore.isLoggedIn)
  console.log('  用户角色:', userStore.userRole)
  console.log('  用户信息:', userStore.userInfo)
  console.log('  路由需要认证:', to.meta.requiresAuth)
  console.log('  路由需要角色:', to.meta.roles)

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - ${import.meta.env.VITE_APP_TITLE}` : import.meta.env.VITE_APP_TITLE

  // 检查是否需要登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    console.log('🔒 路由守卫: 需要登录，跳转到登录页')
    next('/login')
    return
  }

  // 临时禁用角色权限检查，用于调试
  // if (to.meta.roles && !userStore.hasAnyRole(to.meta.roles)) {
  //   console.log('🚫 路由守卫: 权限不足')
  //   console.log('  目标路由:', to.path)
  //   console.log('  需要角色:', to.meta.roles)
  //   console.log('  用户角色:', userStore.userRole)
  //   console.log('  用户信息:', userStore.userInfo)
  //   next('/404')
  //   return
  // }

  // 已登录用户访问登录页面，重定向到首页
  if (to.path === '/login' && userStore.isLoggedIn) {
    console.log('🔄 已登录用户访问登录页，重定向到首页')
    next('/')
    return
  }

  console.log('✅ 路由守卫通过，继续导航')
  next()

})

export default router

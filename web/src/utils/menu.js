// 完整的菜单配置
const fullMenuList = [
  {
    path: '/dashboard',
    title: '仪表板',
    icon: 'House',
    roles: ['Admin', 'Manager', 'Employee'],
  },
  {
    path: '/visitors',
    title: '游客管理',
    icon: 'User',
    roles: ['Admin', 'Employee'],
    children: [
      {
        path: '/visitors/list',
        title: '游客列表',
        icon: 'UserFilled',
        roles: ['Admin', 'Employee'],
      },
      {
        path: '/visitors/records',
        title: '进出记录',
        icon: 'Clock',
        roles: ['Admin', 'Manager', 'Employee'],
      },
      {
        path: '/visitors/members',
        title: '会员管理',
        icon: 'Star',
        roles: ['Admin', 'Employee'],
      },
      {
        path: '/visitors/blacklist',
        title: '黑名单管理',
        icon: 'CircleCloseFilled',
        roles: ['Admin', 'Employee'],
      },
    ],
  },
  {
    path: '/tickets',
    title: '票务管理',
    icon: 'Ticket',
    roles: ['Admin', 'Manager'],
    children: [
      {
        path: '/tickets/types',
        title: '票种管理',
        icon: 'Collection',
        roles: ['Admin', 'Manager'],
      },
      {
        path: '/tickets/pricing',
        title: '价格管理',
        icon: 'Money',
        roles: ['Admin', 'Manager'],
      },
      {
        path: '/tickets/sales',
        title: '门票销售',
        icon: 'ShoppingCart',
        roles: ['Admin', 'Manager'],
      },
      {
        path: '/tickets/entry',
        title: '入园检票',
        icon: 'Checked',
        roles: ['Admin', 'Manager', 'Employee'],
      },
      {
        path: '/tickets/statistics',
        title: '销售统计',
        icon: 'TrendCharts',
        roles: ['Admin', 'Manager'],
      },
    ],
  },
  {
    path: '/reservations',
    title: '预订管理',
    icon: 'Calendar',
    roles: ['Admin', 'Manager'],
    children: [
      {
        path: '/reservations/list',
        title: '预订列表',
        icon: 'List',
        roles: ['Admin', 'Manager'],
      },
    ],
  },
  {
    path: '/promotions',
    title: '营销管理',
    icon: 'Present',
    roles: ['Admin', 'Manager'],
    children: [
      {
        path: '/promotions/list',
        title: '优惠活动',
        icon: 'Star',
        roles: ['Admin', 'Manager'],
      },
      {
        path: '/promotions/create',
        title: '创建活动',
        icon: 'Plus',
        roles: ['Admin', 'Manager'],
      },
    ],
  },
  {
    path: '/refunds',
    title: '退票管理',
    icon: 'RefreshLeft',
    roles: ['Admin', 'Manager'],
    children: [
      {
        path: '/refunds/list',
        title: '退票列表',
        icon: 'List',
        roles: ['Admin', 'Manager'],
      },
      {
        path: '/refunds/request',
        title: '申请退票',
        icon: 'Setting',
        roles: ['Admin', 'Manager'],
      },
    ],
  },
  {
    path: '/facilities',
    title: '设施管理',
    icon: 'OfficeBuilding',
    roles: ['Admin', 'Manager'],
    children: [
      {
        path: '/facilities/list',
        title: '设施列表',
        icon: 'Grid',
        roles: ['Admin', 'Manager'],
      },
      {
        path: '/facilities/monitoring',
        title: '设施监控',
        icon: 'Monitor',
        roles: ['Admin', 'Manager'],
      },
    ],
  },
  {
    path: '/maintenance',
    title: '维护管理',
    icon: 'Tools',
    roles: ['Admin', 'Manager'],
    children: [
      {
        path: '/maintenance/records',
        title: '维护记录',
        icon: 'Document',
        roles: ['Admin', 'Manager'],
      },
      {
        path: '/maintenance/schedule',
        title: '维护计划',
        icon: 'Calendar',
        roles: ['Admin', 'Manager'],
      },
    ],
  },
  {
    path: '/safety',
    title: '安全检查',
    icon: 'Shield',
    roles: ['Admin', 'Manager'],
    children: [
      {
        path: '/safety/inspections',
        title: '检查记录',
        icon: 'View',
        roles: ['Admin', 'Manager'],
      },
    ],
  },
  {
    path: '/operations',
    title: '运营分析',
    icon: 'DataAnalysis',
    roles: ['Admin', 'Manager'],
    children: [
      {
        path: '/operations/analytics',
        title: '数据统计',
        icon: 'PieChart',
        roles: ['Admin', 'Manager'],
      },
      {
        path: '/operations/ridetraffic',
        title: '流量监控',
        icon: 'Monitor',
        roles: ['super_admin', 'operations_manager'],
      },
    ],
  },
  {
    path: '/finance',
    title: '财务管理',
    icon: 'Money',
    roles: ['Admin', 'Manager'],
    children: [
      {
        path: '/finance/income',
        title: '收入管理',
        icon: 'Coin',
        roles: ['Admin', 'Manager'],
      },
      {
        path: '/finance/expenses',
        title: '支出管理',
        icon: 'Collection',
        roles: ['Admin', 'Manager'],
      },
      {
        path: '/finance/reports',
        title: '财务报表',
        icon: 'DataAnalysis',
        roles: ['Admin', 'Manager'],
      },
      {
        path: '/finance/consumption-records',
        title: '消费记录',
        icon: 'Tickets',
        roles: ['Admin', 'Manager'],
      },
    ],
  },
  {
    path: '/hr',
    title: '人力资源',
    icon: 'Avatar',
    roles: ['Admin', 'Manager'],
    children: [
      {
        path: '/hr/employees/list',
        title: '员工列表',
        icon: 'UserFilled',
        roles: ['Admin', 'Manager'],
      },

      {
        path: '/hr/payroll/records',
        title: '工资记录',
        icon: 'Document',
        roles: ['Admin', 'Manager'],
      },
      {
        path: '/hr/attendance/records',
        title: '考勤记录',
        icon: 'Clock',
        roles: ['Admin', 'Manager'],
      },
      {
        path: '/hr/attendance/statistics',
        title: '考勤统计',
        icon: 'PieChart',
        roles: ['Admin', 'Manager'],
      },
      {
        path: '/hr/performance/evaluations',
        title: '绩效评估',
        icon: 'Trophy',
        roles: ['Admin', 'Manager'],
      },
      {
        path: '/hr/performance/reports',
        title: '绩效报表',
        icon: 'Document',
        roles: ['Admin', 'Manager'],
      },
    ],
  },
  {
    path: '/auth',
    title: '权限管理',
    icon: 'Lock',
    roles: ['Admin'],
    children: [
      {
        path: '/auth/teams',
        title: '团队管理',
        icon: 'UserFilled',
        roles: ['Admin'],
      },
      {
        path: '/auth/roles',
        title: '角色权限',
        icon: 'Key',
        roles: ['Admin'],
      },
    ],
  },
]

// 权限检查已完全禁用 - 所有登录用户可访问所有菜单
const hasPermission = (menuItem, userRole) => {
  // 始终返回 true，允许所有用户访问所有菜单项
  return true
}

// 过滤菜单项 - 现在不进行任何过滤
const filterMenu = (menuList, userRole) => {
  // 返回所有菜单项，不进行权限过滤
  return menuList.map((item) => {
    if (item.children && item.children.length > 0) {
      // 递归处理子菜单，但不过滤
      item.children = filterMenu(item.children, userRole)
    }
    return item
  })
}

// 根据用户角色获取菜单列表
export const getMenuList = (userRole) => {
  // 不检查用户角色，返回所有菜单项
  return filterMenu(JSON.parse(JSON.stringify(fullMenuList)), userRole)
}

// 根据路径查找菜单项
export const findMenuByPath = (menuList, path) => {
  for (const item of menuList) {
    if (item.path === path) {
      return item
    }

    if (item.children && item.children.length > 0) {
      const found = findMenuByPath(item.children, path)
      if (found) {
        return found
      }
    }
  }

  return null
}

// 生成面包屑导航
export const generateBreadcrumbs = (menuList, currentPath) => {
  const breadcrumbs = []

  const findPath = (menus, path, parents = []) => {
    for (const menu of menus) {
      const currentParents = [...parents, menu]

      if (menu.path === path) {
        breadcrumbs.push(...currentParents)
        return true
      }

      if (menu.children && menu.children.length > 0) {
        if (findPath(menu.children, path, currentParents)) {
          return true
        }
      }
    }
    return false
  }

  findPath(menuList, currentPath)
  return breadcrumbs
}

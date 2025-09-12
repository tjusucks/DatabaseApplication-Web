// 完整的菜单配置
const fullMenuList = [
  {
    path: '/dashboard',
    title: '仪表板',
    icon: 'House',
    roles: [
      'super_admin',
      'finance_manager',
      'hr_manager',
      'operations_manager',
      'ticket_manager',
      'customer_service',
      'employee',
    ],
  },
  {
    path: '/visitors',
    title: '游客管理',
    icon: 'User',
    roles: ['super_admin', 'customer_service'],
    children: [
      {
        path: '/visitors/list',
        title: '游客列表',
        icon: 'UserFilled',
        roles: ['super_admin', 'customer_service'],
      },
      {
        path: '/visitors/records',
        title: '进出记录',
        icon: 'Clock',
        roles: ['super_admin', 'operations_manager', 'customer_service'],
      },
      {
        path: '/visitors/blacklist',
        title: '黑名单管理',
        icon: 'CircleCloseFilled',
        roles: ['super_admin', 'customer_service'],
      },
    ],
  },
  {
    path: '/tickets',
    title: '票务管理',
    icon: 'Ticket',
    roles: ['super_admin', 'ticket_manager'],
    children: [
      {
        path: '/tickets/types',
        title: '票种管理',
        icon: 'Collection',
        roles: ['super_admin', 'ticket_manager'],
      },
      {
        path: '/tickets/pricing',
        title: '价格管理',
        icon: 'Money',
        roles: ['super_admin', 'ticket_manager'],
      },
      {
        path: '/tickets/sales',
        title: '门票销售',
        icon: 'ShoppingCart',
        roles: ['super_admin', 'ticket_manager'],
      },
      {
        path: '/tickets/statistics',
        title: '销售统计',
        icon: 'TrendCharts',
        roles: ['super_admin', 'ticket_manager'],
      },
    ],
  },
  {
    path: '/reservations',
    title: '预订管理',
    icon: 'Calendar',
    roles: ['super_admin', 'ticket_manager'],
    children: [
      {
        path: '/reservations/list',
        title: '预订列表',
        icon: 'List',
        roles: ['super_admin', 'ticket_manager'],
      },
    ],
  },
  {
    path: '/promotions',
    title: '营销管理',
    icon: 'Present',
    roles: ['super_admin', 'ticket_manager'],
    children: [
      {
        path: '/promotions/list',
        title: '优惠活动',
        icon: 'Star',
        roles: ['super_admin', 'ticket_manager'],
      },
      {
        path: '/promotions/create',
        title: '创建活动',
        icon: 'Plus',
        roles: ['super_admin', 'ticket_manager'],
      },
    ],
  },
  {
    path: '/refunds',
    title: '退票管理',
    icon: 'RefreshLeft',
    roles: ['super_admin', 'ticket_manager'],
    children: [
      {
        path: '/refunds/list',
        title: '退票列表',
        icon: 'List',
        roles: ['super_admin', 'ticket_manager'],
      },
      {
        path: '/refunds/request',
        title: '退票管理',
        icon: 'Setting',
        roles: ['super_admin', 'ticket_manager'],
      },
    ],
  },
  {
    path: '/facilities',
    title: '设施管理',
    icon: 'OfficeBuilding',
    roles: ['super_admin', 'operations_manager'],
    children: [
      {
        path: '/facilities/list',
        title: '设施列表',
        icon: 'Grid',
        roles: ['super_admin', 'operations_manager'],
      },
      {
        path: '/facilities/monitoring',
        title: '设施监控',
        icon: 'Monitor',
        roles: ['super_admin', 'operations_manager'],
      },
    ],
  },
  {
    path: '/maintenance',
    title: '维护管理',
    icon: 'Tools',
    roles: ['super_admin', 'operations_manager'],
    children: [
      {
        path: '/maintenance/records',
        title: '维护记录',
        icon: 'Document',
        roles: ['super_admin', 'operations_manager'],
      },
      {
        path: '/maintenance/schedule',
        title: '维护计划',
        icon: 'Calendar',
        roles: ['super_admin', 'operations_manager'],
      },
    ],
  },
  {
    path: '/safety',
    title: '安全检查',
    icon: 'Shield',
    roles: ['super_admin', 'operations_manager'],
    children: [
      {
        path: '/safety/inspections',
        title: '检查记录',
        icon: 'View',
        roles: ['super_admin', 'operations_manager'],
      },
    ],
  },
  {
    path: '/operations',
    title: '运营分析',
    icon: 'DataAnalysis',
    roles: ['super_admin', 'operations_manager'],
    children: [
      {
        path: '/operations/analytics',
        title: '数据统计',
        icon: 'PieChart',
        roles: ['super_admin', 'operations_manager'],
      },
    ],
  },
  {
    path: '/finance',
    title: '财务管理',
    icon: 'Wallet',
    roles: ['super_admin', 'finance_manager'],
    children: [
      {
        path: '/finance/income',
        title: '收入管理',
        icon: 'TrendCharts',
        roles: ['super_admin', 'finance_manager'],
      },
      {
        path: '/finance/expenses',
        title: '支出管理',
        icon: 'Minus',
        roles: ['super_admin', 'finance_manager'],
      },
      {
        path: '/finance/reports',
        title: '财务报表',
        icon: 'Document',
        roles: ['super_admin', 'finance_manager'],
      },
      {
        path: '/finance/consumption',
        title: '消费记录',
        icon: 'List',
        roles: ['super_admin', 'finance_manager', 'customer_service'],
      },
    ],
  },
  {
    path: '/hr',
    title: '人力资源',
    icon: 'Avatar',
    roles: ['super_admin', 'hr_manager'],
    children: [
      {
        path: '/hr/employees',
        title: '员工管理',
        icon: 'UserFilled',
        roles: ['super_admin', 'hr_manager'],
        children: [
          {
            path: '/hr/employees/list',
            title: '员工列表',
            icon: 'List',
            roles: ['super_admin', 'hr_manager'],
          },
        ],
      },
      {
        path: '/hr/payroll',
        title: '工资管理',
        icon: 'Money',
        roles: ['super_admin', 'hr_manager'],
        children: [
          {
            path: '/hr/payroll/generate',
            title: '工资单生成',
            icon: 'DocumentAdd',
            roles: ['super_admin', 'hr_manager'],
          },
          {
            path: '/hr/payroll/records',
            title: '工资记录',
            icon: 'Document',
            roles: ['super_admin', 'hr_manager'],
          },
        ],
      },
      {
        path: '/hr/attendance',
        title: '考勤管理',
        icon: 'Clock',
        roles: ['super_admin', 'hr_manager'],
        children: [
          {
            path: '/hr/attendance/records',
            title: '考勤记录',
            icon: 'Document',
            roles: ['super_admin', 'hr_manager'],
          },
          {
            path: '/hr/attendance/statistics',
            title: '考勤统计',
            icon: 'PieChart',
            roles: ['super_admin', 'hr_manager'],
          },
        ],
      },
      {
        path: '/hr/performance',
        title: '绩效管理',
        icon: 'Trophy',
        roles: ['super_admin', 'hr_manager'],
        children: [
          {
            path: '/hr/performance/evaluations',
            title: '绩效评估',
            icon: 'Star',
            roles: ['super_admin', 'hr_manager'],
          },
          {
            path: '/hr/performance/reports',
            title: '绩效报表',
            icon: 'Document',
            roles: ['super_admin', 'hr_manager'],
          },
        ],
      },
    ],
  },
  {
    path: '/auth',
    title: '权限管理',
    icon: 'Lock',
    roles: ['super_admin'],
    children: [
      {
        path: '/auth/teams',
        title: '团队管理',
        icon: 'UserFilled',
        roles: ['super_admin'],
      },
      {
        path: '/auth/roles',
        title: '角色权限',
        icon: 'Key',
        roles: ['super_admin'],
      },
    ],
  },
]

// 检查用户是否有权限访问菜单项
const hasPermission = (menuItem, userRole) => {
  if (!menuItem.roles || menuItem.roles.length === 0) {
    return true
  }
  return menuItem.roles.includes(userRole) || userRole === 'super_admin'
}

// 过滤菜单项
const filterMenu = (menuList, userRole) => {
  return menuList.filter((item) => {
    if (!hasPermission(item, userRole)) {
      return false
    }

    if (item.children && item.children.length > 0) {
      item.children = filterMenu(item.children, userRole)
      return item.children.length > 0
    }

    return true
  })
}

// 根据用户角色获取菜单列表
export const getMenuList = (userRole) => {
  if (!userRole) {
    return []
  }

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

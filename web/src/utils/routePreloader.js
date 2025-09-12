// 路由预加载工具
class RoutePreloader {
  constructor() {
    this.preloadedRoutes = new Set()
    this.preloadPromises = new Map()
  }

  // 预加载路由组件
  async preloadRoute(routeName) {
    if (this.preloadedRoutes.has(routeName)) {
      return this.preloadPromises.get(routeName)
    }

    const preloadPromise = this.loadRouteComponent(routeName)
    this.preloadPromises.set(routeName, preloadPromise)

    try {
      await preloadPromise
      this.preloadedRoutes.add(routeName)
    } catch (error) {
      console.warn(`预加载路由 ${routeName} 失败:`, error)
      this.preloadPromises.delete(routeName)
    }

    return preloadPromise
  }

  // 根据路由名称加载组件
  async loadRouteComponent(routeName) {
    const routeMap = {
      VisitorList: () => import('@/views/visitors/VisitorList.vue'),
      VisitorDetail: () => import('@/views/visitors/VisitorDetail.vue'),
      VisitorRecords: () => import('@/views/visitors/VisitorRecords.vue'),
      TicketTypes: () => import('@/views/tickets/TicketTypes.vue'),
      TicketPricing: () => import('@/views/tickets/TicketPricing.vue'),
      TicketSales: () => import('@/views/tickets/TicketSales.vue'),
      TicketStatistics: () => import('@/views/tickets/TicketStatistics.vue'),
      Dashboard: () => import('@/views/dashboard/index.vue'),
      // 可以根据需要添加更多路由
    }

    const loader = routeMap[routeName]
    if (!loader) {
      throw new Error(`未找到路由组件: ${routeName}`)
    }

    return await loader()
  }

  // 预加载相关路由（基于当前路由预测用户可能访问的页面）
  preloadRelatedRoutes(currentRouteName) {
    const relatedRoutes = this.getRelatedRoutes(currentRouteName)

    relatedRoutes.forEach((routeName) => {
      // 使用 requestIdleCallback 在浏览器空闲时预加载
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          this.preloadRoute(routeName)
        })
      } else {
        // 降级方案
        setTimeout(() => {
          this.preloadRoute(routeName)
        }, 100)
      }
    })
  }

  // 获取相关路由
  getRelatedRoutes(currentRouteName) {
    const routeRelations = {
      Dashboard: ['VisitorList', 'TicketTypes'],
      VisitorList: ['VisitorDetail', 'VisitorRecords'],
      TicketTypes: ['TicketPricing', 'TicketSales'],
      TicketPricing: ['TicketTypes', 'TicketSales'],
      // 可以根据业务逻辑添加更多关联关系
    }

    return routeRelations[currentRouteName] || []
  }

  // 清理预加载缓存
  clearCache() {
    this.preloadedRoutes.clear()
    this.preloadPromises.clear()
  }
}

export const routePreloader = new RoutePreloader()

// 路由预加载混入
export const routePreloadMixin = {
  mounted() {
    // 预加载相关路由
    if (this.$route.name) {
      routePreloader.preloadRelatedRoutes(this.$route.name)
    }
  },
}

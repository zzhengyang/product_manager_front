import { asyncRoutes, constantRoutes, initRoutes } from '@/router'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  async generateRoutes({ commit }, roles) {
    try {
      // 等待动态路由初始化完成
      const asyncRoutesWithApi = await initRoutes()

      let accessedRoutes
      if (roles.includes('admin')) {
        accessedRoutes = asyncRoutesWithApi || []
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutesWithApi, roles)
      }
      commit('SET_ROUTES', accessedRoutes)
      return accessedRoutes
    } catch (error) {
      console.error('Generate routes failed:', error)
      return []
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

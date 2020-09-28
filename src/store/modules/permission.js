import { asyncRoutes, constantRoutes } from '@/router'
/**
 * 通过meta.data确认当前用户是否有权限
 * @param {*} roles
 * @param {*} route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    // 如果有一个元素满足条件，则立即返回true，没有满足条件的元素返回false
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return false
  }
}

export function filterAsybcRoutes(routes, roles) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsybcRoutes(tmp.children, roles)
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
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      let accessedRoutes
      // 管理员可以访问所有
      if (roles.includes('admin')) {
        accessedRoutes = asyncRoutes || []
      } else {
        accessedRoutes = filterAsybcRoutes(asyncRoutes, roles)
      }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

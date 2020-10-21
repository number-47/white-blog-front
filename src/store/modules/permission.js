import { constantRoutes } from '@/router'
import { getMenus } from '@/api/menus'

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

function handleRoutes(accessedRoutes) {
  if (accessedRoutes.length > 0) {
    accessedRoutes.forEach(function(item) {
      item['component'] = getView(item.component)
      if (item.children.length > 0) {
        handleRoutes(item.children)
      }
    })
  }
  return accessedRoutes
}

function getView(componentPath) {
  if (componentPath === 'Layout') {
    return resolve => {
      require(['@/layout'], resolve)
    }
  } else {
    return resolve => {
      require(['@/views/' + componentPath], resolve)
    }
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
  generateRoutes({ commit }) {
    return new Promise((resolve, reject) => {
      getMenus().then(response => {
        const { data } = response
        var accessedRoutes = data
        accessedRoutes = handleRoutes(accessedRoutes)
        // 不能放在静态路由下，否则在动态菜单获取的时候刷新后为404
        accessedRoutes.push({ path: '*', redirect: '/error/404', hidden: true })
        // 存在vueX中
        commit('SET_ROUTES', accessedRoutes)
        resolve(accessedRoutes)
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

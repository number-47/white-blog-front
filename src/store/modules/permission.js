import { constantRoutes } from '@/router'
import { getMenu } from '@/api/menus'
import db from '@/utils/localstorage'

function handlerMenus(menus) {
  return menus.filter((menus) => {
    const component = menus.component
    if (component) {
      if (menus.component === 'Layout') {
        menus.component = resolve => { require(['@/layout/index'], resolve) }
      } else {
        menus.component = view(menus.component)
      }
      if (menus.children && menus.children.length) {
        menus.children = handlerMenus(menus.children)
      }
      return true
    }
  })
}

function view(componentPath) {
  return resolve => {
    require(['@/views/' + componentPath], resolve)
  }
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
      getMenu()
        .then((response) => {
          const { data } = response
          var menu
          menu = handlerMenus(data)
          db.save('menu', menu)
          // 存在vueX中
          commit('SET_ROUTES', menu)
          resolve(menu)
        })
        .catch((error) => {
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

import { login, logout, getInfo, refreshToken } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import db from '@/utils/localstorage'

const getDefaultState = () => {
  return {
    token: getToken(),
    expireTime: db.get('expireTime'),
    refreshToken: db.get('refreshToken'),
    refreshExpireTime: db.get('refreshExpireTime'),
    name: '',
    avatar: '',
    roles: []
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_EXPIRE_TIME: (state, expireTime) => {
    state.expireTime = expireTime
  },
  SET_REFRESH_TOKEN: (state, refreshToken) => {
    state.refreshToken = refreshToken
  },
  SET_REFRESH_EXPIRE_TIME: (state, refreshExpireTime) => {
    state.refreshExpireTime = refreshExpireTime
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // 用户登录
  login({ commit }, userInfo) {
    const { username, password, rememberMe } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password, rememberMe: rememberMe }).then(response => {
        const { data } = response
        // 得到token存到localStorage
        db.save('token', data.token)
        db.save('refreshToken', data.refreshToken)
        db.save('expireTime', data.expireTime)
        db.save('refreshExpireTime', data.refreshExpireTime)
        db.save('userName', username)
        // 存在vueX中
        commit('SET_TOKEN', data.token)
        commit('SET_EXPIRE_TIME', data.expireTime)
        commit('SET_REFRESH_TOKEN', data.refreshToken)
        commit('SET_REFRESH_EXPIRE_TIME', data.refreshExpireTime)
        // 存在cookie中
        setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取用户信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        const { name, avatar, roles } = data

        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_ROLES', roles)
        resolve(data)
        return data
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 用户退出登录
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  },
  /**
   * 刷新token
   */
  async refreshToken({ commit }) {
    const data = {
      'userName': db.get('userName'),
      'refreshToken': state.refreshToken
    }
    return await new Promise((resolve, reject) => {
      refreshToken(data).then((response) => {
        const { data } = response
        console.log('refresh' + data)
        // 得到token存到localStorage
        db.save('token', data.token)
        db.save('expireTime', data.expireTime)
        // 存在vueX中
        commit('SET_TOKEN', data.token)
        commit('SET_EXPIRE_TIME', data.expireTime)
        // resolve()
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


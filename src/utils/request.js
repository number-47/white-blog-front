import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
// import { authorizationValue } from '@/settings'
import store from '@/store'
import { getToken, getRefreshToken, getExpireTime } from '@/utils/auth'
import db from '@/utils/localstorage'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 请求超时时间，10s
const requestTimeOut = 10 * 1000
const success = 200
// 更换令牌的时间区间
const checkRegion = 1000
// 提示信息显示时长
const messageDuration = 5 * 1000

// 系统全局请求对象
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: requestTimeOut, // request timeout
  responseType: 'json',
  validateStatus(status) {
    return status === success
  }
})

// 系统令牌刷新请求对象
const refresh_service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: requestTimeOut,
  responseType: 'json',
  validateStatus(status) {
    return status === success
  }
})

// 请求发起前拦截
service.interceptors.request.use(
  config => {
    let _config = config
    try {
      const expireTime = getExpireTime()
      console.log(JSON.stringify(expireTime))
      if (JSON.stringify(expireTime) !== '{}' && expireTime) {
        const left = expireTime - new Date().getTime()
        const refreshToken = getRefreshToken()
        if (left < checkRegion && refreshToken) {
          _config = queryRefreshToken(_config, refreshToken)
        } else {
          const token = getToken()
          console.log(token)
          if (JSON.stringify(token) !== '{}' && token) {
            _config.headers['Authorization'] = 'bearer ' + getToken()
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
    return _config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

// 请求发起后拦截
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */

  response => {
    const res = response.data
    if (res.code !== 20000) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm('你已经退出登录，你可以取消，留在当前页面，或者重新登录', '确认退出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    if (error.response) {
      const errorMessage = error.response.data.message === null ? '系统内部异常，请联系网站管理员' : error.response.data.message
      console.log(error.response.data.code)
      switch (error.response.data.code) {
        case 50008:
          Message({
            message: '账户已过期，请重新登录',
            type: 'error',
            duration: messageDuration
          })
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
          break
        case 50014:
          Message({
            message: '账户已过期，请重新登录',
            type: 'error',
            duration: messageDuration
          })
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
          break
        case 50000:
          Message({
            message: '操作失败，请联系管理员',
            type: 'error',
            duration: messageDuration
          })
          break
        case 404:
          Message({
            message: '很抱歉，资源未找到',
            type: 'error',
            duration: messageDuration
          })
          break
        case 403:
          Message({
            message: '很抱歉，您暂无该操作权限',
            type: 'error',
            duration: messageDuration
          })
          break
        case 401:
          Message({
            message: '很抱歉，认证已失效，请重新登录',
            type: 'error',
            duration: messageDuration
          })
          break
        default:
          Message({
            message: errorMessage,
            type: 'error',
            duration: messageDuration
          })
          break
      }
    }
    return Promise.reject(error)
  }
)
const request = {
  refresh(url, params) {
    // params['grant_type'] = 'refresh_token'
    return refresh_service.post(url, params, {
      transformRequest: [
        params => {
          return JSON.stringify(params)
        }
      ],
      headers: {
        Authorization: 'bearer ' + getToken(),
        'Content-Type': 'application/json;charset=UTF-8'
      }
    })
  },
  post(url, params) {
    return service.post(url, params, {
      transformRequest: [
        params => {
          return tansParams(params)
        }
      ],
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    })
  },
  put(url, params) {
    return service.put(url, params, {
      transformRequest: [
        params => {
          return tansParams(params)
        }
      ],
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    })
  },
  get(url, params) {
    let _params
    if (Object.is(params, undefined)) {
      _params = ''
    } else {
      _params = '?'
      let key
      for (key in params) {
        if (params.prototype.hasOwnProperty.call(params, key) && params[key] !== null) {
          _params += `${key}=${params[key]}&`
        }
      }
    }
    return service.get(`${url}${_params}`)
  },
  delete(url, params) {
    let _params
    if (Object.is(params, undefined)) {
      _params = ''
    } else {
      _params = '?'
      let key
      for (key in params) {
        if (params.prototype.hasOwnProperty.call(params, key) && params[key] !== null) {
          _params += `${key}=${params[key]}&`
        }
      }
    }
    return service.delete(`${url}${_params}`)
  },
  download(url, params, filename) {
    NProgress.start()
    return service
      .post(url, params, {
        transformRequest: [
          params => {
            return tansParams(params)
          }
        ],
        responseType: 'blob'
      })
      .then(r => {
        const content = r.data
        const blob = new Blob([content])
        if ('download' in document.createElement('a')) {
          const elink = document.createElement('a')
          elink.download = filename
          elink.style.display = 'none'
          elink.href = URL.createObjectURL(blob)
          document.body.appendChild(elink)
          elink.click()
          URL.revokeObjectURL(elink.href)
          document.body.removeChild(elink)
        } else {
          navigator.msSaveBlob(blob, filename)
        }
        NProgress.done()
      })
      .catch(r => {
        console.error(r)
        NProgress.done()
        Message({
          message: '下载失败',
          type: 'error',
          duration: messageDuration
        })
      })
  },
  upload(url, params) {
    return service.post(url, params, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

function tansParams(params) {
  let result = ''
  Object.keys(params).forEach(key => {
    if (!Object.is(params[key], undefined) && !Object.is(params[key], null)) {
      result += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) + '&'
    }
  })
  return result
}

async function queryRefreshToken(config, refreshToken) {
  const result = await request.refresh('user/refreshToken', {
    userName: db.get('userName'),
    refreshToken: refreshToken
  })
  if (result.data.code === 20000) {
    saveData(result.data.data)
    config.headers['Authorization'] = 'bearer ' + getToken()
  }
  return config
}

function saveData(data) {
  db.save('token', data.token)
  db.save('expireTime', data.expireTime)
  // store.commit('SET_TOKEN', data.token)
  // store.commit('SET_EXPIRE_TIME', data.expireTime)
  // const current = new Date()
  // const expireTime = current.setTime(current.getTime() + 1000 * data.expires_in)
  // store.commit('account/setExpireTime', expireTime)
}
export default service

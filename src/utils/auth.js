import db from '@/utils/localstorage'

export function getToken() {
  return db.get('token')
}

export function getRefreshToken() {
  return db.get('refreshToken')
}

export function getExpireTime() {
  return db.get('expireTime')
}

export function getUserName() {
  return db.get('userName')
}

export function removeToken() {
  return db.clear()
}

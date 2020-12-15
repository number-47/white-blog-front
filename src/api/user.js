import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'get'
  })
}

export function userList(userDto) {
  return request({
    url: '/user/list',
    method: 'get',
    params: userDto
  })
}

export function updateUser(data) {
  return request({
    url: '/user/update/' + data.id,
    method: 'post',
    data
  })
}

export function createUser(data) {
  return request({
    url: '/user/create',
    method: 'post',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: '/user/delete/' + id,
    method: 'delete'
  })
}

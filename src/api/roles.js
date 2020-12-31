import request from '@/utils/request'

export function getAllRole(roleDto) {
  return request({
    url: '/adminRole/list',
    method: 'get',
    params: roleDto
  })
}

export function getAllRoleWithoutPage(roleDto) {
  return request({
    url: '/adminRole/listAll',
    method: 'get',
    params: roleDto
  })
}

export function distributeUser(roleId, data) {
  return request({
    url: '/adminUserRole/distributeUser/' + roleId,
    method: 'post',
    data
  })
}

export function addRole(data) {
  return request({
    url: '/adminRole/create',
    method: 'post',
    data
  })
}
export function updateRole(data) {
  return request({
    url: '/adminRole/update/' + data.id,
    method: 'post',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: '/adminRole/delete/' + id,
    method: 'delete'
  })
}

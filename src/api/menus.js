import request from '@/utils/request'

export function getMenu() {
  return request({
    url: '/adminMenu/menu',
    method: 'get'
  })
}
export function getAllMenu(menuDto) {
  return request({
    url: '/adminMenu/listAll',
    method: 'get',
    params: menuDto
  })
}
export function addMenu(data) {
  return request({
    url: '/adminMenu/create',
    method: 'post',
    data
  })
}
export function updateMenu(data) {
  return request({
    url: '/adminMenu/update/' + data.id,
    method: 'post',
    data
  })
}

export function deleteMenu(id) {
  return request({
    url: '/adminMenu/delete/' + id,
    method: 'delete'
  })
}

import request from '@/utils/request'

export function getMenus() {
  return request({
    url: '/adminMenu/menu',
    method: 'get'
  })
}

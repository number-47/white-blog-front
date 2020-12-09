const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  expireTime: state => state.user.expireTime,
  refreshToken: state => state.user.refreshToken,
  refreshExpireTime: state => state.user.refreshExpireTime,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  permission_routes: state => state.permission.routes
}
export default getters

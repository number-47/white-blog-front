<template>
  <div class="app-container">
    <div v-if="user">
      <el-row :gutter="20">

        <el-col :span="6" :xs="24">
          <user-card :user="user" />
        </el-col>

        <el-col :span="18" :xs="24">
          <el-card>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="登录时间" name="timeline">
                <timeline />
              </el-tab-pane>
              <el-tab-pane label="修改密码" name="modifyPassword">
                <modifyPassword :user="user" />
              </el-tab-pane>
              <el-tab-pane label="账户信息" name="account">
                <account :user="user" @accountUpdate="indexAccountUpdate" />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>

      </el-row>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import UserCard from './components/UserCard'
import ModifyPassword from './components/ModifyPassword'
import Timeline from './components/Timeline'
import Account from './components/Account'
import db from '@/utils/localstorage'

export default {
  name: 'Profile',
  components: { UserCard, ModifyPassword, Timeline, Account },
  data() {
    return {
      user: {},
      activeTab: 'timeline'
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'roles'
    ])
  },
  created() {
    this.getUser()
  },
  methods: {
    getUser() {
      const account = db.get('user')
      const roles = account.adminRoles
      const adminRole = []
      for (let j = 0, len = roles.length; j < len; j++) {
        console.log(roles[j])
        adminRole[j] = roles[j].nameZh
      }
      this.user = {
        id: account.id,
        username: account.username,
        name: account.name,
        role: adminRole.join(' | '),
        email: account.email,
        avatar: account.avatar,
        phone: account.phone
      }
    },
    indexAccountUpdate(data) {
      this.user = JSON.parse(JSON.stringify(data))
    }
  }
}
</script>

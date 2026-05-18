import { login, getInfo, logout } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'

const user = {
  state: {
    token: getToken(),
    user: {},
    companyId: '',
    roles: [],
    // 第一次加载菜单时用到
    loadMenus: false
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_COMPANY_ID: (state, id) => {
      state.companyId = id
    },
    SET_USER: (state, user) => {
      state.user = user
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_LOAD_MENUS: (state, loadMenus) => {
      state.loadMenus = loadMenus
    }
  },

  actions: {
    // 登录
    Login({ commit, dispatch }, userInfo) {
      const rememberMe = userInfo.rememberMe
      return new Promise((resolve, reject) => {
        login(userInfo.username, userInfo.password, userInfo.code, userInfo.uuid).then(res => {
          setToken(res.token, rememberMe)
          commit('SET_TOKEN', res.token)
          dispatch('GetInfo').then(user => {
            // 第一次加载菜单时用到，具体见 src/router/index.js
            commit('SET_LOAD_MENUS', true)
            resolve(user)
          }).catch(error => {
            logOut(commit)
            reject(error)
          })
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo({ commit }) {
      return new Promise((resolve, reject) => {
        getInfo().then(res => {
          setUserInfo(res, commit)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 登出
    LogOut({ commit }) {
      return new Promise((resolve, reject) => {
        logout().then(() => {
          logOut(commit)
          resolve()
        }).catch(error => {
          logOut(commit)
          reject(error)
        })
      })
    },

    updateLoadMenus({ commit }) {
      return new Promise((resolve) => {
        commit('SET_LOAD_MENUS', false)
        resolve()
      })
    }
  }
}

export const logOut = (commit) => {
  commit('SET_TOKEN', '')
  commit('SET_ROLES', [])
  commit('SET_USER', {})
  commit('SET_LOAD_MENUS', false)
  removeToken()
}

export const setUserInfo = (res, commit) => {
  const roles = Array.isArray(res.roles) ? res.roles : []
  console.log(res.companyId)
  commit('SET_COMPANY_ID', res.companyId)
  // 如果没有任何权限，则赋予一个默认权限，避免请求死循环
  if (roles.length === 0) {
    commit('SET_ROLES', ['ROLE_SYSTEM_DEFAULT'])
  } else {
    commit('SET_ROLES', roles)
  }
  commit('SET_USER', res.user || {})
}

export default user

import User from '@/api/user'
import Auth from '@/api/auth'
import client from '@/utils/client'

const state = {
  currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
}

const getters = {
  getCurrentUser: _state => _state.currentUser,
}

const mutations = {

  setCurrentUser(_state, payload) {
    // eslint-disable-next-line
    _state.currentUser = { ..._state.currentUser, ...payload};
  },
  login(_state, payload) {
    // eslint-disable-next-line
    _state.currentUser = payload.data.login;
    localStorage.setItem('currentUser', JSON.stringify(payload.data.login))
  },
  loginOnRegister(_state, payload) {
    // eslint-disable-next-line
    _state.currentUser = payload;
    localStorage.setItem('currentUser', JSON.stringify(payload))
  },
  logout(_state) {
    localStorage.removeItem('currentUser')
    // eslint-disable-next-line
    _state.currentUser = null;
  },
}

const actions = {
  getCurrentUser(context, payload) {
    return User.getUser(payload.id)
      .then((data) => {
        context.commit('setCurrentUser', data.data.user)
        return data
      })
  },
  login(context, payload) {
    return Auth.login(payload.email, payload.password)
      .then((data) => {
        context.commit('login', data)
        return data
      })
  },
  logout(context) {
    client.api.resetStore()
    client.subscription.unsubscribeAll()
    client.subscription.close()
    context.commit('logout')
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}

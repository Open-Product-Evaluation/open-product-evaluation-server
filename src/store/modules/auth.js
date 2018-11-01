import User from '@/api/user';
import Auth from '@/api/auth';
import Router from '../../router';

const state = {
  currentUser: JSON.parse(localStorage.getItem('currentUser')),
};

const getters = {
  getCurrentUser: () => JSON.parse(localStorage.getItem('currentUser')),
};

const mutations = {

  setCurrentUser(_state, payload) {
    // eslint-disable-next-line
    _state.currentUser = { ..._state.currentUser, ...payload};
  },
  login(_state, payload) {
    // eslint-disable-next-line
    _state.currentUser = payload.data.login;
    localStorage.setItem('currentUser', JSON.stringify(payload.data.login));
  },
  logout(_state) {
    localStorage.removeItem('currentUser');
    // eslint-disable-next-line
    _state.currentUser = null;
  },
};

const actions = {
  getCurrentUser(context, payload) {
    User.getUser(payload.id)
      .then((data) => {
        context.commit('setCurrentUser', data.data.user);
      });
  },
  login(context, payload) {
    Auth.login(payload.email, payload.password)
      .then((data) => {
        context.commit('login', data);
        Router.push('/survey');
      })
      .catch(error => context.commit('error',
        {
          key: 'login',
          data: error,
        }),
      );
  },
  logout(context) {
    context.commit('logout');
  },
};

export default {
  state,
  getters,
  mutations,
  actions,
};

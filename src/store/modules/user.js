import User from '@/api/user';
import Auth from '@/api/auth';
import Router from '@/router';

const state = {
  users: [],
  currentUser: {},
};

const getters = {
  getUsers: _state => _state.users,
  getUser: _state => _state.currentUser,
};

const mutations = {
  setCurrentUser(_state, payload) {
    // eslint-disable-next-line
    _state.currentUser = payload;
  },
  setUsers(_state, payload) {
    // eslint-disable-next-line
    _state.users = payload;
  },
  hasUser(_state) {
    if (_state.currentUser !== null) {
      return;
    }

    // eslint-disable-next-line
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser !== null) {
      // eslint-disable-next-line
      _state.currentUser = JSON.parse(currentUser);
    }
  },
};

const actions = {
  getUsers(context) {
    User.getUsers()
      .then((data) => {
        context.commit('setUsers', data.data.users);
      });
  },
  getUser(context, payload) {
    User.getUser(payload.id)
      .then((data) => {
        context.commit('setCurrentUser', data.data.user);
      });
  },
  updateProfile(context, payload) {
    User.updateUser(
      payload.id,
      payload.firstName,
      payload.lastName,
      payload.email,
      payload.password,
    ).then((data) => {
      context.commit('setCurrentUser', data.data.updateUser.user);
    });
  },
  updateUser(context, payload) {
    User.updateUser(
      payload.id,
      payload.firstName,
      payload.lastName,
      payload.email,
    ).then((data) => {
      context.commit('setCurrentUser', data.data.updateUser.user);
      Router.push('/user');
    });
  },
  register(context, payload) {
    Auth.register(payload.firstname, payload.lastname, payload.email, payload.password)
      .then(() => {
        Router.push('/');
      })
      .catch(error => context.commit('error',
        {
          key: 'register',
          data: error,
        },
      ));
  },
  hasUser(context) {
    context.commit('hasUser');
  },
};

export default {
  state,
  getters,
  mutations,
  actions,
};

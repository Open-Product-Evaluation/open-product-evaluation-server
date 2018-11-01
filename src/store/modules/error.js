const state = {
  errors: {
    login: null,
    register: null,
  },
};

const getters = {
  getError: _state => error => _state.errors[`${error}`],
};

const mutations = {
  error(_state, payload) {
    // eslint-disable-next-line
    _state.errors[payload.key] = JSON.parse(JSON.stringify(payload.data));
  },
};

const actions = {
};

export default {
  state,
  getters,
  mutations,
  actions,
};

import Context from '@/api/context';
import Router from '@/router';
import Devices from '@/api/devices';

const state = {
  context: [],
  currentContext: {
    devices: [],
  },
  freeDevices: [],
};

const getters = {
  getContexts: _state => _state.context,
  getContext: _state => _state.currentContext,
  getFreeDevices: _state => _state.freeDevices,
};

const mutations = {
  setFreeDevices(_state, payload) {
    // eslint-disable-next-line
    _state.freeDevices = payload.filter(device => device.context === null);
  },
  addDeviceToContext(_state, payload) {
    // eslint-disable-next-line
    _state.freeDevices = _state.freeDevices.filter(item => item.id !== payload.id);

    const context = { ..._state.currentContext };

    if (Array.isArray(context.devices)) {
      context.devices = [payload, ...context.devices.filter(item => item.id !== payload.id)];
    } else {
      context.devices = [payload];
    }

    // eslint-disable-next-line
     _state.currentContext = context;
  },
  removeDeviceFromContext(_state, payload) {
    // eslint-disable-next-line
    _state.freeDevices = [payload, ..._state.freeDevices];

    const context = { ...state.currentContext };

    context.devices = [...context.devices.filter(item => item.id !== payload.id)];

    // eslint-disable-next-line
     _state.currentContext = context;
  },
  createContext(_state, payload) {
    // eslint-disable-next-line
    _state.context = [payload, ..._state.context];
  },
  updateContext(_state, payload) {
    // eslint-disable-next-line
    _state.currentContext = payload;
  },
  setCurrentContext(_state, payload) {
    // eslint-disable-next-line
    _state.currentContext = payload;
  },
  setContexts(_state, payload) {
    // eslint-disable-next-line
    _state.context = payload;
  },
  deleteContext(_state, payload) {
    // eslint-disable-next-line
    _state.context = _state.context.filter(c => c.id !== payload.id);
  },
};

const actions = {
  addDeviceToContext(context, payload) {
    Devices.updateDeviceContext(payload.device.id, payload.context.id)
      .then(() => {
        context.commit('addDeviceToContext', payload.device);
      });
  },
  removeDeviceFromContext(context, payload) {
    Devices.updateDeviceContext(payload.device.id, null)
      .then(() => {
        context.commit('removeDeviceFromContext', payload.device);
      });
  },
  getFreeDevices(context) {
    Devices.getDevices('getDevices')
      .then((data) => {
        context.commit('setFreeDevices', data.data.devices);
      });
  },
  getContexts(context) {
    Context.getContexts()
      .then((data) => {
        context.commit('setContexts', data.data.contexts || []);
      });
  },
  updateContext(context, payload) {
    Context.updateContext(payload.id, payload.name, payload.surveyID)
      .then((data) => {
        context.commit('updateContext', data.data.updateContext.context);
      });
  },
  getContext(context, payload) {
    Context.getContext(payload.id)
      .then((data) => {
        context.commit('setCurrentContext', data.data.context);
      });
  },
  createContext(context, payload) {
    Context.createContext(payload.name)
      .then((data) => {
        context.commit('createContext', data.data.createContext.context);
        Router.push('/context');
      });
  },
  deleteContext(context, payload) {
    Context.deleteContext(payload.id)
      .then(() => {
        context.commit('deleteContext', payload);
      });
  },
};

export default {
  state,
  getters,
  mutations,
  actions,
};

import Devices from '@/api/devices';
import Router from '@/router';

const state = {
  devices: [],
  currentDevice: {},
};

const getters = {
  getDevices: _state => _state.devices,
  getDevice: _state => _state.currentDevice,
};

const mutations = {
  setCurrentDevice(_state, payload) {
    // eslint-disable-next-line
    _state.currentDevice = payload;
  },
  setDevices(_state, payload) {
    // eslint-disable-next-line
    _state.devices = payload;
  },
};

const actions = {
  updateDevice(context, payload) {
    Devices.updateDevice(payload.id, payload.name)
      .then((data) => {
        context.commit('setCurrentDevice', data.data.updateDevice.device);
        Router.push('/devices');
      });
  },
  getDevice(context, payload) {
    Devices.getDevice(payload.id)
      .then((data) => {
        context.commit('setCurrentDevice', data.data.device);
      });
  },
  getDevices(context) {
    Devices.getDevices()
      .then((data) => {
        context.commit('setDevices', data.data.devices);
      });
  },
};

export default {
  state,
  getters,
  mutations,
  actions,
};

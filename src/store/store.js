import Vue from 'vue';
import Vuex from 'vuex';
import Survey from '@/store/modules/survey';
import Devices from '@/store/modules/devices';
import Context from '@/store/modules/context';
import User from '@/store/modules/user';
import Auth from '@/store/modules/auth';
import Errors from '@/store/modules/error';

Vue.use(Vuex);

export default new Vuex.Store({
  strict: true,
  modules: {
    survey: Survey,
    user: User,
    context: Context,
    devices: Devices,
    auth: Auth,
    error: Errors,
  },
});

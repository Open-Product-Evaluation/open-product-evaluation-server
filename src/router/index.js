import Vue from 'vue';
import Router from 'vue-router';

// account
import LoginForm from '@/components/account/LoginForm';
import RegisterForm from '@/components/account/RegisterForm';
import ProfileForm from '@/components/account/ProfileForm';

// survey
import Survey from '@/components/survey/Survey';
import SurveyList from '@/components/survey/SurveyList';
import SurveyFormNew from '@/components/survey/SurveyFormNew';

// user
import UserList from '@/components/user/UserList';
import UserNewForm from '@/components/user/UserNewForm';
import UserEdit from '@/components/user/UserEdit';

// context
import ContextList from '@/components/context/ContextList';
import ContextNew from '@/components/context/ContextNew';
import ContextEdit from '@/components/context/ContextEdit';

// devices
import DeviceList from '@/components/device/DeviceList';
import DeviceEdit from '@/components/device/DeviceEdit';

// images
import ImagesNew from '@/components/images/ImagesNew';

// app
import AppWrapper from '@/components/AppWrapper';
import store from '@/store/store';

Vue.use(Router);

const loginGuard = (to, from, next) => {
  if (store.state.auth.currentUser === null) {
    next('/');
  } else {
    next();
  }
};

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Login',
      component: LoginForm,
      beforeEnter: (to, from, next) => {
        if (store.state.auth.currentUser !== null) {
          next('/survey');
        } else {
          next();
        }
      },
    },
    {
      path: '/register',
      name: 'Register',
      component: RegisterForm,
    },
    {
      path: '/survey',
      component: AppWrapper,
      beforeEnter: loginGuard,
      children: [
        {
          path: '',
          name: 'SurveyList',
          component: SurveyList,
        },
        {
          path: 'new',
          name: 'SurveyNew',
          component: SurveyFormNew,
        },
        {
          path: ':id',
          name: 'Survey',
          component: Survey,
        },
        {
          path: ':id/images/new',
          name: 'ImagesNew',
          component: ImagesNew,
        },
      ],
    },
    {
      path: '/context',
      component: AppWrapper,
      children: [
        {
          path: '',
          name: 'ContextList',
          component: ContextList,
        },
        {
          path: 'new',
          name: 'ContextNew',
          component: ContextNew,
        },
        {
          path: 'edit/:id',
          name: 'ContextEdit',
          component: ContextEdit,
        },
      ],
    },
    {
      path: '/devices',
      component: AppWrapper,
      children: [
        {
          path: '',
          name: 'DeviceList',
          component: DeviceList,
        },
        {
          path: 'edit/:id',
          name: 'DeviceEdit',
          component: DeviceEdit,
        },
      ],
    },
    {
      path: '/profile',
      component: AppWrapper,
      children: [
        {
          path: '',
          name: 'Profile',
          component: ProfileForm,
        },
      ],
    },
    {
      path: '/user',
      component: AppWrapper,
      children: [
        {
          path: '',
          name: 'UserList',
          component: UserList,
        },
        {
          path: 'new',
          name: 'UserNew',
          component: UserNewForm,
        },
        {
          path: 'edit/:id',
          name: 'UserEdit',
          component: UserEdit,
        },
      ],
    },
  ],
});

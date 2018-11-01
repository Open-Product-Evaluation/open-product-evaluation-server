<template>

  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">

      <!-- Brand -->
      <a class="navbar-brand" href="/#/survey">OPE</a>
      <button
        class="navbar-toggler"
        type="button"
        @click="showNavigation = !showNavigation;">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse"
        :class="{'show': showNavigation}"
        id="navbarSupportedContent">

        <!-- Menu Items -->
        <ul class="navbar-nav mr-auto">
          <li class="nav-item"
            :class="{'active':page().includes(link.key)}"
            v-for="link in links" :key="link.title">
            <a class="nav-link"
              v-bind:href="link.url"
              @click="showNavigation = !showNavigation;">{{ link.title }}</a>
          </li>
        </ul>


        <!-- User Items -->
        <ul class="navbar-nav my-2 my-lg-0">
          <li class="nav-item dropdown">

            <a class="nav-link dropdown-toggle"
              href="#"
              @click="toggleNavigation"
              :class="{'show': showDropdown }"
              v-on:blur="toggleNavigation">
              {{ user.user.firstName + ' ' + user.user.lastName }} <span class="caret"></span>
            </a>

            <div class="dropdown-menu dropdown-menu-right"
            :class="{'show': showDropdown}" >

              <a class="dropdown-item" href="#" @click="openProfile">Profile</a>
              <a class="dropdown-item" href="#" @click="logout">Logout</a>
            </div>

          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters } from 'vuex';
import Router from '@/router';

export default {
  name: 'NavBar',
  data() {
    return {
      links: [
        {
          title: 'Surveys',
          url: '/#/survey',
          key: 'Survey',
        },
        {
          title: 'Contexts',
          url: '/#/context',
          key: 'Context',
        },
        {
          title: 'Devices',
          url: '/#/devices',
          key: 'Device',
        },
        {
          title: 'Users',
          url: '/#/user',
          key: 'User',
        },
      ],
      showNavigation: false,
      showDropdown: false,
    };
  },
  computed: {
    ...mapGetters({
      user: 'getCurrentUser',
    }),
  },
  methods: {
    page() {
      return this.$router.currentRoute.name;
    },
    toggleNavigation(event) {
      event.preventDefault();
      this.showDropdown = !this.showDropdown;
    },
    logout(event) {
      event.preventDefault();
      this.$store.dispatch('logout').then(() => this.$router.replace('/'));
    },
    openProfile(event) {
      event.preventDefault();
      this.showNavigation = !this.showNavigation;
      Router.push('/profile');
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.navbar { margin-bottom: 1.5rem; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02); }

.navbar-brand { color: #1691d0; }

.navbar-toggler { outline: none; }

@media(max-width: 991px) {
  .active .nav-link { color: #1691d0 !important; }
}

@media(min-width: 992px) {

  .active .nav-link { border-bottom: 3px solid #1691d0; }

  .navbar {
    border-bottom: 1px solid #DFDFDF;
    padding: 0 1rem;
    background-color: #FFFFFF !important;

    .nav-link, .dropdown-item {
      padding: 1rem !important;
      border-bottom: 3px solid #FFFFFF;
      transition: border .4s, color .4s;

      &:hover {
        border-bottom: 3px solid #1691d0;
        background-color: transparent !important;
      }
    }

    .dropdown {
      &:hover .dropdown-menu{ display: block; }

      .navlink:hover { border-bottom: 3px solid #FFFFFF; }

      .dropdown-item {
        border-top: 1px solid #DFDFDF;
        padding: .75rem 1.5rem;
        transition: background-color .3s, border .4s, color .4s;
        color: rgba(0,0,0,.5);

        &:first-child { border-top: 0; }

        &:hover { color: rgba(0,0,0,.7); }

        &:active { background-color: #1691d0; }
      }

      .dropdown-menu {
        margin: 0;
        padding: 0;
        border: 1px solid #DFDFDF;
        border-radius: 0;
      }
    }
  }
}
</style>

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
          <li class="nav-item active">
            <a class="nav-link"
              href="/#/survey"
              @click="showNavigation = !showNavigation;">
              Surveys
            </a>
          </li>
          <li class="nav-item active">
            <a class="nav-link"
              href="/#/context"
              @click="showNavigation = !showNavigation;">
              Contexts
            </a>
          </li>
          <li class="nav-item active">
            <a class="nav-link"
              href="/#/devices"
              @click="showNavigation = !showNavigation;">
              Devices
            </a>
          </li>
          <li class="nav-item active">
            <a class="nav-link"
              href="/#/user"
              v-if="currentUser.user.isAdmin"
              @click="showNavigation = !showNavigation;">
              Users
            </a>
          </li>
        </ul>
        <!-- User Items -->
        <ul class="navbar-nav my-2 my-lg-0">
          <li class="nav-item dropdown">

            <a class="nav-link dropdown-toggle"
              href="#"
              @click="toggleNavigation"
              :class="{'show': showDropdown}" >
              {{ currentUser.user.firstName}} {{currentUser.user.lastName}}
              <span class="caret"></span>
            </a>

            <div class="dropdown-menu"
            :class="{'show': showDropdown}" >

              <a class="dropdown-item" href="#" v-on:click="openProfile()">Profile</a>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" href="#" v-on:click="logout">Logout</a>
            </div>

          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import Router from '@/router';

export default {
  name: 'NavBar',
  data() {
    return {
      showNavigation: false,
      showDropdown: false,
    };
  },
  methods: {
    toggleNavigation(event) {
      event.preventDefault();
      this.showDropdown = !this.showDropdown;
    },
    logout(event) {
      event.preventDefault();
      this.$store.dispatch('logout').then(() => this.$router.replace('/'));
    },
    openProfile() {
      event.preventDefault();
      this.showDropdown = !this.showDropdown;
      Router.push('/profile');
    },
  },
  computed: {
    currentUser() {
      return this.$store.getters.getCurrentUser;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .navbar {
    margin-bottom: 1.5rem;
  }
</style>

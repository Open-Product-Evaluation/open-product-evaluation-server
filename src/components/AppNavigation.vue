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
          <li class="nav-item active" v-for="link in links" :key="link.title">
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
              :class="{'show': showDropdown}" >
              Account <span class="caret"></span>
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
      links: [
        {
          title: 'Surveys',
          url: '/#/survey',
        },
        {
          title: 'Contexts',
          url: '/#/context',
        },
        {
          title: 'Devices',
          url: '/#/devices',
        },
        {
          title: 'Users',
          url: '/#/user',
        },
      ],
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
    user() {
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

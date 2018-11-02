<template>
  <div class="card">
    <div class="card-body">

      <div class="row">

        <div class="col-sm-8"></div>

        <div class="col-sm-4">
          <form class="search-form">
            <input
              type="text"
              class="form-control"
              v-model="search"
              placeholder="Search..." />
          </form>
        </div>
      </div>

      <p class="text-center" v-if="users && users.length === 0">
        There are no users.
      </p>

      <p class="alert alert-info"
        v-if="filteredUsers.length === 0 && users.length !== 0">
        This search returned no results.
      </p>

      <div class="row">
        <div class="col-12">
          <div class="list-group">

            <div class="list-group-item"
              v-for="user in filteredUsers"
              :key="user.id">

              <div class="row" style="display: flex; align-items: center">
                <div class="col-6 col-sm-3">{{ user.firstName }}</div>
                <div class="col-6 col-sm-3">{{ user.lastName }}</div>
                <div class="col-6 col-sm-3">{{user.email }}</div>
                <div class="col-6 col-sm-3 text-right">
                  <a v-bind:href="'/#/user/edit/' + user.id" class="btn btn-link">Edit</a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>

export default {
  name: 'UserList',
  data() {
    return {
      search: '',
    };
  },
  created() {
    this.$store.dispatch('getUsers');
  },
  computed: {
    filteredUsers() {
      return this.users.filter(
        users => (users.firstName.toLowerCase() + users.lastName
          .toLowerCase()).includes(this.search.toLowerCase()),
      );
    },
    users() {
      return this.$store.getters.getUsers;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

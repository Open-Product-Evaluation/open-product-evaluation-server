<template>
  <div class="container">

    <div class="card">
      <div class="card-header">
        Update Profile
      </div>
      <div class="card-body">
        <form @submit.prevent="updateProfile">
          <div class="form-group">
            <label for="input_firstname">Firstname</label>
            <input
              type="text"
              name="firstname"
              class="form-control"
              v-model="user.firstName"
              id="input_firstname" />
          </div>

          <div class="form-group">
            <label for="input_lastname">Lastname</label>
            <input
              type="text"
              name="lastname"
              class="form-control"
              v-model="user.lastName"
              id="input_lastname" />
          </div>

          <div class="form-group">
            <label for="input_email">E-Mail</label>
            <input
              type="email"
              name="email"
              class="form-control"
              v-model="user.email"
              id="input_email" />
          </div>


          <div class="form-group">
            <label for="input_password">Password</label>
            <input
              type="password"
              name="password"
              class="form-control"
              v-model="user.password"
              id="input_password" />
          </div>

          <div class="form-group">
            <button type="submit" class="btn btn-primary">Update</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileForm',
  created() {
    this.$store.dispatch('getCurrentUser', {
      id: this.$store.getters.getCurrentUser.user.id,
    });
  },
  computed: {
    user() {
      return JSON.parse(JSON.stringify(this.$store.getters.getUser));
    },
  },
  methods: {
    updateProfile() {
      this.$store.dispatch('updateProfile', this.user);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

<template>
  <div class="card">
    <div class="card-header">Edit User</div>
    <div class="card-body">

      <form @submit.prevent="updateUser">

        <div class="form-group">
          <label for="input_firstname">Firstname</label>
          <input type="text"
            name="firstname"
            id="input_firstname"
            class="form-control"
            v-model="user.firstName"
            disabled="disabled" />
        </div>

        <div class="form-group">
          <label for="input_lastname">Lastname</label>
          <input
            type="text"
            name="lastname"
            id="input_lastname"
            class="form-control"
            v-model="user.lastName"
            disabled="disabled" />
        </div>

        <div class="form-group">
          <label for="input_email">E-Mail</label>
          <input type="text"
            name="email"
            id="input_email"
            v-model="user.email"
            class="form-control" />
        </div>

        <!--<div class="form-group">
          <label for="input_rights">Rechte</label>
          <select name="rights" id="input_rights" class="form-control">
            <option value="0" selected="selected">User</option>
            <option value="1">Administrator</option>
          </select>
        </div>-->

        <div class="form_group">
          <button type="submit" class="btn btn-primary">Update</button>
        </div>

      </form>

    </div>
  </div>
</template>

<script>

export default {
  name: 'UserEdit',
  created() {
    this.$store.dispatch('getUser', {
      id: this.$route.params.id,
    });
  },
  computed: {
    user() {
      return JSON.parse(JSON.stringify(this.$store.getters.getUser));
    },
  },
  methods: {
    updateUser(event) {
      event.preventDefault();
      this.$store.dispatch('updateUser', this.user);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

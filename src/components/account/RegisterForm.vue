<template>
  <div class="center-container">
    <form id="login" method="post" @submit="register">
      <div class="card">
        <div class="card-body">

          <div v-if="error" class="alert alert-warning">
            {{error.graphQLErrors[0].message}}
          </div>

          <div class="form-group">
            <label for="input_firstname">Firstname</label>
            <input type="text"
              class="form-control"
              id="input_firstname"
              v-model="firstname" />
          </div>

          <div class="form-group">
            <label for="input_lastname">Lastname</label>
            <input type="text"
              class="form-control"
              id="input_lastname"
              v-model="lastname" />
          </div>

          <div class="form-group">
            <label for="input_email">E-Mail</label>
            <input type="text"
              id="input_email"
              class="form-control"
              v-model="email" />
          </div>

          <div class="form-group">
            <label for="input_password">Password</label>
            <input type="password"
              class="form-control"
              id="input_password"
              v-model="password" />
          </div>

          <div class="form-group">
            <label for="input_password_repeat">Repeat password</label>
            <input type="password"
              class="form-control"
              id="input_password_repeat"
              v-model="password_repeat" />
          </div>

          <div class="form-group row">
            <div class="col-sm-6">
              <a :href="/#/" class="btn btn-default">Back</a>
            </div>
            <div class="col-sm-6 text-right">
              <button class="btn btn-primary">Register</button>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'RegisterForm',
  data() {
    return {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      password_repeat: '',
    };
  },
  computed: {
    error() {
      return this.$store.getters.getError('register');
    },
  },
  methods: {
    register(event) {
      event.preventDefault();

      this.$store.dispatch('register', {
        firstname: JSON.parse(JSON.stringify(this.firstname)),
        lastname: JSON.parse(JSON.stringify(this.lastname)),
        email: JSON.parse(JSON.stringify(this.email)),
        password: JSON.parse(JSON.stringify(this.password)),
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

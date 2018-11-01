<template>
  <div class="center-container">
    <form id="recover-form" method="post" @submit="login">

      <div class="card">

        <div class="card-body">

          <div v-if="error" class="alert alert-warning">
            {{error.graphQLErrors[0].message}}
          </div>

          <div class="form-group">
              <label for="input_email">E-Mail</label>
              <input type="text"
                name="email"
                id="input_email"
                class="form-control"
                v-model="email" />
          </div>

          <div class="form-group">
            <label for="input_password">Password</label>
              <input type="password"
                name="password"
                id="input_password"
                class="form-control"
                v-model="password" />
          </div>

          <div class="form-group text-center">
              <button class="btn btn-primary" id="login-button">Login</button>
          </div>
        </div>

        <div class="card-footer text-center">
            No Account? <a href="/#/register">Register!</a>
        </div>

      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
    };
  },
  computed: {
    error() {
      return this.$store.getters.getError('login');
    },
  },
  methods: {
    login(event) {
      event.preventDefault();

      this.$store.dispatch('login', {
        email: JSON.parse(JSON.stringify(this.email)),
        password: JSON.parse(JSON.stringify(this.password)),
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped="scoped">
#login {
    width: 100%;
    max-width: 400px;
    padding: 0 15px;
    margin: 0px auto;
}

#login-button {
  width: 100%;
}
</style>

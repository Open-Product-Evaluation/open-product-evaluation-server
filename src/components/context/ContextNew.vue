<template>
  <div class="card">
    <div class="card-header">
      Create Context
    </div>

    <div class="card-body">

      <form @submit.prevent="createContext">

        <div class="form-group">
          <label for="input_name">Name</label>
          <input
            type="text"
            name="name"
            v-model="context.name"
            class="form-control" />
        </div>

        <div class="form-group">
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>

    </div>

  </div>
</template>

<script>
export default {
  name: 'ContextNew',
  data() {
    return {
      context: {},
    };
  },
  methods: {
    createContext(event) {
      event.preventDefault();
      this.$store.dispatch('createContext', this.context);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

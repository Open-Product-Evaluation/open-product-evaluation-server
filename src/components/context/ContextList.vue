<template>
  <div class="card">
    <div class="card-body">

      <div class="row">
          <div class="col-sm-8">
            <div class="btn-group form-group">
              <a href="/#/context/new" class="btn btn-primary">New Context</a>
            </div>
          </div>
          <div class="col-sm-4">
              <form class="search-form">
                  <input type="text"
                    class="form-control"
                    v-model="search"
                    placeholder="Search..." />
              </form>
          </div>
      </div>

      <p class="text-center" v-if="contexts && contexts.length === 0">
        There are no contexts.
      </p>

      <p class="alert alert-info"
        v-if="filteredContexts.length === 0 && contexts.length !== 0">
        This search returned no results.
      </p>

      <div class="card context" v-for="context in filteredContexts" :key="context.id">
        <div class="card-header">
          {{ context.name }}
        </div>

        <div class="row">
          <div class="col-12 col-sm-8">
            <div class="card-body">
              <strong class="card-title" v-if="context.activeSurvey">Active Survey</strong>
              <p class="card-text" v-if="context.activeSurvey">
                {{ context.activeSurvey.title }}
              </p>
              <strong class="card-title" v-if="context.activeQuestion">Active Question</strong>
              <p class="card-text" v-if="context.activeQuestion">
                {{ context.activeQuestion.value }}
              </p>
              <strong class="card-title" v-if="context.devices">Devices</strong>
              <ul class="card-text">
                  <li :key="device.id" v-for="device in context.devices" v-if="context.devices">
                    {{ device.name }}
                  </li>

              </ul>
            </div>
          </div>
          <div class="col-12 col-sm-4 options">
            <div class="card-body">
                <a v-bind:href="'/#/context/edit/' + context.id" class="card-link">Edit</a>
                <a href="#"
                  class="card-link"
                  v-on:click="deleteContext($event, context.id)">Remove</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContextList',
  data() {
    return {
      search: '',
    };
  },
  created() {
    this.$store.dispatch('getContexts');
  },
  computed: {
    filteredContexts() {
      return this.contexts.filter(
        context => context.name.toLowerCase().includes(this.search.toLowerCase()),
      );
    },
    contexts() {
      return this.$store.getters.getContexts;
    },
  },
  methods: {
    deleteContext(event, id) {
      event.preventDefault();
      this.$store.dispatch('deleteContext', { id });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .options { border-left: 1px solid rgba(0,0,0,.125) }

  .context { margin-bottom: 2rem; }

  @media(max-width: 575px) {
    .options {
      border-left: none;
    }
  }
</style>

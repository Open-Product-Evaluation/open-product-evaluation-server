<template>
  <div>
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

      <p class="alert alert-info"
        v-if="filteredContexts.length === 0 && contexts.length !== 0">
        This search returned no results.
      </p>

      <div class="row">
        <div class="col-4 d-flex align-items-stretch" v-for="context in filteredContexts" :key="context.id">

      <div class="card context">
        <div class="card-header">
          {{ context.name }}
        </div>

            <div class="card-body">
              <strong class="card-title" v-if="context.activeSurvey">Active Survey</strong>
              <p class="card-text" v-if="context.activeSurvey">
                {{ context.activeSurvey.title }}
              </p>
              <strong class="card-title" v-if="context.activeQuestion">Active Question</strong>
              <p class="card-text" v-if="context.activeQuestion">
                {{ context.activeQuestion.value }}
              </p>
              <strong class="card-title" v-if="context && context.devices && context.devices > 0">Devices</strong>
              <ul class="card-text" v-if="context && context.devices && context.devices > 0">
                  <li :key="device.id" v-for="device in context.devices" v-if="context.devices">
                    {{ device.name }}
                  </li>
              </ul>
              <div class="card-links" style="align-items: flex-end;">
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

  .card-body {
    display: flex;
    flex-direction: column;
  }

  .card-links:last-child {
    margin-top: auto;
  }
</style>

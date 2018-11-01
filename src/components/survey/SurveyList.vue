<template>
  <div class="card">
    <div class="card-body">

        <div class="row">

          <div class="col-sm-8">
            <div class="btn-group form-group">
              <a href="/#/survey/new" class="btn btn-primary">New Survey</a>
            </div>
          </div>

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

        <p class="text-center" v-if="surveys.length === 0">
          There are no surveys.
        </p>

        <p class="alert alert-info"
          v-if="filteredSurveys.length === 0 && surveys.length !== 0">
          This search returned no results.
        </p>

        <div class="row">
          <div class="col-12">
            <div class="list-group">

              <div class="list-group-item survey-item"
                v-for="survey in filteredSurveys"
                v-bind:key="survey.id">
                <div class="row align-center">
                  <div class="col-sm-6">
                    <h5>{{ survey.title }}</h5>
                    <p class="description d-none d-md-block">
                      {{ survey.description }}
                    </p>
                  </div>
                  <div class="col-3 col-sm-3 text-center is-public">
                    <span class="badge badge-success" v-if="survey.isPublic">public</span>
                    <span class="badge badge-secondary" v-if="!survey.isPublic">private</span>
                  </div>
                  <div class="col-9 col-sm-3">
                    <span class="float-right text-right">
                      <a
                        v-bind:href="'/#/survey/' + survey.id"
                        class="btn btn-link">Details</a>
                      <a href="#"
                        v-on:click="deleteSurvey($event, survey.id);"
                        class="btn btn-link">Remove</a>
                    </span>
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
  name: 'SurveyNew',
  data() {
    return {
      search: '',
    };
  },
  created() {
    this.$store.dispatch('getSurveys');
  },
  computed: {
    filteredSurveys() {
      return this.surveys.filter(
        survey => survey.title.toLowerCase().includes(this.search.toLowerCase()),
      );
    },
    surveys() {
      return this.$store.getters.getSurveys;
    },
  },
  methods: {
    deleteSurvey(event, surveyID) {
      event.preventDefault();
      this.$store.dispatch('deleteSurvey', {
        id: surveyID,
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .description { margin-bottom: 0px; color: grey; }

  @media(max-width: 576px) {
    .is-public { text-align: left !important; }
  }
</style>

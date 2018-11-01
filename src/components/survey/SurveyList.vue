<template>
  <form class="surveylist" >

    <!-- actions -->
    <div class="row">

      <div class="col-sm-6" v-if="!grid">
        <div class="btn-group form-group">
          <a href="/#/survey/new" class="btn btn-primary">New Survey</a>
        </div>
      </div>

      <div class="col-md-6 form-group list-controls ml-auto">
        <input type="text" class="form-control"
          v-model="search"
          placeholder="Search..." />

          <div class="btn-group">
            <a href="#" class="btn" @click="grid = true" :class="{ 'active' : grid, 'btn-secondary': !grid, 'btn-primary': grid }">
              <span class="oi oi-grid-three-up"></span>
            </a>
            <a href="#" class="btn" @click="grid = false":class="{ 'active' : !grid, 'btn-secondary': grid, 'btn-primary': !grid}">
              <span class="oi oi-list"></span>
            </a>
          </div>
      </div>
    </div>
    <!-- // actions -->


    <!-- no surveys note -->
    <p class="text-center" v-if="surveys === 0">
      There are no surveys.
    </p>
    <!-- // no surveys note -->


    <!-- no results note -->
    <p class="alert alert-info"
      v-if="filteredSurveys.length === 0 && surveys.length !== 0">
      This search returned no results.
    </p>
    <!-- // no results note -->


    <!-- surveys -->
    <div class="row">
      <div class="col-12">

        <div class="row" v-if="grid">
          <div class="col-12 col-sm-6 col-lg-4 d-flex align-items-stretch">
            <div class="card new-survey">
                <a href="/#/survey/new">
                  <span class="oi oi-plus"></span>
                  <span class="new-survey-text">New Survey</span>
                </a>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-lg-4 d-flex align-items-stretch"
            v-for="survey in filteredSurveys"
            :key="survey.id">
            <div class="card">
              <div class="card-body">
                <h5>
                  <!--<span class="badge badge-success" v-if="survey.isPublic">public</span>
                  <span class="badge badge-secondary" v-if="!survey.isPublic">private</span>-->
                  {{ survey.title }}
                </h5>
                <p>
                  {{ survey.description }}
                </p>
                <a :href="'/#/survey/' + survey.id" class="card-link">Details</a>
                <a href="#" class="card-link"
                  @click="deleteSurvey($event, survey.id);">Remove</a>
              </div>
            </div>
          </div>
        </div>

        <div class="list-group" v-if="!grid">
          <div class="list-group-item survey-item align-center"
          style="display: flex;"
            v-for="survey in filteredSurveys"
            :key="survey.id">


              <div class="is-public" style="flex: 1;">
                <span class="badge badge-success" v-if="survey.isPublic">public</span>
                <span class="badge badge-secondary" v-if="!survey.isPublic">private</span>
              </div>

              <div style="flex: 3;">{{ survey.title }}</div>

              <div class="text-right" style="flex: 1;">
                  <a :href="'/#/survey/' + survey.id" class="btn btn-link">Details</a>
                  <a href="#" class="btn btn-link"
                    @click="deleteSurvey($event, survey.id);">Remove</a>
              </div>
            </div>

        </div>
      </div>
    </div>
    <!-- // surveys -->

  </form>
</template>

<script>

export default {
  name: 'SurveyNew',
  data() {
    return {
      search: '',
      grid: true,
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
<style scoped lang="scss">
  .description { margin-bottom: 0px; color: grey; }

  @media(max-width: 576px) {
    .is-public { text-align: left !important; }
  }

  .list-controls { display: flex; }
  .list-controls .btn-group { flex: 1; margin-left: 1rem; }

  .card {
    margin-bottom: 2rem;

    &:hover {
      border: 1px solid rgba(0,0,0,.18);
    }
  }

  a {
    color: #1094d4;
  }

  .btn-primary {
    border: 1px solid #1094d4 !important;
    background-color: #1094d4 !important;
  }

  .btn:focus {
    box-shadow: none !important;
  }

  .btn-group a {
    color: #FFF;
    outline: none;
  }

  .new-survey {
    width: 100%;
    margin-bottom: 2rem;

      a {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        color: #1094d4;
        flex: 1 1 auto;

        &:hover {
          text-decoration: none;
          color: #0287c7;
        }
      }

      .oi-plus {
        font-size: 32px;
        margin-bottom: 1rem;
      }
  }
</style>

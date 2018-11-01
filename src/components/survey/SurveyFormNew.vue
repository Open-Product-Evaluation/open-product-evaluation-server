<template>

  <div class="card">

    <div class="card-header">
      Create New Survey
    </div>

    <div class="card-body">

      <form @submit.prevent="createSurvey">

        <div class="form-group">
          <label for="input_title">Title</label>
          <input class="form-control"
            name="title"
            v-model="survey.title"
            id="input_title" />
        </div>

        <div class="form-group">
          <label for="input_description">Description</label>
          <textarea
            class="form-control"
            name="description"
            v-model="survey.description"
            id="input_description"
            rows="5"></textarea>
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
  name: 'SurveyNew',
  data() {
    return {
      survey: {},
    };
  },
  methods: {
    createSurvey() {
      this.$store.dispatch('createSurvey', {
        ...this.survey,
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

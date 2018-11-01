<template>
  <form>

    <p class="alert alert-warning" v-if="survey.isPublic">
      You can only edit private surveys.
    </p>

    <div class="form-group">
      <form @submit.prevent="updateSurvey">

        <div class="form-group">
          <label for="input_title">Title</label>
          <input class="form-control"
            name="title"
            id="input_title"
            :disabled="survey.isPublic"
            v-model="form.title" />
        </div>

        <div class="form-group">
          <label for="input_description">Description</label>
          <textarea
            class="form-control"
            name="description"
            id="input_description"
            rows="5"
            :disabled="survey.isPublic"
            v-model="form.description"></textarea>
        </div>

        <div class="form-group">
          <label for="visiblity">Visiblity</label>
          <select class="form-control"
            id="visiblity"
            name="visiblity"
            v-model="form.isPublic">
            <option value="true">Public</option>
            <option value="false">Private</option>
          </select>
        </div>

        <div class="form-group">
          <button type="submit" class="btn btn-primary">Update</button>
        </div>
      </form>
    </div>
  </form>
</template>

<script>
export default {
  name: 'SurveyEdit',
  created() {
    this.$store.dispatch('getSurvey', {
      surveyID: this.$route.params.id,
    });
  },
  methods: {
    updateSurvey() {
      this.$store.dispatch('updateSurvey', {
        id: this.$route.params.id,
        ...this.form,
      });
    },
  },
  computed: {
    form() {
      return JSON.parse(JSON.stringify(this.$store.getters.getSurvey));
    },
    survey() {
      return JSON.parse(JSON.stringify(this.$store.getters.getSurvey));
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

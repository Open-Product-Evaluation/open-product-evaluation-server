<template>
  <div class="question-list" v-bind:class="{empty : questions.length === 0}">

    <p class="alert alert-warning" v-if="survey.isPublic">
      You can only edit private surveys.
    </p>

    <div class="form-group">
      <button type="button"
        class="btn btn-primary"
        @click="addQuestion"
        :disabled="survey.isPublic"
        id="add-question">New Question
      </button>
    </div>

    <p class="empty-message" v-if="questions.length === 0">
      This survey does not have any questions.
    </p>

    <form id="question-form" v-if="questions.length > 0" enctype="multipart/form-data" novalidate>

      <div class="questions">
        <question-item
          :id="question.id"
          v-for="(question, index) in questions"
          :key="question.id"
          v-on:click.native="toggle(index)"
          :selected="position === index"></question-item>
      </div>
    </form>

  </div>
</template>

<script>
import QuestionItem from '@/components/question/QuestionItem';

export default {
  name: 'Questions',
  components: {
    'question-item': QuestionItem,
  },
  data() {
    return {
      position: 0,
      button: null,
    };
  },
  methods: {
    addQuestion() {
      this.$store.dispatch('createQuestion', {
        surveyID: this.$route.params.id,
      });
    },
    toggle(index) {
      this.position = index;
    },
  },
  computed: {
    questions() {
      return JSON.parse(JSON.stringify(this.$store.getters.getQuestions));
    },
    survey() {
      return JSON.parse(JSON.stringify(this.$store.getters.getSurvey));
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .question-list { border-bottom: 1px solid #dee2e6; }

  .question-list > .list-group-item { padding-right: 0; padding-left: 0; }
</style>

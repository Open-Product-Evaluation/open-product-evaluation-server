<template>
  <div class="favorite">

    <div class="form-group description">
      <label>Description</label>
      <textarea name="description"
        class="form-control"
        @change="updateQuestion"
        rows="3"
        v-model="question.description"
        :disabled="survey.isPublic"></textarea>
    </div>

    <items :id="question.id" v-if="question.items"></items>

    <div class="actions">

      <a href="#"
        class="btn btn-link"
        @click="addItem($event, question)"
        :class="{ 'disabled': survey.isPublic }">New Item</a>

      <a href="#"
        class="btn btn-secondary float-right"
        :class="{ 'disabled': survey.isPublic }"
        @click="deleteQuestion(id, $event)">
        <span class="oi oi-trash"></span>
      </a>

      <!--<a href="#" class="btn btn-link">Bilder hinzufügen</a>-->
    </div>

  </div>
</template>

<script>
import Items from '@/components/question/Items';

export default {
  name: 'FavoriteOptions',
  props: {
    id: String,
  },
  components: {
    items: Items,
  },
  computed: {
    question() {
      return JSON.parse(JSON.stringify(this.$store.getters.getQuestion(this.id)));
    },
    survey() {
      return JSON.parse(JSON.stringify(this.$store.getters.getSurvey));
    },
  },
  methods: {
    deleteQuestion(questionID, event) {
      event.preventDefault();
      this.$store.dispatch('deleteQuestion', {
        questionID: this.id,
      });
    },
    addItem(event, question) {
      event.preventDefault();

      this.$store.dispatch('createItem', {
        question,
      });
    },
    updateItem(question, item) {
      this.$store.dispatch('updateItem', {
        question,
        item,
      });
    },
    deleteItem(event, question, item) {
      event.preventDefault();

      this.$store.dispatch('deleteItem', {
        question,
        item,
      });
    },
    updateQuestion() {
      this.$store.dispatch('updateQuestion', {
        surveyID: this.$route.params.id,
        question: this.question,
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  .image-container {
    padding-top: 50%;
    background-color: grey;
    margin-right: 15px;
    border-radius: .25rem;
    background-size: cover;
  }

  .remove-question-image { position: absolute; top: -15px; right: 15px; }

  .image-row { margin-top: 2rem; }

  .items { margin-bottom: 2rem; }
</style>

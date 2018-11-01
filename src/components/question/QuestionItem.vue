<template>
  <div class="question" v-bind:class="{ selected: selected }">

    <!-- start default stuff -->

    <div class="form-row">

      <div class="form-group col-sm-8">
        <label>Question</label>
        <input type="text"
          class="form-control"
          v-model="question.value"
          @change="updateQuestion"
          :disabled="survey.isPublic" />
      </div>

      <div class="form-group col-sm-4" v-if="this.selected">
          <label>Type</label>
          <select class="form-control"
            v-model="question.type"
            :disabled="survey.isPublic"
            @change="changeQuestionType(question)">
              <option value="LIKE"
                v-bind:selected="this.question.type === 'LIKE'">
                Like
              </option>
              <option value="LIKEDISLIKE"
                v-bind:selected="this.question.type === 'LIKEDISLIKE'">
                Dislike
              </option>
              <option value="CHOICE"
                v-bind:selected="this.question.type === 'CHOICE'">
                Choice
              </option>
              <option value="REGULATOR"
                v-bind:selected="this.question.type === 'REGULATOR'">
                Regulator
              </option>
              <option value="RANKING"
                v-bind:selected="this.question.type === 'RANKING'">
                Ranking
              </option>
              <option value="FAVORITE"
                v-bind:selected="this.question.type === 'FAVORITE'">
                Favorite
              </option>
          </select>
      </div>

    </div>

    <div class="options clearfix">

      <like-options
        v-if="this.question.type === 'LIKE'"
        :id="question.id"></like-options>

      <dislike-options
        v-if="this.question.type === 'LIKEDISLIKE'"
        :id="question.id"></dislike-options>

      <choice-options
        v-if="this.question.type === 'CHOICE'"
        :id="question.id"></choice-options>

      <ranking-options
        v-if="this.question.type === 'RANKING'"
        :id="question.id"></ranking-options>

      <favorite-options
        v-if="this.question.type === 'FAVORITE'"
        :id="question.id"></favorite-options>

      <regulator-options
        v-if="this.question.type === 'REGULATOR'"
        :id="question.id"></regulator-options>

    </div>

  </div>
</template>

<script>
import ChoiceOptions from '@/components/question/ChoiceOptions';
import RankingOptions from '@/components/question/RankingOptions';
import FavoriteOptions from '@/components/question/FavoriteOptions';
import RegulatorOptions from '@/components/question/RegulatorOptions';
import LikeOptions from '@/components/question/LikeOptions';
import DislikeOptions from '@/components/question/DislikeOptions';

export default {
  name: 'QuestionItem',
  props: {
    id: String,
    selected: Boolean,
  },
  components: {
    'choice-options': ChoiceOptions,
    'ranking-options': RankingOptions,
    'favorite-options': FavoriteOptions,
    'regulator-options': RegulatorOptions,
    'like-options': LikeOptions,
    'dislike-options': DislikeOptions,
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
    updateQuestion() {
      this.$store.dispatch('updateQuestion', {
        question: this.question,
      });
    },
    changeQuestionType(question) {
      this.$store.dispatch('changeQuestionType', {
        question,
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  .question {
    border-top: 1px solid #dee2e6;
    padding-top: 1rem;
    padding: 1rem;
    border-left: 1px solid #dee2e6;
    border-right: 1px solid #dee2e6;
    cursor: pointer;
  }


  .selected { background-color: #f7f7f7; cursor: auto; }

  .question:not(.selected) .description  { display: none; }

  .question:not(.selected) .actions { display: none; }

  .question:not(.selected) .options { display: none; }
</style>

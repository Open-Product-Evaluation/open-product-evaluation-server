<template>
  <div class="results">

    <div class="row" v-if="votes.length > 0">

      <div class="col-sm-12">
        <div class="form-row">
          <div class="col-auto">
            <div class="btn-group">
              <button type="button" class="btn btn-primary" @click="previous">
                <span class="oi oi-chevron-left"></span>
              </button>
              <button type="button" class="btn btn-primary" @click="next">
                <span class="oi oi-chevron-right"></span>
              </button>
            </div>
          </div>
          <div class="col-auto form-row form-group">
            <div class="col-auto">
              <input type="text" name="page" class="form-control" size="3" v-model="page" />
            </div>
            <div class="col-auto align-center">
                <em>of {{ votes.length }} results</em>
            </div>
          </div>
        </div>
      </div>

      <!--<div class="col-sm-6">
        <form class="search-form">
          <input
            type="text"
            class="form-control"
            placeholder="Suche..." />
        </form>
      </div>-->
    </div>

    <div class="list-group" v-if="votes.length > 0">
      <div class="list-group-item"
        v-for="answer in votes[currentVote].answers"
        :key="answer.question">

        <div class="choiceanswer" v-if="answer.__typename === 'ChoiceAnswer'">

          <strong>{{ getQuestion(answer.question).value }}</strong><br />

          <span v-if="getQuestion(answer.question).items">
            Number of Items: {{ getQuestion(answer.question).items.length }}
            <br />
          </span>

          <span v-if="answer.choice !== null">
            Selected Choice: {{ getChoice(answer.question, answer.choice).label }}
          </span>

          <span v-if="answer.choice === null">Selected Choice: none</span>

        </div>

        <div class="likeanswer" v-if="answer.__typename === 'LikeAnswer'">

          <strong>{{ getQuestion(answer.question).value }}</strong><br />

          <span v-if="getQuestion(answer.question).items">
            Number of Items: {{ getQuestion(answer.question).items.length }}
            <br />
          </span>

          <span v-if="answer.liked !== null">Selected Answer: Like</span>
          <span v-if="answer.liked === null">Selected Answer: none</span>

        </div>

        <div class="likedislikeanswer" v-if="answer.__typename === 'LikeDislikeAnswer'">

          <strong>{{ getQuestion(answer.question).value }}</strong><br />

          <span v-if="getQuestion(answer.question).items">
            Number of Items: {{getQuestion(answer.question).items.length }}
            <br />
          </span>

          <span v-if="answer.liked !== null && answer.liked === true">
            Selected Answer: Like
          </span>

          <span v-if="answer.liked !== null && answer.liked === false">
            Selected Answer: Dislike
          </span>

          <span v-if="answer.liked === null">Selected Answer: none</span>
        </div>

        <div class="regulatoranswer" v-if="answer.__typename === 'RegulatorAnswer'">

          <strong>{{ getQuestion(answer.question).value }}</strong><br />

          <span v-if="getQuestion(answer.question).items">
            Number of Items: {{getQuestion(answer.question).items.length }}
            <br />
          </span>

          <span v-if="answer.rating !== null">
            Selected Answer: {{ answer.rating}}
          </span>
          <span v-if="answer.rating === null">Selected Answer: none</span>
        </div>

        <div class="rankinganswer" v-if="answer.__typename === 'RankingAnswer'">
          <strong>{{ getQuestion(answer.question).value }}</strong><br />
          <p>
            Selected Ranking:
          </p>
          <ol v-if="answer.rankedItems !== null">
            <li v-for="item in answer.rankedItems"
              :key="item"
              @click="showRankedPreview($event, item)">
              <a href="#" >{{ getItem(answer.question, item).label }}</a>
            </li>
          </ol>
          <span v-if="answer.rankedItems === null">Selected Answer: none</span>

          <div
            v-for="item in answer.rankedItems"
            :key="item"
            v-if="answer.rankedItems !== null">
            <div class="preview"
              :id="'preview' + answer.question"
              :class="{ 'show' : showRankedItems.find(i => i === item)}">
              <a href="#"
                class="close-preview btn btn-primary"
                @click="closeRankedPreview($event, item)">
                <span class="oi oi-x"></span>
              </a>
              <div class="preview-image"
                v-bind:style="{
                  'background-image': 'url(' + getItem(answer.question, item).image.url + ')'
                }">
              </div>
            </div>
          </div>
        </div>

        <div class="favoriteanswer" v-if="answer.__typename === 'FavoriteAnswer'">

          <a href="#"
            class="btn btn-primary btn-sm float-right preview-btn"
            v-if="answer.favoriteItem !== null"
            @click="showPreview($event, answer.question)">
            <span class="oi oi-image"></span>
          </a>
          <div class="preview"
            :id="'preview' + answer.question"
            :class="{ 'show' : show.find(item => item === answer.question)}"
            v-if="answer.favoriteItem !== null">
            <a href="#"
              class="close-preview btn btn-primary"
              @click="closePreview($event, answer.question)">
              <span class="oi oi-x"></span>
            </a>
            <div class="preview-image"
              v-bind:style="{
                'background-image': 'url(' +
                  getItem(answer.question, answer.favoriteItem).image.url + ')'
              }">
            </div>
          </div>

          <strong>{{ getQuestion(answer.question).value }}</strong><br />

          <span v-if="getQuestion(answer.question).items">
            Number of Items: {{getQuestion(answer.question).items.length }}<br />
          </span>

          <span v-if="answer.favoriteItem !== null">
            Selected Favorite: {{ getItem(answer.question, answer.favoriteItem).label}}
          </span>

          <span v-if="answer.favoriteItem === null">Selected Favorite: none</span>
        </div>

      </div>
    </div>

    <div class="text-center" v-if="votes.length <= 0">
      Es wurden noch keine Ergebnisse erfasst.
    </div>
  </div>
</template>

<script>
export default {
  name: 'Results',
  data() {
    return {
      page: 1,
      currentVote: 0,
      show: [],
      showRankedItems: [],
    };
  },
  computed: {
    votes() {
      return this.$store.getters.getVotes;
    },
  },
  methods: {
    getQuestion(questionID) {
      return this.$store.getters.getQuestion(questionID);
    },
    getItem(questionID, itemID) {
      const question = this.$store.getters.getQuestion(questionID);

      if (question.items) {
        return question.items.find(i => i.id === itemID);
      }

      return {};
    },
    getChoice(questionID, choiceID) {
      const question = this.$store.getters.getQuestion(questionID);

      if (question.choices) {
        return question.choices.find(i => i.id === choiceID);
      }

      return {};
    },
    showRankedPreview(event, item) {
      event.preventDefault();
      this.showRankedItems.push(item);
    },
    closeRankedPreview(event, item) {
      event.preventDefault();
      this.showRankedItems = this.showRankedItems.filter(i => i !== item);
    },
    closePreview(event, questionID) {
      event.preventDefault();
      this.show = this.show.filter(item => item !== questionID);
    },
    showPreview(event, questionID) {
      event.preventDefault();
      this.show.push(questionID);
    },
    next() {
      if (this.page !== this.votes.length) {
        this.currentVote += 1;
        this.page += 1;
      }

      if (this.page > this.votes.length) {
        this.page = this.votes.length;
        this.currentVote = (this.votes.length - 1);
      }

      this.show = [];
      this.showRankedItems = [];
    },
    previous() {
      if (this.page > 1 && this.page <= this.votes.length + 1) {
        this.currentVote -= 1;
        this.page -= 1;
      }

      if (this.page <= 1) {
        this.page = 1;
        this.currentVote = 0;
      }

      this.show = [];
      this.showRankedItems = [];
    },
  },
  watch: {
    page(value) {
      if (value >= 1 && value <= this.votes.length) {
        this.page = value;
        this.currentVote = value - 1;
      } else if (value > this.votes.length + 1) {
        this.currentVote = this.votes.length - 1;
      } else if (value < 1) {
        this.currentVote = 0;
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .preview {
    background-color: rgba(0, 0, 0, 0.3);
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    padding: 5%;
    z-index: 99999;
    display: none;
  }

  .preview-image {
    width: 100%;
    background-size: cover;
    padding-top: 50%;
    border-radius: .25rem;
  }

  .close-preview {
    position: absolute;
    right: 5%;
  }

  .show {
    display: block;
  }
</style>

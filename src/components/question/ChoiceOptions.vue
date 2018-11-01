<template>
  <div class="choices">

    <div class="form-group description">
      <label>Description</label>
      <textarea name="description"
        class="form-control"
        @change="updateQuestion"
        rows="3"
        v-model="question.description"
        :disabled="survey.isPublic"></textarea>
    </div>

    <div class="choices" v-if="question.choices && question.choices.length > 0">
      <div class="form-group">
        <label>Choices</label>

        <div class="row image-row" v-if="question.choices && question.choices.length > 0"
          v-for="choice in question.choices"
          :key="choice.code">
          <div class="col-sm-7">
            <div class="row">

              <div class="col">
                <div class="input-group form-group">
                  <!--<div class="input-group-prepend">
                    <div class="input-group-text switch-container">
                      <label class="switch" :class="{ 'disabled': survey.isPublic }">
                        <input type="checkbox">
                        <span class="slider round"></span>
                      </label>
                    </div>
                  </div>-->

                  <input type="text"
                    class="form-control"
                    v-model="choice.label"
                    placeholder="Label"
                    @change="updateChoice(question, choice)"
                    :disabled="survey.isPublic" />

                    <!--<a href="#" class="btn btn-secondary">
                      <span class="oi oi-image"></span>
                    </a>-->

                  <div class="input-group-append">
                      <a href="#"
                        class="btn btn-primary"
                        @click="deleteChoice($event, question, choice)"
                        :class="{ 'disabled': survey.isPublic }">
                        <span class="oi oi-x"></span>
                      </a>
                  </div>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col">
                <div class="input-group form-group">
                  <input type="text"
                    class="form-control"
                    name="code"
                    placeholder="Code"
                    @change="updateChoice(question, choice)"
                    v-model="choice.code"
                    :disabled="survey.isPublic" />
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col">
                <div class="input-group form-group">
                  <input type="file"
                    class="form-control image-upload-input"
                    :ref="'file-' + choice.id"
                    @change="fileChanged(choice.id)"
                    accept="image/*"
                    :disabled="survey.isPublic" />

                  <div class="input-group-append">
                    <a href="#"
                      class="btn btn-primary"
                      @click="uploadChoiceImage($event, question.id, choice.id)"
                      :class="{ 'disabled': survey.isPublic }">Upload</a>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <div class="col-sm-5">
            <div class="image-container" v-if="choice.image"
              v-bind:style="{ 'background-image': 'url(' + choice.image.url + ')' }"></div>

            <div class="image-container-empty" v-if="!choice.image">
              <span class="no-image-text">no image</span>
            </div>
          </div>

        </div>
      </div>
    </div>

    <items :id="question.id" v-if="question.items"></items>

    <div class="actions">
      <a href="#"
        class="btn btn-link"
        @click="addChoice(id, $event)"
        :class="{ 'disabled': survey.isPublic }">
        New Choice
      </a>

      <a href="#"
        class="btn btn-link"
        @click="addItem($event, question)"
        :class="{ 'disabled': survey.isPublic }">New Item</a>

      <a href="#"
        :class="{ 'disabled': survey.isPublic }"
        @click="deleteQuestion(id, $event)"
        class="btn btn-secondary float-right">
        <span class="oi oi-trash"></span>
      </a>

    </div>
  </div>
</template>

<script>
import Items from '@/components/question/Items';

export default {
  name: 'ChoiceOptions',
  props: {
    id: String,
  },
  data() {
    return {
      file: '',
    };
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
    updateQuestion() {
      this.$store.dispatch('updateQuestion', {
        surveyID: this.$route.params.id,
        question: this.question,
      });
    },
    deleteQuestion(questionID, event) {
      event.preventDefault();
      this.$store.dispatch('deleteQuestion', {
        questionID: this.id,
      });
    },
    fileChanged(choiceID) {
      this.file = this.$refs[`file-${choiceID}`][0].files[0];
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
    uploadChoiceImage(event, questionID, choiceID) {
      event.preventDefault();

      this.$store.dispatch('uploadChoiceImage', {
        questionID,
        choiceID,
        file: this.file,
      });
    },
    deleteItem(event, question, item) {
      event.preventDefault();

      this.$store.dispatch('deleteItem', {
        question,
        item,
      });
    },
    addChoice(id, event) {
      event.preventDefault();

      this.$store.dispatch('createChoice', {
        question: this.question,
      });
    },
    updateChoice(question, choice) {
      this.$store.dispatch('updateChoice', {
        question,
        choice,
      });
    },
    deleteChoice(event, question, choice) {
      event.preventDefault();

      this.$store.dispatch('deleteChoice', {
        question,
        choice,
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .actions a:first-child { padding-left: 0px; }

  .image-row { margin-bottom: 2rem; }

  .items { margin-bottom: 2rem; }

.switch-container {
  padding: .375rem;
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 19px;
  margin-bottom: 0px;
}

  .disabled > input:checked + .slider:before { transform: translateX(0) !important;}

  .disabled > input:checked + .slider { background-color: #ccc; }

/* Hide default HTML checkbox */
.switch input {display:none;}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 15px;
  width: 15px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(20px);
  -ms-transform: translateX(20px);
  transform: translateX(20px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

  .image-container {
    padding-top: 50%;
    background-color: grey;
    border-radius: .25rem;
    background-size: cover;
    background-position: center;
  }

  .image-container-empty {
    padding-top: 50%;
    background-color: lightgrey;
    border-radius: .25rem;
    background-size: cover;
    position: relative;
  }

  .no-image-text {
    position: absolute;
    top: 0;
    text-align: center;
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    flex-direction: column;
    color: grey;
  }

  .remove-question-image { position: absolute; top: -15px; right: 15px; }
</style>

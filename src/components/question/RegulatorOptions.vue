<template>
  <div class="regulator">

    <div class="form-group description">
      <label>Description</label>
      <textarea name="description"
        class="form-control"
        @change="updateQuestion"
        rows="3"
        v-model="question.description"
        :disabled="survey.isPublic"></textarea>
    </div>

    <div class="form-row">

      <div class="form-group col-sm-3">
        <label>From</label>
        <input type="text"
          name="min"
          class="form-control"
          v-model="question.min"
          @change="updateRegulatorQuestion"
          :disabled="survey.isPublic" />
      </div>

      <div class="form-group col-sm-3">
        <label>To</label>
        <input type="text"
          name="max"
          class="form-control"
          v-model="question.max"
          @change="updateRegulatorQuestion"
          :disabled="survey.isPublic" />
      </div>

      <div class="form-group col-sm-3">
        <label>Stepsize</label>
        <input name="stepsize"
          class="form-control"
          v-model="question.stepSize"
          @change="updateRegulatorQuestion"
          :disabled="survey.isPublic" />
      </div>

      <div class="form-group col-sm-3">
        <label>Default</label>
        <input name="default"
          class="form-control"
          v-model="question.default"
          @change="updateRegulatorQuestion"
          :disabled="survey.isPublic" />
      </div>

    </div>

    <label v-if="question.labels && question.labels.length > 0">Labels</label>
    <div class="label row"
       v-if="question.labels.length > 0"
      v-for="label in question.labels"
      :key="label.id">

      <div class="col-sm-7">
        <div class="form-row">
          <div class="form-group col-sm-4">
            <input type="text"
              class="form-control"
              placeholder="value"
              v-model="label.value"
              @change="updateLabel(question, label)"
              :disabled="survey.isPublic" />
          </div>

          <div class="form-group col-sm-8">
            <div class="input-group">
              <input type="text"
                class="form-control"
                placeholder="label"
                v-model="label.label"
                @change="updateLabel(question, label)"
                :disabled="survey.isPublic" />
              <div class="input-group-append">
                <a href="#"
                  class="btn btn-primary"
                  @click="removeLabel($event, question, label)"
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
              <input type="file"
                class="form-control image-upload-input"
                :ref="'file-' + label.id"
                @change="fileChanged(label.id)"
                accept="image/*"
                :disabled="survey.isPublic" />

              <div class="input-group-append">
                <a href="#"
                  class="btn btn-primary"
                  @click="uploadLabelImage($event, question.id, label.id)"
                  :class="{ 'disabled': survey.isPublic }">Upload</a>
              </div>
            </div>
          </div>
        </div>

      </div>


      <div class="col-sm-5">
        <!--<a href="#"
          class="btn btn-primary remove-question-image"
          :class="{ 'disabled': survey.isPublic }"
          v-if="item.image">
          <span class="oi oi-x"></span>
        </a>-->

        <div class="image-container" v-if="label.image"
          v-bind:style="{ 'background-image': 'url(' + label.image.url + ')' }"></div>

        <div class="image-container-empty" v-if="!label.image">
          <span class="no-image-text">no image</span>
        </div>
      </div>
    </div>

    <items :id="question.id" v-if="question.items"></items>

    <div class="actions">

      <a href="#"
        class="btn btn-link"
        @click="addLabel($event, question)"
        :class="{ 'disabled': survey.isPublic }">
        New Label
      </a>

      <a href="#"
        class="btn btn-link"
        @click="addItem($event, question)"
        :class="{ 'disabled': survey.isPublic }">New Item</a>

      <!--<a href="#" class="btn btn-link">Bilder hinzufügen</a>-->

      <a href="#"
        class="btn btn-secondary float-right"
        @click="deleteQuestion(id, $event)"
        :class="{ 'disabled': survey.isPublic }">
        <span class="oi oi-trash"></span>
      </a>

    </div>
  </div>
</template>

<script>
import Items from '@/components/question/Items';

export default {
  name: 'RegulatorOptions',
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
    fileChanged(labelID) {
      this.file = this.$refs[`file-${labelID}`][0].files[0];
    },
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
    updateRegulatorQuestion() {
      this.$store.dispatch('updateRegulatorQuestion', {
        surveyID: this.$route.params.id,
        question: this.question,
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
    addLabel(event, question) {
      event.preventDefault();

      this.$store.dispatch('createLabel', {
        question,
      });
    },
    updateLabel(question, label) {
      this.$store.dispatch('updateLabel', {
        question,
        label,
      });
    },
    removeLabel(event, question, label) {
      event.preventDefault();

      this.$store.dispatch('deleteLabel', {
        question,
        label,
      });
    },
    uploadLabelImage(event, questionID, labelID) {
      event.preventDefault();

      this.$store.dispatch('uploadLabelImage', {
        questionID,
        labelID,
        file: this.file,
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  .label {
    margin-bottom: 2rem;
  }

  .image-container {
    padding-top: 50%;
    background-color: grey;
    border-radius: .25rem;
    background-size: cover;
  }

  .image-container-empty {
    padding-top: 50%;
    background-color: lightgrey;
    border-radius: .25rem;
    background-size: cover;
    position: relative;
    background-position: center;
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

  .image-row { margin-top: 2rem; }

  .items { margin-bottom: 2rem; }
</style>

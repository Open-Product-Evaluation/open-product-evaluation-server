<template>
  <div class="items">
    <label v-if="question.items && question.items.length > 0">Items</label>
    <div class="items row"
      v-if="question.items && question.items.length > 0"
      v-for="item in question.items"
      :key="item.id">

      <div class="col-sm-7">
        <div class="row">
          <div class="col">
            <div class="input-group form-group">
              <input type="text"
                class="form-control"
                v-model="item.label"
                @change="updateItem(question, item)"
                :disabled="survey.isPublic" />

              <div class="input-group-append">

                <a href="#"
                  class="btn btn-primary"
                  @click="deleteItem($event, question, item)"
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
                :ref="'file-' + item.id"
                @change="fileChanged(item.id)"
                accept="image/*"
                :disabled="survey.isPublic" />

              <div class="input-group-append">
                <a href="#"
                  class="btn btn-primary"
                  @click="uploadItemImage($event, question.id, item.id)"
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
        <div class="image-container" v-if="item.image"
          v-bind:style="{ 'background-image': 'url(' + item.image.url + ')' }"></div>

        <div class="image-container-empty" v-if="!item.image">
          <span class="no-image-text">no image</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'Items',
  props: {
    id: String,
  },
  data() {
    return {
      file: '',
    };
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
    fileChanged(itemID) {
      this.file = this.$refs[`file-${itemID}`][0].files[0];
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
    uploadItemImage(event, questionID, itemID) {
      event.preventDefault();

      this.$store.dispatch('uploadItemImage', {
        questionID,
        itemID,
        file: this.file,
      });
    },
  },
};
</script>


<style scoped="">

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

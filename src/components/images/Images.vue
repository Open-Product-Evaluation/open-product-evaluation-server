<template>
  <div>

    <p class="alert alert-warning" v-if="survey.isPublic">
      You can only edit private surveys.
    </p>

    <div class="row form-group">
      <div class="col-6">
        <a :href="'/#/survey/' + survey.id + '/images/new'"
          class="btn btn-primary"
          :class="{ 'disabled': survey.isPublic }">New Image</a>
      </div>

      <div class="col-6">
        <form>
          <input
            type="text"
            class="form-control"
            v-model="search"
            placeholder="Search..." />
        </form>
      </div>

    </div>

    <p class="alert alert-info"
      v-if="filteredImages.length === 0 && images.length !== 0">
      This search returned no results.
    </p>

    <div class="row">
      <div
        class="col-sm-6 col-md-4 col-lg-3"
        v-for="image in filteredImages" :key="image.id">
        <div class="card">

          <a href="#"
            class="btn btn-primary remove-question-image"
            @click="deleteImage($event, image.id)"
            :class="{ 'disabled': survey.isPublic }">
            <span class="oi oi-x"></span>
          </a>
          <div class="image-container"
            v-bind:style="{ 'background-image': 'url(' + image.url + ')' }"></div>

          <div class="card-body">
            <h5>{{ image.name }}</h5>
            <a href="#"
              class="card-link"
              v-for="(tag, index) in image.tags"
              :key="`rag-${index}`">
              #{{tag}}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'Images',
  data() {
    return {
      search: '',
    };
  },
  computed: {
    filteredImages() {
      return this.images.filter(
        image => image.name.toLowerCase().includes(this.search.toLowerCase()),
      );
    },
    ...mapGetters({
      images: 'getImages',
      survey: 'getSurvey',
    }),
  },
  methods: {
    deleteImage(event, id) {
      event.preventDefault();

      this.$store.dispatch('deleteImage', {
        id,
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  .image-container {
    padding-top: 100%;
    background-color: grey;
    border-radius: .25rem;
    background-size: cover;
  }

  .card {
    margin-bottom: 2rem;
  }


  .remove-question-image { position: absolute; top: 0; right: 0; }
</style>

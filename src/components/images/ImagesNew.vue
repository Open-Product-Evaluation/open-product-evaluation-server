<template>
  <div class="card">
    <div class="card-header">Upload New Image</div>

    <div class="card-body">

      <form enctype="multipart/form-data" novalidate @submit.prevent="createImage">

        <div class="form-group">
          <label>Image</label>
          <input type="file"
            class="form-control image-upload-input"
            ref="file"
            @change="fileChanged"
            accept="image/*" />
        </div>

        <div class="form-group">
          <vue-tags-input
            v-model="tag"
            :tags="tags"
            @tags-changed="newTags => tags = newTags"
          />
        </div>


        <div class="form-group">
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>

    </div>

  </div>
</template>

<script>
import VueTagsInput from '@johmun/vue-tags-input';

export default {
  name: 'ImageNew',
  data() {
    return {
      tag: '',
      tags: [],
      file: '',
    };
  },
  components: {
    VueTagsInput,
  },
  created() {
    this.$store.dispatch('getSurvey', {
      surveyID: this.$route.params.id,
    });
  },
  computed: {
    survey() {
      return this.$store.getters.getSurvey;
    },
  },
  methods: {
    fileChanged() {
      this.file = this.$refs.file.files[0];
    },
    createImage() {
      this.$store.dispatch('createImage', {
        id: this.$route.params.id,
        file: this.file,
        tags: this.tags,
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

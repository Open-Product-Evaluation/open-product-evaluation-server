<template>
  <div class="modal" role="dialog" :class="{ 'show' : showModal }">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button"
            class="close"
            aria-label="Close"
            @click="close"
            v-if="closable">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    id: {
      type: String,
      required: true,
    },
    centered: {
      type: Boolean,
      default: false,
    },
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
      required: true,
    },
    closable: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    showModal: {
      get() {
        return this.show;
      },
      set(newValue) {
        this.show = newValue;
      },
    },
  },
  methods: {
    close(event) {
      event.preventDefault();
      this.showModal = false;
    },
  },
};
</script>

<style scoped>
  .show { display: block; }
</style>

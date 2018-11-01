<template>
  <div class="tab-pane" :class="{ 'active' : isActive}">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'Tab',
  data() {
    return {
      isActive: false,
    };
  },
  props: {
    id: String,
    name: { required: true },
    selected: { default: false },
  },
  mounted() {
    this.isActive = this.selected;
  },
  computed: {
    url() {
      return `#${this.$route.path}`; // + '/' + this.name.toLowerCase().replace(/ /g, '-');
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

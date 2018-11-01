<template>
  <div class="tabs">
    <div class="card">
      <div class="card-header">
        <ul class="nav nav-tabs nav-justified card-header-tabs">

          <li class="nav-item"
            v-for="tab in tabs"
            :class="{ 'active' : tab.isActive}"
            :key="tab.name">
            <a :id="tab.id"
               class="nav-link"
              :href="tab.url"
              @click="selectedTab(tab)"
              :class="{ 'active' : tab.isActive}">

              {{ tab.name }}

            </a>
          </li>

        </ul>
      </div>

      <div class="card-body">
        <div class="tab-content">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Tabs',
  data() {
    return {
      tabs: [],
    };
  },
  created() {
    this.tabs = this.$children;
  },
  methods: {
    selectedTab(selectedTab) {
      this.tabs.forEach((tab) => { // eslint-disable-next-line
        tab.isActive = (tab.name === selectedTab.name);
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  @media(max-width: 575.98px) {
    .nav-link { padding: .5rem; }
  }
</style>

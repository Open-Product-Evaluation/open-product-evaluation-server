<template>
  <div>
    <app-navigation></app-navigation>

    <div class="container content">

      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import AppNavigation from '@/components/AppNavigation';

export default {
  name: 'AppWrapper',
  components: {
    'app-navigation': AppNavigation,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

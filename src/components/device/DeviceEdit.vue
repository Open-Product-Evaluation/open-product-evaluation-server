<template>
  <div class="card">
    <div class="card-header">Edit Device</div>

    <div class="card-body">

        <form @submit.prevent="updateDevice">

        <div class="form-group">
          <label for="input_name">Name</label>
          <input
            type="text"
            name="name"
            v-model="device.name"
            class="form-control" />
        </div>

        <div class="form-group" v-if="isOwner(device.owners, currentUser.id)">
          <div class="list-group" v-if="device.owners">
            <div class="list-group-item"
              v-for="owner in device.owners"
              :key="owner.id">
              {{ owner.firstName + ' ' + owner.lastName }}
              <a href="#" class="float-right">
                <span class="oi oi-x"></span>
              </a>
            </div>
          </div>
        </div>

        <div class="form-group">
          <button type="submit" class="btn btn-primary">Update</button>
        </div>
      </form>

    </div>

  </div>
</template>

<script>
export default {
  name: 'DeviceEdit',
  created() {
    this.$store.dispatch('getDevice', {
      id: this.$route.params.id,
    });
  },
  computed: {
    device() {
      return JSON.parse(JSON.stringify(this.$store.getters.getDevice));
    },
    currentUser() {
      return this.$store.getters.getCurrentUser.user;
    },
    users() {
      return this.$store.getters.getUsers;
    },
  },
  methods: {
    updateDevice(event) {
      event.preventDefault();
      this.$store.dispatch('updateDevice', this.device);
    },
    isOwner(owners, id) {
      if (!Array.isArray(owners)) {
        return false;
      }

      const result = owners.filter(owner => owner.id === id);

      return result.length > 0;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.col-new-user { flex: 1; }

</style>

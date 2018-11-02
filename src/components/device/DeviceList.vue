<template>
  <div class="card">
    <div class="card-body">

      <div class="row">

        <div class="col-sm-4 offset-sm-8">
          <form class="search-form">
            <input
              type="text"
              class="form-control"
              v-model="search"
              placeholder="Search..." />
          </form>
        </div>
      </div>

      <p class="text-center" v-if="devices && devices.length === 0">
        There are no devices.
      </p>

      <p class="alert alert-info"
        v-if="filteredDevices.length === 0 && devices.length !== 0">
        This search returned no results.
      </p>

        <div class="row">
          <div class="col-12">
            <div class="list-group">

              <div class="list-group-item survey-item"
                v-for="device in filteredDevices"
                v-bind:key="device.id">

                <div class="row" style="display: flex; align-items: center">
                  <div class="col-sm-6">
                    <h5>{{ device.name }}</h5>
                    <p style="margin-bottom: 0px; color: grey;" v-if="device.context">
                      {{ device.context.name }}
                    </p>
                    <p style="margin-bottom: 0px; color: grey;"  v-else>
                      no context
                    </p>
                  </div>

                  <div class="col-6 col-sm-4"
                    v-if="device.owners"
                    v-bind:key="owner.id"
                    v-for="owner in device.owners">

                    <span class="badge badge-primary"
                      v-if="owner.id === currentUser.id">
                      My Device
                    </span>
                    <span v-if="owner.id !== currentUser.id">
                      {{ device.owners.length }} Owner
                    </span>

                  </div>

                  <div class="col-6 col-sm-4" v-if="!device.owners">
                    No Owner
                  </div>

                  <div class="col-6 col-sm-2 text-right">
                    <a v-bind:href="'/#/devices/edit/' + device.id"
                        v-if="currentUser.isAdmin || isOwner(device.id, currentUser.id)"
                        class="btn btn-link">Edit</a>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
export default {
  name: 'DeviceList',
  data() {
    return {
      search: '',
    };
  },
  created() {
    this.$store.dispatch('getDevices');
  },
  computed: {
    filteredDevices() {
      return this.devices.filter(
        devices => devices.name.toLowerCase().includes(this.search.toLowerCase()),
      );
    },
    devices() {
      return this.$store.getters.getDevices;
    },
    currentUser() {
      return this.$store.getters.getCurrentUser.user;
    },
  },
  methods: {
    isOwner(deviceID, userID) {
      const device = this.devices.find(d => d.id === deviceID);

      if (!device) {
        return false;
      }

      if (!device.owners) {
        return false;
      }

      if (device.owners.length === 0) {
        return false;
      }

      const user = device.owners.filter(o => o.id === userID);

      if (user.length > 0) {
        return true;
      }

      return false;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

<template>
  <div class="card">
    <div class="card-header">Update Context</div>

    <div class="card-body">
      <form @submit.prevent="updateContext">

        <div class="form-group">
          <input
            type="text"
            name="name"
            class="form-control"
            v-model="context.name"
            placeholder="Name" />
        </div>

        <div class="form-group">

          <select class="form-control"
            v-if="context.activeSurvey"
            v-model="context.activeSurvey.id">
              <option value="null">No Survey</option>
              <option v-for="survey in surveys"
                v-bind:value="survey.id"
                :key="survey.id">{{ survey.title }}</option>
          </select>

          <select class="form-control" v-if="!context.activeSurvey" v-model="selectedSurvey">
            <option value="null">No Survey</option>
            <option v-for="survey in surveys"
              v-bind:value="survey.id"
              :key="survey.id">{{ survey.title }}</option>
          </select>
        </div>

        <div class="row">

          <!-- device card -->
          <div class="col-md-6 kanban-card">
            <div class="card">
              <div class="card-header">Free Devices</div>

              <ul class="list-group list-group-flush">

                  <li class="list-group-item d-flex flex-wrap
                  justify-content-between align-items-center"
                    v-for="device in freeDevices"
                    :key="device.id">

                    {{device.name}}

                    <a href="#" class="float-right" @click="add($event, device)">
                      <span class="oi oi-plus"></span>
                    </a>
                  </li>
              </ul>
            </div>
          </div>
          <!-- // device card -->


          <!-- survey card -->
          <div class="col-md-6 kanban-card">
            <div class="card">
              <div class="card-header">Devices in Context</div>

              <ul class="list-group list-group-flush">
                  <li class="list-group-item d-flex flex-wrap
                    justify-content-between align-items-center"
                    v-for="device in context.devices"
                    :key="device.id">

                    {{device.name }}

                    <a href="#" class="float-right" @click="remove($event, device)">
                      <span class="oi oi-x"></span>
                    </a>
                  </li>
              </ul>

            </div>
          </div>
          <!-- // survey card -->
        </div>

        <div class="form-group text-right">
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContextEdit',
  created() {
    this.$store.dispatch('getDevices');
    this.$store.dispatch('getSurveys');
    this.$store.dispatch('getContext', {
      id: this.$route.params.id,
    });
    this.$store.dispatch('getFreeDevices');
  },
  data() {
    return {
      selectedSurvey: null,
    };
  },
  methods: {
    add(event, device) {
      event.preventDefault();

      this.$store.dispatch('addDeviceToContext', {
        context: this.context,
        device,
      });
    },
    remove(event, device) {
      event.preventDefault();

      this.$store.dispatch('removeDeviceFromContext', {
        context: this.context,
        device,
      });
    },
    updateContext() {
      const payload = {
        id: this.context.id,
        name: this.context.name,
      };

      if (this.context.activeSurvey) {
        payload.surveyID = this.context.activeSurvey.id;
      } else {
        payload.surveyID = this.selectedSurvey;
      }

      this.$store.dispatch('updateContext', payload);
    },
  },
  computed: {
    devices() {
      let devices = JSON.parse(JSON.stringify(this.$store.getters.getDevices));
      devices = devices.filter(device => device.context === null);

      return devices;
    },
    contextSurvey() {
      const context = JSON.parse(JSON.stringify(this.$store.getters.getContext));

      if (context.activeSurvey) {
        return context.activeSurvey.id;
      }

      return null;
    },
    freeDevices() {
      return JSON.parse(JSON.stringify(this.$store.getters.getFreeDevices));
    },
    context() {
      return JSON.parse(JSON.stringify(this.$store.getters.getContext));
    },
    surveys() {
      return JSON.parse(JSON.stringify(this.$store.getters.getSurveys));
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" >
.min-height { min-height: 50px; }

.ghost { opacity: .5; background: #C8EBFB; }

.kanban-card { margin-bottom: 1rem; }

  .kanban-card ul { min-height: 3rem; }

.name-control .form-group { margin-right: 0.5rem; margin-bottom: 1rem; }

.name-control { justify-content: flex-end; }

.input-survey { flex: 1 !important; }

.name-control .form-group:first-child { flex: 1; }

.name-control .form-group input, .name-control .form-group select { width: 100%; }

.name-control .form-group:last-child { margin-right: 0; }

.help { padding-left: 1rem; padding-right: 1em; }

@media (min-width: 576px) {
  .move-to-context { display: none; }
}
</style>

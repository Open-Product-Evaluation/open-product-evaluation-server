<template>
  <div id="evaluation">
    <div class="row">
      <div class="col-12">
        <div class="btn-group mb-3">

          <div class="btn-group" role="group">
            <button id="btnGroupDrop1"
              type="button"
              class="btn btn-secondary dropdown-toggle"
              @click="toggleDevices()">
              Filter by Device
            </button>
            <div class="dropdown-menu" :class="{ 'show' : showDevices }">
              <a class="dropdown-item"
                href="#" @click="filterDevices($event, device)"
                :key="device.id"
                v-for="device in devices">{{ device.name }}</a>
            </div>
          </div>

          <div class="btn-group" role="group">
            <button id="btnGroupDrop2" type="button"
              class="btn btn-secondary dropdown-toggle" @click="toggleContexts()">
              Filter by Context
            </button>
            <div class="dropdown-menu" :class="{ 'show' : showContexts }">
              <a class="dropdown-item" href="#"
                @click="filterContexts($event, context)"
                :key="context.id"
                v-for="context in contexts">{{context.name }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <label>Von</label>
    <div class="form-inline mb-2">
        <input type="text"
          class="form-control mb-2 mr-sm-2" placeholder="DD" v-model="from.day" />
        <input type="text"
          class="form-control mb-2 mr-sm-2" placeholder="MM" v-model="from.month" />
        <input type="text"
          class="form-control mb-2 mr-sm-2" placeholder="YYYY" v-model="from.year" />
        <input type="text"
          class="form-control mb-2 mr-sm-3" placeholder="HH" v-model="from.hour" />
        <button type="button"
          class="btn btn-primary mb-2 mr-sm-2" @click="setFromDate()">Filter</button>
        <div class="input-group-append mb-2 mr-sm-2">
          <a href="#"
             class="btn btn-primary"
            @click="deleteFromEntries">
            <span class="oi oi-x"></span>
          </a>
        </div>
    </div>

    <label>Bis</label>
    <div class="form-inline mb-3">
      <input type="text"
        class="form-control mb-2 mr-sm-2" placeholder="DD" v-model="to.day"/>
      <input type="text"
        class="form-control mb-2 mr-sm-2" placeholder="MM" v-model="to.month" />
      <input type="text"
        class="form-control mb-2 mr-sm-2" placeholder="YYYY" v-model="to.year" />
      <input type="text"
        class="form-control mb-2 mr-sm-3" placeholder="HH" v-model="to.hour" />
      <button type="button"
        class="btn btn-primary mb-2 mr-sm-2" @click="setToDate()">Filter</button>
      <div class="input-group-append mb-2 mr-sm-2">
        <a href="#"
           class="btn btn-primary"
          @click="deleteToEntries">
          <span class="oi oi-x"></span>
        </a>
      </div>
    </div>

    <div class="card" v-for="(question, index) in questions" :key="question.id">
      <div class="card-header">Question: {{ question.value }}</div>

      <div class="card-body" style=" position: relative;">
        <div class="form-inline mb-3">
          <div class="legend" v-for="(label, i) in preparedData[index].labels"
               :key="i">
            <div class="legendField mb-2 mr-sm-2"
                 :id="'legendText-' + index + '-' + i"
                 @click="clickedLegendKey(label.key + '-' + index)"
                 @mouseover="hoverLegendKey(label.key + '-' + index)"
                 @mouseout="leftLegendKey(label.key + '-' + index)">
              <span class="legendColor"
                   :style="{'backgroundColor': preparedData[index].colors[i]}">
              </span>
              <div class="legendText">
                {{ label.label }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card-body" style=" position: relative;">

        <linechart :id="index" :data="preparedData"
                   :clickedKey="clickedKey"
                   :mouseOverKey="mouseOverKey"
                   :mouseOutKey="mouseOutKey"
        ></linechart>

      </div>

      <div class="card-body" style=" position: relative;">

        <chartCarousel :id="index"
                       :preparedData="preparedData"
                       :mouseOverKey="mouseOverKey"
                       :mouseOutKey="mouseOutKey"
        ></chartCarousel>

      </div>
    </div>
  </div>
</template>

<script>
import dataModifier from '@/utils/dataModifier';
import LineChartItem from '@/components/evaluation/LineChart';
import BarChartItem from '@/components/evaluation/BarChart';
import PieChartItem from '@/components/evaluation/PieChart';
import moment from 'moment';
import ChartCarousel from '@/components/evaluation/ChartCarousel';

export default {
  name: 'Visualization',
  components: {
    chartCarousel: ChartCarousel,
    linechart: LineChartItem,
    barchart: BarChartItem,
    piechart: PieChartItem,
  },
  data() {
    return {
      showContexts: false,
      showDevices: false,
      selectedContext: null,
      selectedDevice: null,
      from: {
        day: '',
        month: '',
        year: '',
        hour: '',
      },
      to: {
        day: '',
        month: '',
        year: '',
        hour: '',
      },
      fromDate: null,
      toDate: null,
      clickedKey: '',
      mouseOverKey: '',
      mouseOutKey: '',
    };
  },
  created() {
    this.$store.dispatch('getContexts');
    this.$store.dispatch('getDevices');
  },
  computed: {
    devices() {
      const { devices } = this.assignedData;
      const filteredDevices =
        this.$store.getters.getDevices.filter(device => devices.includes(device.id));
      filteredDevices.push({ id: null, name: 'No filter' });
      return filteredDevices;
    },
    contexts() {
      const { contexts } = this.assignedData;
      const filteredContexts =
        this.$store.getters.getContexts.filter(context => contexts.includes(context.id));
      filteredContexts.push({ id: null, name: 'No filter' });
      return filteredContexts;
    },
    questions() {
      return this.$store.getters.getQuestions;
    },
    assignedData() {
      const dm = dataModifier.createDataModifier();
      return dm.assignAnswersToQuestion(
        this.$store.getters.getQuestions,
        this.$store.getters.getVotes,
      );
    },
    preparedData() {
      const dm = dataModifier.createDataModifier();

      const data = dm.filterData(this.assignedData, {
        from: this.fromDate,
        until: this.toDate,
        context: this.selectedContext,
        device: this.selectedDevice,
      });

      return data;
    },
  },
  methods: {
    setToDate() {
      const dateString = `${this.to.year}-${this.to.month}-${this.to.day} ${this.to.hour}:00:00.000`;
      this.toDate = (moment(dateString, 'YYYY-MM-DD HH:mm:ss.SSS', true).isValid()) ? new Date(dateString) : null;
    },
    setFromDate() {
      const dateString = `${this.from.year}-${this.from.month}-${this.from.day} ${this.from.hour}:00:00.000`;
      this.fromDate = (moment(dateString, 'YYYY-MM-DD HH:mm:ss.SSS', true).isValid()) ? new Date(dateString) : null;
    },
    toggleDevices() {
      this.showDevices = !this.showDevices;
    },
    toggleContexts() {
      this.showContexts = !this.showContexts;
    },
    filterContexts(event, context) {
      event.preventDefault();
      this.showContexts = false;
      this.selectedContext = context.id;
    },
    filterDevices(event, device) {
      event.preventDefault();
      this.showDevices = false;
      this.selectedDevice = device.id;
    },
    deleteFromEntries() {
      this.fromDate = null;
      this.from.day = '';
      this.from.month = '';
      this.from.year = '';
      this.from.hour = '';
    },
    deleteToEntries() {
      this.fromDate = null;
      this.to.day = '';
      this.to.month = '';
      this.to.year = '';
      this.to.hour = '';
    },
    clickedLegendKey(label) {
      this.clickedKey = label;
      setTimeout(() => {
        this.clickedKey = '';
      }, 100);
    },
    hoverLegendKey(label) {
      this.mouseOverKey = label;
      setTimeout(() => {
        this.mouseOverKey = '';
      }, 100);
    },
    leftLegendKey(label) {
      this.mouseOutKey = label;
      setTimeout(() => {
        this.mouseOutKey = '';
      }, 100);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .card { margin-bottom: 1rem; }

  .show{display: block; }

  .legendColor{
    width: 10px;
    height: 10px;
    display: inline-block;
    pointer-events: none;
  }

  .legendText {
    display: inline-block;
    pointer-events: none;
  }
</style>

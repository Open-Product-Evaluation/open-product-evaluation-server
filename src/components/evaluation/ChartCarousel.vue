<template>

  <div class="card-body" style=" position: relative;">
    <div class="row">
      <div class="col-md-6 col-sm-12">
          <barchart :id="this.id"
                    :dataIndex="this.dataIndex"
                    :data="this.preparedData"
                    :mouseOverKey="this.mouseOverKey"
                    :mouseOutKey="this.mouseOutKey"
          ></barchart>
      </div>
      <div class="col-md-6 col-sm-12">
        <piechart :id="this.id"
                  :dataIndex="this.dataIndex"
                  :data="this.preparedData"
                  :mouseOverKey="this.mouseOverKey"
                  :mouseOutKey="this.mouseOutKey"
        ></piechart>
      </div>
    </div>
    <div class='' style="text-align: center;">
      <button class='btn btn-primary carouselElement  mb-2 mr-sm-2 float-left'
              :id="'prevButton-' + this.id" @click="previous">prev</button>
      <div class="carouselElement  mb-2 mr-sm-2" style="display: inline; margin: 0 auto;"
           :id="'carouselText-' + this.id">{{ this.activeTitle }}</div>
      <button class='btn btn-primary carouselElement  mb-2 mr-sm-2 float-right'
              :id="'nextButton-' + this.id" @click="next">next</button>
    </div>
  </div>
</template>

<script>
import BarChart from '@/components/evaluation/BarChart';
import PieChart from '@/components/evaluation/PieChart';

export default {
  name: 'ChartCarousel',
  components: {
    barchart: BarChart,
    piechart: PieChart,
  },
  props: {
    preparedData: Array,
    id: Number,
    mouseOverKey: String,
    mouseOutKey: String,
  },
  data() {
    return {
      dataIndex: 0,
      activeTitle: '',
    };
  },
  methods: {
    next() {
      const max = this.preparedData[this.id].barChart.statistics.length - 1;
      this.dataIndex = (this.dataIndex + 1 <= max) ? this.dataIndex + 1 : 0;
      this.setActiveTitle();
    },
    previous() {
      const max = this.preparedData[this.id].barChart.statistics.length - 1;
      this.dataIndex = (this.dataIndex - 1 >= 0) ? this.dataIndex - 1 : max;
      this.setActiveTitle();
    },
    setActiveTitle() {
      this.activeTitle = this.preparedData[this.id].barChart.statistics[this.dataIndex].label;
    },
  },
  watch: {
  },
  mounted() {
    if (this.preparedData[this.id].barChart.statistics.length === 1) {
      document.getElementById(`nextButton-${this.id}`).classList.add('hidden');
      document.getElementById(`prevButton-${this.id}`).classList.add('hidden');
      document.getElementById(`carouselText-${this.id}`).classList.add('hidden');
    } else {
      this.setActiveTitle();
    }
  },
  beforeDestroy() {
  },
};
</script>

<style scoped>
  .carouselElement.hidden {
    display:none;
  }
</style>

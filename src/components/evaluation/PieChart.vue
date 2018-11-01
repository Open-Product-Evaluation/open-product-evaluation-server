<template>
  <div class="pieChart svg-container" :id="'pieChart-' + this.id">

  </div>
</template>

<script>
import pieChart from '@/utils/pieChart';

export default {
  name: 'Visualization',
  props: {
    data: Array,
    id: Number,
    dataIndex: Number,
    mouseOverKey: String,
    mouseOutKey: String,
  },
  methods: {
    draw() {
      setTimeout(() => {
        const drawData = this.data[this.id].pieChart;
        this.lc.draw(drawData, this.dataIndex);
      }, 500);
    },
  },
  data() {
    return {
      lc: null,
    };
  },
  watch: {
    data: function setData(val) {
      this.data = val;
      this.draw();
    },
    dataIndex: function setData(val) {
      this.dataIndex = val;
      this.draw();
    },
    mouseOverKey: function click(val) {
      if (val !== '') {
        const parts = val.split('-');
        if (parseInt(parts[1], 10) === this.id) this.lc.dispatchMouseOver(parts[0]);
      }
    },
    mouseOutKey: function click(val) {
      if (val !== '') {
        const parts = val.split('-');
        if (parseInt(parts[1], 10) === this.id) this.lc.dispatchMouseOut(parts[0]);
      }
    },
  },
  mounted() {
    setTimeout(() => {
      const auswertung = document.getElementById('Auswertung');
      const element = document.getElementById(`pieChart-${this.id}`);
      this.lc = pieChart.createPieChart(element);
      auswertung.addEventListener('click', this.draw);
      window.addEventListener('resize', this.draw);
    }, 500);
  },
  beforeDestroy() {
    // const auswertung = document.getElementById('Auswertung');
    // auswertung.removeEventListener('resize', this.draw);
    window.removeEventListener('resize', this.draw);
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

.svg-container { width: 100%; min-height: 300px; }

.svg-content {
  display: inline-block;
  position: absolute;
  top: 0;
  left: 0;
}

.like { fill: green !important; }

.dislike { fill: orangered !important; }

.neutral { fill: gray !important; }

#tooltip {
  position: absolute;
  width: auto;
  height: auto;
  padding: 10px;
  background-color: #3d3d3d;
  -webkit-border-radius: 10px;
  -moz-border-radius: 10px;
  border-radius: 10px;
  -webkit-box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
  -moz-box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
  pointer-events: none;
  text-align: center;
  display: inline-block;
}

#tooltip.hidden { display: none; }

#tooltip p {
  margin: 0;
  text-align: center;
  color: white;
  font-size: 16px;
  line-height: 20px;
}

#itemImage {
  margin-top: 10px;
  padding-top: 75%;
  background-size: cover;
}

.arc text {
  text-anchor: middle;
  fill: Black;
  pointer-events: none;
}

.arc path {
  opacity: 0.5;
  stroke: #fff;
  stroke-width: 2px;
}

.arc path.hover { opacity: 1; }

.defaultPoint {
  fill: white;
  stroke: steelblue;
  stroke-width: 2px;
  /* pointer-events: none; */
}

.averagePoint {
  fill: black;
  stroke: white;
  stroke-width: 2px;
  /* pointer-events: none; */
}
</style>

<template>
  <div class="lineChart svg-container" :id="'lineChart-' + this.id">

  </div>
</template>

<script>
import lineChart from '@/utils/lineChart';

export default {
  name: 'Visualization',
  props: {
    data: Array,
    id: Number,
    clickedKey: String,
    mouseOverKey: String,
    mouseOutKey: String,
  },
  methods: {
    draw() {
      setTimeout(() => {
        const drawData = this.data[this.id].lineChart;
        this.lc.draw(drawData, 0);
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
    clickedKey: function click(val) {
      if (val !== '') {
        const parts = val.split('-');
        if (parseInt(parts[1], 10) === this.id) this.lc.dispatchCLick(parts[0]);
      }
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
      const element = document.getElementById(`lineChart-${this.id}`);
      this.lc = lineChart.createLineChart(element);
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

.svg-container { width: 100%; min-height: 200px; }

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

.line {
  opacity: 0.5;
  fill: none;
  stroke: steelblue;
  stroke-width: 3px;
}

.line.like { fill: none !important; stroke: green !important; }

.line.dislike { fill: none !important; stroke: orangered !important; }

.line.neutral { fill: none !important; stroke: gray !important; }

.line.hover { opacity: 1 !important; }

.line.clicked { opacity: 1; }

.line.background { opacity: 0.1; }

.averageLine {
  opacity: 1;
  stroke: black;
  stroke-width: 1px;
}

.averageLine.hidden { opacity: 0; }

.averageText {
  opacity: 1;
  fill: black;
}

.averageText.hidden { opacity: 0; }

.dot { r: 5px; }

.dot.like { fill: green !important; }

.dot.dislike { fill: orangered !important; }

.dot.neutral { fill: gray !important; }
</style>

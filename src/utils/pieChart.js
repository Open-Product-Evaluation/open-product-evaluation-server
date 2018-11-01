import * as d3 from 'd3';
import shortId from 'shortid-36';

d3.selection.prototype.moveToFront = function moveToFront() {
  return this.each(function move() {
    this.parentNode.appendChild(this);
  });
};

const createPieChart = (div) => {
  // shortId.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_');
  const chartId = shortId.generate();
  const sName = 'masterSVG';
  const gName = 'masterG';
  const tName = 'tooltip';
  const bName = 'allButtons';

  /* const margin = {
    top: 40,
    right: 20,
    bottom: 45,
    left: 50,
  }; */

  const dispatchMouseOver = (elementName) => {
    d3.select(div).select(`#${chartId}${elementName.toString().replace(/\s+/g, '')}`).dispatch('mouseover');
  };

  const dispatchMouseOut = (elementName) => {
    d3.select(div).select(`#${chartId}${elementName.toString().replace(/\s+/g, '')}`).dispatch('mouseout');
  };

  const dispatchCLick = (elementName) => {
    d3.select(div).select(`#${chartId}${elementName.toString().replace(/\s+/g, '')}`).dispatch('click');
  };

  const appendTooltip = () => {
    const tooltip = d3.select(div).append('div')
      .attr('class', 'hidden')
      .attr('id', tName)
      .style('z-index', 9999);

    tooltip.append('p')
      .style('font-weight', 'bold')
      .attr('id', 'name');

    tooltip.append('p')
      .style('line-height', '160%')
      .attr('id', 'type')
      .text('');

    tooltip.append('p')
      .style('line-height', '160%')
      .attr('id', 'value')
      .text('');
  };

  const showTooltipForElement =
    (element, elementData, heading, type, radius, textOffsetFromCenter) => {
      const divCon = d3.select(div);

      const svgWidth =
        parseFloat(divCon.select(`#${sName}`).node().getBoundingClientRect().width);
      const svgHeight =
        parseFloat(divCon.select(`#${sName}`).node().getBoundingClientRect().height);

      const { value, detailedValue } = elementData.data;
      const valueBonus = (elementData.data.valueBonus) ? elementData.data.valueBonus : '';
      const detailedBonus = (elementData.data.detailedBonus) ? elementData.data.detailedBonus : '';

      const tooltip = divCon.select(`#${tName}`);

      tooltip.select('#value')
        .text((detailedValue) ? `${value}${valueBonus} (${detailedValue}${detailedBonus})` : value);

      tooltip.select('#type')
        .text(`${type}:`);

      tooltip.select('#name')
        .text(heading);

      const itemImage = tooltip.select('#itemImage');
      if (itemImage) {
        tooltip.style('width', null);
        itemImage.remove();
      }

      if (elementData.data.image) {
        // tooltip.style('width', `${svgWidth / 3}px`);
        tooltip.append('div')
          .attr('id', 'itemImage')
          .style('background-image', `url(${elementData.data.image})`);
      }

      tooltip.classed('hidden', false);

      const tooltipWidth = parseFloat(tooltip.node().offsetWidth);
      const tooltipHeight = parseFloat(tooltip.node().offsetHeight);

      const centerOfCircle = {
        x: parseFloat(divCon.select(`#${sName}`).node().getBoundingClientRect().width) / 2,
        y: parseFloat(divCon.select(`#${sName}`).node().getBoundingClientRect().height) / 2,
      };

      const xTextPosition = parseFloat(centerOfCircle.x + textOffsetFromCenter[0]);
      const yTextPosition = parseFloat(centerOfCircle.y + textOffsetFromCenter[1]);

      let xPos = (xTextPosition > centerOfCircle.x)
        ? xTextPosition + 40 : xTextPosition - tooltipWidth - 40;
      const tooltipRightEndPoint = xPos + tooltipWidth;
      const tooltipLeftEndPoint = xPos;

      if (tooltipRightEndPoint > svgWidth) xPos -= (tooltipRightEndPoint - svgWidth);
      else if (tooltipLeftEndPoint < 0) xPos += Math.abs(tooltipLeftEndPoint);

      let yPos = yTextPosition;
      const tooltipTopEndPoint = yTextPosition - (tooltipHeight / 2);
      const tooltipBotEndPoint = yTextPosition + tooltipHeight;
      if (tooltipTopEndPoint < 0) yPos += Math.abs(tooltipTopEndPoint);
      else if (tooltipBotEndPoint > svgHeight) yPos -= (tooltipBotEndPoint - svgHeight);

      tooltip
        .style('left', `${xPos}px`)
        .style('top', `${yPos}px`);
    };

  const draw = (data, dataIndex) => {
    const { statistics, colorScale } = data;
    const { label, data: statisticsData } = statistics[dataIndex];
    const sumOfValues = statisticsData.reduce((sum, s) => sum + s.value, 0);

    d3.select(div).select(`#${sName}`).remove();
    d3.select(div).select(`#${tName}`).remove();
    d3.select(div).select(`#${bName}`).remove();

    const width = parseFloat(div.getBoundingClientRect().width);
    const height = parseFloat(div.getBoundingClientRect().height);
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(div)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('id', sName);

    const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`).attr('id', gName);

    const arc = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

    const labelArc = d3.arc()
      .outerRadius(radius - 40)
      .innerRadius(radius - 40);

    /* const pointArc = d3.arc()
      .outerRadius(radius / 2)
      .innerRadius(radius / 2); */

    const pie = d3.pie()
      .sort(null)
      .value(d => d.value);

    const gArc = g.selectAll('.arc')
      .data(pie(statisticsData))
      .enter().append('g')
      .attr('class', 'arc');

    gArc.append('clipPath')
      .attr('id', (d, i) => `clipPath${i}`)
      .append('path')
      .attr('d', arc);

    gArc.append('path')
      .attr('d', arc)
      .attr('class', d => ((d.data.class) ? `${d.data.class}` : ''))
      .attr('id', d => `${chartId}${d.data.key.toString().replace(/\s+/g, '')}`)
      .style('fill', d => ((colorScale) ? colorScale(d.data.key) : 'orange'))
      .on('mouseover', function showTooltip(d) {
        if (d.data.value > 0) {
          const self = d3.select(this);
          self.classed('hover', true);
          const textOffset = labelArc.centroid(d);
          const heading = (d.data.detailedHeading) ? d.data.detailedHeading : d.data.key;
          showTooltipForElement(self, d, heading, label, radius, textOffset);
        }
      })
      .on('mouseout', function stopHover() {
        d3.select(div).select(`#${tName}`).classed('hidden', true);
        d3.select(this).classed('hover', false);
      });
    /* .each((d, i) => {
      if (d.data.class) {
        if (d.data.class.includes('default')) {
          d3.select(`#clipPath${i}`)
            .attr('transform', () =>
            `translate(${-pointArc.centroid(d)[0]}, ${-pointArc.centroid(d)[1]})`);
          gArc.append('circle')
            .attr('transform', () => `translate(${pointArc.centroid(d)})`)
            .attr('class', 'defaultPoint')
            .style('r', `${radius / 15}px`)
            .attr('clip-path', `url(#clipPath${i})`);
        }

        if (d.data.class.includes('average')) {
          d3.select(`#clipPath${i}`)
            .attr('transform', () =>
            `translate(${-pointArc.centroid(d)[0]}, ${-pointArc.centroid(d)[1]})`);
          gArc.append('circle')
            .attr('transform', () => `translate(${pointArc.centroid(d)})`)
            .attr('class', 'averagePoint')
            .attr('clip-path', `url(#clipPath${i})`)
            .style('r', `${radius / 20}px`);
        }
      }
    }); */

    gArc.append('text')
      .attr('dy', '.35em')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .text(d => (((d.data.value / sumOfValues) * 100 >= 5) ? `${d.data.value}${(d.data.valueBonus) ? d.data.valueBonus : ''}` : ''));

    appendTooltip();
  };

  return Object.freeze({
    draw,
    dispatchMouseOver,
    dispatchMouseOut,
    dispatchCLick,
  });
};

export default {
  createPieChart,
};

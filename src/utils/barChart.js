import * as d3 from 'd3';
import shortId from 'shortid-36';

// TODO: dataIndex übergeben
const createBarChart = (div) => {
  // shortId.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_');
  const chartId = shortId.generate();
  const padding = 0.1;

  const sName = 'masterSVG';
  const gName = 'masterG';
  const tName = 'tooltip';

  const margin = {
    top: 40,
    right: 20,
    bottom: 45,
    left: 50,
  };

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

  const showTooltipForElement = (element, elementData, heading, type, bandwidth) => {
    const divCon = d3.select(div);
    const gWidth = parseFloat(divCon.select(`#${gName}`).node().getBoundingClientRect().width);
    const gHeight = parseFloat(divCon.select(`#${gName}`).node().getBoundingClientRect().height);

    const { value, detailedValue } = elementData;
    const valueBonus = (elementData.valueBonus) ? elementData.valueBonus : '';
    const detailedBonus = (elementData.detailedBonus) ? elementData.detailedBonus : '';

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

    if (elementData.image) {
      // tooltip.style('width', `${gWidth / 3}px`);
      tooltip.append('div')
        .attr('id', 'itemImage')
        .style('background-image', `url(${elementData.image})`);
    }

    tooltip.classed('hidden', false);

    const tooltipWidth = parseFloat(tooltip.node().offsetWidth);
    const tooltipHeight = parseFloat(tooltip.node().offsetHeight);

    const xBarPosition = parseFloat(element.attr('x')) + (bandwidth / 2);
    const yBarPosition = (parseFloat(element.attr('y')));

    let xPos = (xBarPosition + margin.left) - (tooltipWidth / 2);
    const tooltipRightEndPoint = (xPos + tooltipWidth) - margin.right;
    const tooltipLeftEndPoint = xPos - (margin.left / 2);

    if (tooltipRightEndPoint > gWidth) xPos -= (tooltipRightEndPoint - gWidth);
    else if (tooltipLeftEndPoint < 0) xPos += Math.abs(tooltipLeftEndPoint);

    let yPos = yBarPosition - (tooltipHeight / 2);
    const tooltipTopEndPoint = yBarPosition - (tooltipHeight / 2);
    const tooltipBotEndPoint = yBarPosition + (tooltipHeight / 2);
    if (tooltipTopEndPoint < 0) yPos += Math.abs(tooltipTopEndPoint);
    else if (tooltipBotEndPoint > gHeight) yPos -= (tooltipBotEndPoint - gHeight);

    tooltip
      .style('left', `${xPos}px`)
      .style('top', `${yPos}px`);
  };

  const showTooltipForPoint = (position, heading) => {
    const divCon = d3.select(div);
    const gWidth = parseFloat(divCon.select(`#${gName}`).node().getBoundingClientRect().width);
    const gHeight = parseFloat(divCon.select(`#${gName}`).node().getBoundingClientRect().height);

    const tooltip = divCon.select(`#${tName}`);

    tooltip.select('#value')
      .text('');

    tooltip.select('#type')
      .text('');

    tooltip.select('#name')
      .text(heading);

    const itemImage = tooltip.select('#itemImage');
    if (itemImage) {
      tooltip.style('width', null);
      itemImage.remove();
    }

    tooltip.classed('hidden', false);

    const tooltipWidth = parseFloat(tooltip.node().offsetWidth);
    const tooltipHeight = parseFloat(tooltip.node().offsetHeight);

    const xPointPosition = position.x;
    const yPointPosition = position.y;

    let xPos = (xPointPosition + margin.left) - (tooltipWidth / 2);
    const tooltipRightEndPoint = (xPos + tooltipWidth) - margin.right;
    const tooltipLeftEndPoint = xPos - (margin.left / 2);

    if (tooltipRightEndPoint > gWidth) xPos -= (tooltipRightEndPoint - gWidth);
    else if (tooltipLeftEndPoint < 0) xPos += Math.abs(tooltipLeftEndPoint);

    let yPos = yPointPosition;
    const tooltipTopEndPoint = yPointPosition - (tooltipHeight / 2);
    const tooltipBotEndPoint = yPointPosition + (tooltipHeight / 2);
    if (tooltipTopEndPoint < 0) yPos += Math.abs(tooltipTopEndPoint);
    else if (tooltipBotEndPoint > gHeight) yPos -= (tooltipBotEndPoint - gHeight);

    tooltip
      .style('left', `${xPos}px`)
      .style('top', `${yPos}px`);
  };

  const draw = (data, dataIndex) => {
    const { statistics, colorScale, elementName: xText } = data;
    const { label: yText, data: statisticsData, yMax } = statistics[dataIndex];

    d3.select(div).select(`#${sName}`).remove();
    d3.select(div).select(`#${tName}`).remove();

    const width = div.getBoundingClientRect().width - margin.left - margin.right;
    const height = div.getBoundingClientRect().height - margin.top - margin.bottom;

    const svg = d3.select(div)
      .append('svg')
      .attr('id', sName)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`).attr('id', gName);

    const x = d3.scaleBand()
      .rangeRound([0, width])
      .padding(padding);

    const y = d3.scaleLinear()
      .range([height, 0]);

    const xAxis = d3.axisBottom(x);

    const yAxis = d3.axisLeft(y);

    x.domain(statisticsData.map(d => d.key));
    y.domain([0, yMax]);

    g.append('g')
      .attr('class', 'x axis barChart')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text');

    g.append('text')
      .attr('transform', `translate(${width / 2},${height + (margin.top)})`)
      .style('text-anchor', 'middle')
      .text(xText);

    g.append('g')
      .attr('class', 'y axis lineChart')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Frequency');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text(yText);

    g.selectAll('.bar')
      .data(statisticsData)
      .enter()
      .append('rect')
      .attr('class', d => ((d.class) ? `bar ${d.class}` : 'bar'))
      .attr('id', d => `${chartId}${d.key.toString().replace(/\s+/g, '')}`)
      .attr('x', d => x(d.key))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.value))
      .attr('height', d => height - y(d.value))
      .style('fill', d => ((colorScale) ? colorScale(d.key) : 'orange'))
      .on('mouseover', function showTooltip(d) {
        const self = d3.select(this);
        self.classed('hover', true);
        const heading = (d.detailedHeading) ? d.detailedHeading : d.key;
        showTooltipForElement(self, d, heading, yText, x.bandwidth());
      })
      .on('mouseout', function mouseOut() {
        d3.select(this).classed('hover', false);
        d3.select(div).select(`#${tName}`).classed('hidden', true);
      })
      .each(function createCircles(d) {
        if (d.class) {
          const xBarPosition = parseFloat(d3.select(this).attr('x')) + (x.bandwidth() / 2);
          const yBarPosition = (parseFloat(d3.select(this).attr('y')));
          const distanceToDivTop = yBarPosition + margin.top;

          const maxCircleRadius =
            (distanceToDivTop < x.bandwidth()) ? distanceToDivTop / 2 : x.bandwidth() / 2;
          const circleMidpointY = yBarPosition - maxCircleRadius;

          if (d.class.includes('default')) {
            const defaultRadius = maxCircleRadius / 1.25;

            g.append('circle')
              .attr('transform', () => `translate(${xBarPosition},${circleMidpointY})`)
              .attr('class', 'defaultPoint')
              .style('r', `${defaultRadius}px`)
              .on('mouseover', () => {
                showTooltipForPoint({ x: xBarPosition, y: yBarPosition }, 'Default');
              })
              .on('mouseout', () => {
                d3.select(div).select(`#${tName}`).classed('hidden', true);
              });
          }

          if (d.class.includes('average')) {
            const averageRadius = maxCircleRadius / 2;

            g.append('circle')
              .attr('transform', () => `translate(${xBarPosition},${circleMidpointY})`)
              .attr('class', 'averagePoint')
              .style('r', `${averageRadius}px`)
              .on('mouseover', () => {
                showTooltipForPoint({ x: xBarPosition, y: yBarPosition }, 'Average');
              })
              .on('mouseout', () => {
                d3.select(div).select(`#${tName}`).classed('hidden', true);
              });
          }
        }
      });
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
  createBarChart,
};

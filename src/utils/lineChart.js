import * as d3 from 'd3';
import shortId from 'shortid-36';

const createLineChart = (div) => {
  // shortId.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_');
  const chartId = shortId.generate();
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
      .attr('id', 'value');
  };

  const showTooltipForElement = (element, elementData, heading, type) => {
    const divCon = d3.select(div);
    const gWidth = parseFloat(divCon.select(`#${gName}`).node().getBoundingClientRect().width);
    const gHeight = parseFloat(divCon.select(`#${gName}`).node().getBoundingClientRect().height);

    const { value, detailedValue } = elementData;
    const valueBonus = (elementData.valueBonus) ? elementData.valueBonus : '';
    const detailedBonus = (elementData.detailedBonus || elementData.detailedBonus === 0) ? elementData.detailedBonus : '';

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

    const xPointPosition = parseFloat(element.attr('cx'));
    const yPointPosition = (parseFloat(element.attr('cy')));

    let xPos = (xPointPosition + margin.left) - (tooltipWidth / 2);
    const tooltipRightEndPoint = (xPos + tooltipWidth) - margin.right;
    const tooltipLeftEndPoint = xPos - (margin.left / 2);

    if (tooltipRightEndPoint > gWidth) xPos -= (tooltipRightEndPoint - gWidth);
    else if (tooltipLeftEndPoint < 0) xPos += Math.abs(tooltipLeftEndPoint);

    let yPos = yPointPosition - (tooltipHeight / 2);
    const tooltipTopEndPoint = yPointPosition - (tooltipHeight / 2);
    const tooltipBotEndPoint = yPointPosition + (tooltipHeight / 2);
    if (tooltipTopEndPoint < 0) yPos += Math.abs(tooltipTopEndPoint);
    else if (tooltipBotEndPoint > gHeight) yPos -= (tooltipBotEndPoint - gHeight);

    tooltip
      .style('left', `${xPos}px`)
      .style('top', `${yPos}px`);
  };

  const draw = (data) => {
    d3.select(div).select(`#${sName}`).remove();
    d3.select(div).select(`#${tName}`).remove();

    const width = div.getBoundingClientRect().width - margin.left - margin.right;
    const height = div.getBoundingClientRect().height - margin.top - margin.bottom;

    const {
      xLabels,
      yMax,
      colorScale,
      statistics: lineStatistics,
      elementName: xText,
      label: yText,
    } = data;

    const x = d3.scaleLinear()
      .range([0, width]);

    const y = d3.scaleLinear()
      .range([height, 0]);

    const valueline = d3.line()
      .x(d => x(d.hour))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    const svg = d3.select(div)
      .append('svg')
      .attr('id', sName)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`).attr('id', gName);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    x.domain([0, xLabels.length - 1]);
    y.domain([0, yMax]);

    g.append('line')
      .attr('class', 'averageLine hidden')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', height / 2)
      .attr('y2', height / 2);

    g.append('text')
      .attr('class', 'averageText hidden')
      .attr('transform', `translate(${width / 2},${-(margin.top / 2)})`)
      .style('text-anchor', 'middle')
      .text('Average');

    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text');

    g.append('text')
      .attr('transform', `translate(${width / 2},${height + (margin.top)})`)
      .style('text-anchor', 'middle')
      .text(xText);

    g.append('g')
      .attr('class', 'y axis')
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

    lineStatistics.forEach((statistic) => {
      g.append('path')
        .data([statistic.statisticsPerHour])
        .attr('class', () => ((statistic.class) ? `line ${statistic.class}` : 'line'))
        .attr('id', () => `${chartId}${statistic.key.toString().replace(/\s+/g, '')}`)
        .attr('d', d => valueline(d))
        .style('stroke', () => ((colorScale) ? colorScale(statistic.key) : 'orange'))
        .on('mouseover', function hover() {
          d3.select(this).classed('hover', true);

          g.selectAll('.dot.normal')
            .data(statistic.statisticsPerHour)
            .enter()
            .append('circle')
            .attr('class', () => ((statistic.class) ? `dot normal ${statistic.class}` : 'dot normal'))
            .attr('cx', d => x(d.hour))
            .attr('cy', d => y(d.value))
            .style('fill', () => ((colorScale) ? colorScale(statistic.key) : 'orange'))
            .style('pointer-events', 'none');
        })
        .on('mouseout', function mouseOut() {
          d3.select(this).classed('hover', false);
          g.selectAll('.dot.normal').remove();
        })
        .on('click', function click(d) {
          d3.event.stopPropagation();

          g.selectAll('.averageLine').classed('hidden', true);
          g.selectAll('.averageText').classed('hidden', true);
          d3.select(div).selectAll('.line').classed('background', true);
          d3.select(this).classed('background', false);
          d3.select(div).selectAll('.line').classed('clicked', false);
          d3.select(this).classed('clicked', true);

          g.select('.averageLine')
            .attr('y1', y(d[0].averageValue))
            .attr('y2', y(d[0].averageValue))
            .classed('hidden', false);

          g.select('.averageText')
            .text(`${d[0].averageBonus}${d[0].averageValue}`)
            .classed('hidden', false);

          g.selectAll('.dot.click').remove();
          g.selectAll('.dot.click')
            .data(statistic.statisticsPerHour)
            .enter()
            .append('circle')
            .attr('class', () => ((statistic.class) ? `dot click ${statistic.class}` : 'dot click'))
            .attr('cx', dI => x(dI.hour))
            .attr('cy', dI => y(dI.value))
            .style('fill', () => ((colorScale) ? colorScale(statistic.key) : 'orange'))
            .on('mouseover', function showTooltip(dI) {
              const self = d3.select(this);
              const heading =
                (statistic.detailedHeading) ? statistic.detailedHeading : statistic.key;
              showTooltipForElement(self, dI, heading, yText);
            })
            .on('mouseout', () => {
              d3.select(div).select(`#${tName}`).classed('hidden', true);
            });
        });

      svg.on('click', () => {
        g.selectAll('.dot.click').remove();
        g.selectAll('.averageLine').classed('hidden', true);
        g.selectAll('.averageText').classed('hidden', true);
        d3.select(div).selectAll('.line').classed('clicked', false);
        d3.select(div).selectAll('.line').classed('background', false);
        d3.select(div).select(`#${tName}`).classed('hidden', true);
      });
    });

    if (lineStatistics.length === 1) d3.select(div).selectAll('.line').dispatch('click');

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
  createLineChart,
};

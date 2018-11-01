import * as d3 from 'd3';
import _ from 'underscore';
import moment from 'moment';

/* const colorArray = [
  '#393b79',
  '#5254a3',
  '#6b6ecf',
  '#9c9ede',
  '#637939',
  '#8ca252',
  '#b5cf6b',
  '#cedb9c',
  '#8c6d31',
  '#bd9e39',
  '#e7ba52',
  '#e7cb94',
  '#843c39',
  '#ad494a',
  '#d6616b',
  '#e7969c',
  '#7b4173',
  '#a55194',
  '#ce6dbd',
  '#de9ed6',
]; */

const colorArray2 = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#bcbd22',
  '#17becf',
  '#aec7e8',
  '#ffbb78',
  '#98df8a',
  '#ff9896',
  '#c5b0d5',
  '#c49c94',
  '#f7b6d2',
  '#dbdb8d',
  '#9edae5',
  '#393b79',
  '#637939',
  '#8c6d31',
  '#843c39',
  '#7b4173',
];

const createDataModifier = () => {
  const assignAnswersToQuestion = (questionData, voteData) => {
    const questions = JSON.parse(JSON.stringify(questionData));
    const votes = JSON.parse(JSON.stringify(voteData));

    const dateVotes = votes.map((vote) => {
      const newVote = { ...vote };
      newVote.creationDate = new Date(vote.creationDate);
      return newVote;
    });

    const sortedVotes = dateVotes.sort((a, b) => a.creationDate - b.creationDate);

    const assignedQuestions = questions.map((question) => {
      const answers = sortedVotes.map((vote) => {
        let answer = vote.answers.filter(voteAnswer => voteAnswer.question === question.id)[0];

        switch (question.type) {
          case 'LIKE': {
            answer = answer.liked;
            break;
          }
          case 'LIKEDISLIKE': {
            answer = answer.liked;
            break;
          }
          case 'CHOICE': {
            answer = answer.choice;
            break;
          }
          case 'REGULATOR': {
            delete answer.question;
            break;
          }
          case 'FAVORITE': {
            answer = answer.favoriteItem;
            break;
          }
          case 'RANKING': {
            answer = answer.rankedItems;
            break;
          }
          default:
            break;
        }

        return {
          answer,
          date: vote.creationDate,
          context: vote.context,
          device: vote.device,
        };
      });

      return {
        question,
        answers,
      };
    });

    const contexts = votes.map(vote => vote.context);
    const contextsWithoutDuplicates = _.uniq(contexts);

    const devices = votes.map(vote => vote.device);
    const devicesWithoutDuplicates = _.uniq(devices);

    return {
      assignedQuestions,
      contexts: contextsWithoutDuplicates,
      devices: devicesWithoutDuplicates,
    };
  };

  const reverseStatisticValues = (statistic) => {
    const reversedStatistic = statistic;
    reversedStatistic.data = statistic.data.map((data) => {
      const reversedData = data;
      const {
        value,
        detailedValue,
        valueBonus,
        detailedBonus,
      } = data;

      reversedData.value = detailedValue;
      reversedData.detailedValue = value;
      reversedData.valueBonus = detailedBonus;
      reversedData.detailedBonus = valueBonus;

      return reversedData;
    });

    return reversedStatistic;
  };

  const groupLowerBoundValues = (dataSet, maxValue, elementName) => {
    const valuesBelowLowerBound = dataSet.filter(data => data.value < 5);
    const valuesAboveLowerBound = dataSet.filter(data => data.value >= 5);

    const addedValues = valuesBelowLowerBound.reduce((sum, lower) => sum + lower.detailedValue, 0);

    return [
      ...valuesAboveLowerBound,
      {
        key: `${elementName} below 5%`,
        value: Math.round((addedValues / maxValue) * 1000) / 10,
        valueBonus: '%',
        detailedValue: addedValues,
        detailedHeading: `${elementName} below 5%`,
      },
    ];
  };

  const occurrenceDay = occurrence => moment(occurrence.date).startOf('day').format();

  const groupToDay = (group, day) => ({
    day,
    group,
  });

  const groupHoursByDate = (assignedData) => {
    const hours = Array.from(Array(24).keys());

    let hourGroups = [];
    hours.forEach((hour) => {
      const answersAtHour = assignedData.answers.filter(answer => answer.date.getHours() === hour);
      const dayGroups = _.chain(answersAtHour)
        .groupBy(occurrenceDay)
        .map(groupToDay)
        .sortBy('day')
        .value();

      hourGroups.push({
        hour: (hour !== 23) ? hour + 1 : 0,
        dayGroups,
      });
    });

    const lastValue = hourGroups.pop();
    hourGroups = [lastValue, ...hourGroups];
    return hourGroups;
  };

  const getAllDaysVoted = (assignedData) => {
    const allDays = _.chain(assignedData.answers)
      .groupBy(occurrenceDay)
      .map(groupToDay)
      .sortBy('day')
      .value();

    return allDays.length;
  };

  const setOverallValue = (statisticsElement, label) => {
    const updatedStatistic = statisticsElement;
    const overallValue =
      updatedStatistic.statisticsPerHour.reduce((sum, stat) => sum + stat.value, 0);

    const overallAverage = Math.round((overallValue / 24) * 100) / 100;
    updatedStatistic.statisticsPerHour =
      updatedStatistic.statisticsPerHour.map((ele) => {
        const newEle = ele;
        newEle.averageBonus = label;
        newEle.averageValue = overallAverage;
        return newEle;
      });

    return updatedStatistic;
  };

  const prepareLIKE = (assignedData) => {
    const barChart = {
      elementName: 'Possible answers',
      colorScale: d3.scaleOrdinal().range(colorArray2),
      statistics: [],
    };

    const amounts = { label: 'Amount of Votes', data: [] };

    const likeCount = assignedData.answers.filter(answerData => answerData.answer === true).length;
    amounts.data.push({
      key: 'like',
      value: likeCount,
      detailedValue: Math.round((likeCount / assignedData.answers.length) * 1000) / 10,
      detailedBonus: '%',
      detailedHeading: 'like',
      class: 'like',
    });

    const neutralCount = assignedData.answers
      .filter(answerData => (answerData.answer === null || answerData.answer === false)).length;
    amounts.data.push({
      key: 'NA',
      value: neutralCount,
      detailedValue: Math.round((neutralCount / assignedData.answers.length) * 1000) / 10,
      detailedBonus: '%',
      detailedHeading: 'Not answered',
      class: 'neutral',
    });

    barChart.statistics.push(amounts);
    barChart.statistics[0].yMax = d3.max(barChart.statistics[0].data, d => d.value);

    const pieChart = { ...barChart };
    pieChart.statistics = JSON.parse(JSON.stringify(barChart.statistics));
    pieChart.statistics = pieChart.statistics.map(statistic => reverseStatisticValues(statistic));

    const lineChart = {
      xLabels: Array.from(Array(24).keys()),
      label: 'Average amount at hour',
      elementName: 'Hours of a day',
      colorScale: d3.scaleOrdinal().range(colorArray2),
      statistics: [],
    };

    const groupedByHour = groupHoursByDate(assignedData);
    const allDaysVoted = getAllDaysVoted(assignedData);

    let likesLineStatistics = {
      key: 'like',
      statisticsPerHour: [],
      detailedHeading: 'like',
      class: 'like',
    };

    let neutralsLineStatistics = {
      key: 'NA',
      detailedHeading: 'Not answered',
      statisticsPerHour: [],
      class: 'neutral',
    };

    let lineYMax = 0;

    groupedByHour.forEach((element) => {
      const { hour, dayGroups } = element;

      const likeCountOfHour = dayGroups.reduce((sum, day) =>
        sum + day.group.filter(gEl => gEl.answer === true).length, 0);
      // const amountDaysWithVotesAtHour = dayGroups.length
      // dayGroups.filter(dG => dG.group.length > 0).length
      const lAverage = Math.round((likeCountOfHour / allDaysVoted) * 100) / 100;

      const likesForHour = {
        hour,
        value: lAverage,
        detailedValue: 'Absolute amount: ',
        detailedBonus: likeCountOfHour,
      };
      likesLineStatistics.statisticsPerHour.push(likesForHour);

      const neutralCountOfHour = dayGroups.reduce((sum, day) =>
        sum + day.group.filter(gEl => (gEl.answer === null || gEl.answer === false)).length, 0);
      const nAverage = Math.round((neutralCountOfHour / allDaysVoted) * 100) / 100;

      const neutralForHour = {
        hour,
        value: nAverage,
        detailedValue: 'Absolute amount: ',
        detailedBonus: neutralCountOfHour,
      };

      lineYMax = d3.max([lAverage, nAverage, lineYMax]);

      neutralsLineStatistics.statisticsPerHour.push(neutralForHour);
    });

    likesLineStatistics = setOverallValue(likesLineStatistics, 'Overall average: ');
    neutralsLineStatistics = setOverallValue(neutralsLineStatistics, 'Overall average: ');

    lineChart.statistics.push(likesLineStatistics);
    lineChart.statistics.push(neutralsLineStatistics);

    lineChart.yMax = lineYMax;

    return {
      barChart,
      pieChart,
      lineChart,
      colors: ['green', 'gray'],
      labels: [
        { key: 'like', label: 'like' },
        { key: 'NA', label: 'Not answered' },
      ],
    };
  };

  const prepareLIKEDISLIKE = (assignedData) => {
    const barChart = {
      elementName: 'Possible answers',
      colorScale: d3.scaleOrdinal().range(colorArray2),
      statistics: [],
    };

    const amounts = { label: 'Amount of Votes', data: [] };

    const likeCount = assignedData.answers.filter(answerData => answerData.answer === true).length;
    amounts.data.push({
      key: 'like',
      value: likeCount,
      detailedValue: Math.round((likeCount / assignedData.answers.length) * 1000) / 10,
      detailedBonus: '%',
      detailedHeading: 'like',
      class: 'like',
    });

    const dislikeCount =
      assignedData.answers.filter(answerData => answerData.answer === false).length;
    amounts.data.push({
      key: 'dislike',
      value: dislikeCount,
      detailedValue: Math.round((dislikeCount / assignedData.answers.length) * 1000) / 10,
      detailedBonus: '%',
      detailedHeading: 'dislike',
      class: 'dislike',
    });

    const neutralCount =
      assignedData.answers.filter(answerData => answerData.answer === null).length;
    amounts.data.push({
      key: 'NA',
      value: neutralCount,
      detailedValue: Math.round((neutralCount / assignedData.answers.length) * 1000) / 10,
      detailedBonus: '%',
      detailedHeading: 'Not answered',
      class: 'neutral',
    });

    barChart.statistics.push(amounts);
    barChart.statistics[0].yMax = d3.max(barChart.statistics[0].data, d => d.value);

    const pieChart = { ...barChart };
    pieChart.statistics = JSON.parse(JSON.stringify(barChart.statistics));
    pieChart.statistics = pieChart.statistics.map(statistic => reverseStatisticValues(statistic));

    const lineChart = {
      xLabels: Array.from(Array(24).keys()),
      label: 'Average amount at hour',
      elementName: 'Hours of a day',
      colorScale: d3.scaleOrdinal().range(colorArray2),
      statistics: [],
    };

    const groupedByHour = groupHoursByDate(assignedData);
    const allDaysVoted = getAllDaysVoted(assignedData);

    let likesLineStatistics = {
      key: 'like',
      statisticsPerHour: [],
      detailedHeading: 'like',
      class: 'like',
    };

    let dislikesLineStatistics = {
      key: 'dislike',
      statisticsPerHour: [],
      detailedHeading: 'dislike',
      class: 'dislike',
    };

    let neutralsLineStatistics = {
      key: 'NA',
      statisticsPerHour: [],
      detailedHeading: 'Not answered',
      class: 'neutral',
    };

    let lineYMax = 0;

    groupedByHour.forEach((element) => {
      const { hour, dayGroups } = element;

      const likeCountOfHour = dayGroups.reduce((sum, day) =>
        sum + day.group.filter(gEl => gEl.answer === true).length, 0);
      // const amountDaysWithVotesAtHour = dayGroups.length
      // dayGroups.filter(dG => dG.group.length > 0).length
      const lAverage = Math.round((likeCountOfHour / allDaysVoted) * 100) / 100;

      const likesForHour = {
        hour,
        value: lAverage,
        detailedValue: 'Absolute amount: ',
        detailedBonus: likeCountOfHour,
      };
      likesLineStatistics.statisticsPerHour.push(likesForHour);

      const dislikeCountOfHour = dayGroups.reduce((sum, day) =>
        sum + day.group.filter(gEl => gEl.answer === false).length, 0);
      const dAverage = Math.round((dislikeCountOfHour / allDaysVoted) * 100) / 100;

      const dislikesForHour = {
        hour,
        value: dAverage,
        detailedValue: 'Absolute amount: ',
        detailedBonus: dislikeCountOfHour,
      };
      dislikesLineStatistics.statisticsPerHour.push(dislikesForHour);

      const neutralCountOfHour = dayGroups.reduce((sum, day) =>
        sum + day.group.filter(gEl => gEl.answer === null).length, 0);
      const nAverage = Math.round((neutralCountOfHour / allDaysVoted) * 100) / 100;

      const neutralForHour = {
        hour,
        value: nAverage,
        detailedValue: 'Absolute amount: ',
        detailedBonus: neutralCountOfHour,
      };

      lineYMax = d3.max([lAverage, dAverage, nAverage, lineYMax]);

      neutralsLineStatistics.statisticsPerHour.push(neutralForHour);
    });

    likesLineStatistics = setOverallValue(likesLineStatistics, 'Overall average: ');
    dislikesLineStatistics = setOverallValue(dislikesLineStatistics, 'Overall average: ');
    neutralsLineStatistics = setOverallValue(neutralsLineStatistics, 'Overall average: ');

    lineChart.statistics.push(likesLineStatistics);
    lineChart.statistics.push(dislikesLineStatistics);
    lineChart.statistics.push(neutralsLineStatistics);

    lineChart.yMax = lineYMax;

    return {
      barChart,
      pieChart,
      lineChart,
      colors: ['green', 'orangered', 'gray'],
      labels: [
        { key: 'like', label: 'like' },
        { key: 'dislike', label: 'dislike' },
        { key: 'NA', label: 'Not answered' },
      ],
    };
  };

  const prepareCHOICE = (assignedData) => {
    const barChart = {
      elementName: 'Choices',
      colorScale: d3.scaleOrdinal().range(colorArray2),
      statistics: [],
    };

    const { choices } = assignedData.question;
    const amounts = { label: 'Amount of Votes', data: [] };

    choices.forEach((choice) => {
      const count =
        assignedData.answers.filter(answerData => answerData.answer === choice.id).length;

      const classString = (choice.id === assignedData.question.choiceDefault) ? 'default' : '';

      amounts.data.push({
        key: choice.code,
        value: count,
        detailedValue: Math.round((count / assignedData.answers.length) * 1000) / 10,
        detailedBonus: '%',
        detailedHeading: (choice.label) ? choice.label : choice.code,
        image: (choice.image) ? choice.image.url : null,
        class: classString,
      });
    });

    const neutralCount =
      assignedData.answers.filter(answerData => answerData.answer === null).length;
    amounts.data.push({
      key: 'NA',
      value: neutralCount,
      detailedValue: Math.round((neutralCount / assignedData.answers.length) * 1000) / 10,
      detailedBonus: '%',
      detailedHeading: 'Not answered',
      class: 'neutral',
    });

    barChart.statistics.push(amounts);
    barChart.statistics[0].yMax = d3.max(barChart.statistics[0].data, d => d.value);

    const pieChart = { ...barChart };
    pieChart.statistics = JSON.parse(JSON.stringify(barChart.statistics));
    pieChart.statistics = pieChart.statistics.map(statistic => reverseStatisticValues(statistic));
    pieChart.statistics = pieChart.statistics.map((statistic) => {
      const boundFilteredStatistic = statistic;
      boundFilteredStatistic.data = groupLowerBoundValues(statistic.data, assignedData.answers.length, 'Choices');
      return boundFilteredStatistic;
    });

    /* pieChart.statistics = pieChart.statistics.map((statistic) => {
      const sortedData = statistic.data.sort((a, b) => b.value - a.value);
      const sortedStatistic = statistic;
      sortedStatistic.data = sortedData;
      return sortedStatistic;
    }); */

    const lineChart = {
      xLabels: Array.from(Array(24).keys()),
      label: 'Average amount at hour',
      elementName: 'Hours of a day',
      colorScale: d3.scaleOrdinal().range(colorArray2),
      statistics: [],
    };

    const groupedByHour = groupHoursByDate(assignedData);
    const allDaysVoted = getAllDaysVoted(assignedData);

    let lineYMax = 0;

    choices.forEach((choice) => {
      const classString = (choice.id === assignedData.question.default) ? 'default' : '';

      let choiceLineStatistics = {
        key: choice.code,
        detailedHeading: (choice.label) ? choice.label : choice.code,
        statisticsPerHour: [],
        class: classString,
      };

      groupedByHour.forEach((element) => {
        const { hour, dayGroups } = element;

        const choiceCountOfHour = dayGroups.reduce((sum, day) =>
          sum + day.group.filter(gEl => gEl.answer === choice.id).length, 0);
        const cAverage = Math.round((choiceCountOfHour / allDaysVoted) * 100) / 100;

        const choiceForHour = {
          hour,
          value: cAverage,
          image: (choice.image) ? choice.image.url : null,
          detailedValue: 'Absolute amount: ',
          detailedBonus: choiceCountOfHour,
        };

        lineYMax = d3.max([cAverage, lineYMax]);

        choiceLineStatistics.statisticsPerHour.push(choiceForHour);
      });

      choiceLineStatistics = setOverallValue(choiceLineStatistics, 'Overall average: ');

      lineChart.statistics.push(choiceLineStatistics);
    });

    let neutralsLineStatistics = {
      key: 'NA',
      statisticsPerHour: [],
      detailedHeading: 'Not answered',
      class: 'neutral',
    };

    groupedByHour.forEach((element) => {
      const { hour, dayGroups } = element;

      const neutralCountOfHour = dayGroups.reduce((sum, day) =>
        sum + day.group.filter(gEl => gEl.answer === null).length, 0);
      // const amountDaysWithVotesAtHour = dayGroups.length
      // dayGroups.filter(dG => dG.group.length > 0).length
      const nAverage = Math.round((neutralCountOfHour / allDaysVoted) * 100) / 100;

      const neutralForHour = {
        hour,
        value: nAverage,
        detailedValue: 'Absolute amount: ',
        detailedBonus: neutralCountOfHour,
      };

      lineYMax = d3.max([nAverage, lineYMax]);

      neutralsLineStatistics.statisticsPerHour.push(neutralForHour);
    });

    neutralsLineStatistics = setOverallValue(neutralsLineStatistics, 'Overall average: ');
    lineChart.statistics.push(neutralsLineStatistics);

    lineChart.yMax = lineYMax;

    const codes = choices.map(choice => choice.code);
    const names = choices.map(choice => ((choice.label) ? choice.label : choice.code));
    const colorScale = d3.scaleOrdinal().range(colorArray2);
    const colors = names.map(name => colorScale(name));

    const labels = names.map((name, i) => ({ key: codes[i], label: name }));

    return {
      barChart,
      pieChart,
      lineChart,
      colors: [...colors, 'gray'],
      labels: [...labels, { key: 'NA', label: 'Not answered' }],
    };
  };

  const prepareFAVORITE = (assignedData) => {
    const barChart = {
      elementName: 'Items',
      colorScale: d3.scaleOrdinal().range(colorArray2),
      statistics: [],
    };

    const { items } = assignedData.question;
    const amounts = { label: 'Amount of Votes', data: [] };

    items.forEach((item, i) => {
      const count =
        assignedData.answers.filter(answerData => answerData.answer === item.id).length;
      amounts.data.push({
        key: i + 1,
        value: count,
        detailedValue: Math.round((count / assignedData.answers.length) * 1000) / 10,
        detailedBonus: '%',
        detailedHeading: (item.label) ? item.label : `Item ${i}`,
        image: (item.image) ? item.image.url : null,
      });
    });

    const neutralCount =
      assignedData.answers.filter(answerData => answerData.answer === null).length;
    amounts.data.push({
      key: 'NA',
      value: neutralCount,
      detailedValue: Math.round((neutralCount / assignedData.answers.length) * 1000) / 10,
      detailedBonus: '%',
      detailedHeading: 'Not answered',
      class: 'neutral',
    });

    barChart.statistics.push(amounts);
    barChart.statistics[0].yMax = d3.max(barChart.statistics[0].data, d => d.value);

    const pieChart = { ...barChart };
    pieChart.statistics = JSON.parse(JSON.stringify(barChart.statistics));
    pieChart.statistics = pieChart.statistics.map(statistic => reverseStatisticValues(statistic));
    pieChart.statistics = pieChart.statistics.map((statistic) => {
      const boundFilteredStatistic = statistic;
      boundFilteredStatistic.data = groupLowerBoundValues(statistic.data, assignedData.answers.length, 'Items');
      return boundFilteredStatistic;
    });

    const lineChart = {
      xLabels: Array.from(Array(24).keys()),
      label: 'Average amount at hour',
      elementName: 'Hours of a day',
      colorScale: d3.scaleOrdinal().range(colorArray2),
      statistics: [],
    };

    const groupedByHour = groupHoursByDate(assignedData);
    const allDaysVoted = getAllDaysVoted(assignedData);

    let lineYMax = 0;

    items.forEach((item, i) => {
      let itemLineStatistics = {
        key: i + 1,
        statisticsPerHour: [],
        detailedHeading: (item.label) ? item.label : `Item ${i}`,
        class: '',
      };

      groupedByHour.forEach((element) => {
        const { hour, dayGroups } = element;
        const itemCountOfHour = dayGroups.reduce((sum, day) =>
          sum + day.group.filter(gEl => gEl.answer === item.id).length, 0);
        const iAverage = Math.round((itemCountOfHour / allDaysVoted) * 100) / 100;

        const itemForHour = {
          hour,
          value: iAverage,
          image: (item.image) ? item.image.url : null,
          detailedValue: 'Absolute amount: ',
          detailedBonus: itemCountOfHour,
        };

        lineYMax = d3.max([iAverage, lineYMax]);

        itemLineStatistics.statisticsPerHour.push(itemForHour);
      });

      itemLineStatistics = setOverallValue(itemLineStatistics, 'Overall average: ');

      lineChart.statistics.push(itemLineStatistics);
    });

    let neutralsLineStatistics = {
      key: 'NA',
      statisticsPerHour: [],
      detailedHeading: 'Not answered',
      class: 'neutral',
    };

    groupedByHour.forEach((element) => {
      const { hour, dayGroups } = element;

      const neutralCountOfHour = dayGroups.reduce((sum, day) =>
        sum + day.group.filter(gEl => gEl.answer === null).length, 0);
      // const amountDaysWithVotesAtHour = dayGroups.length
      // dayGroups.filter(dG => dG.group.length > 0).length
      const nAverage = Math.round((neutralCountOfHour / allDaysVoted) * 100) / 100;

      const neutralForHour = {
        hour,
        value: nAverage,
        detailedValue: 'Absolute amount: ',
        detailedBonus: neutralCountOfHour,
      };

      lineYMax = d3.max([nAverage, lineYMax]);

      neutralsLineStatistics.statisticsPerHour.push(neutralForHour);
    });

    neutralsLineStatistics = setOverallValue(neutralsLineStatistics, 'Overall average: ');

    lineChart.statistics.push(neutralsLineStatistics);

    lineChart.yMax = lineYMax;

    const names = items.map((item, i) => ((item.label) ? item.label : `Item ${i}`));
    const colorScale = d3.scaleOrdinal().range(colorArray2);
    const colors = names.map(name => colorScale(name));

    const labels = names.map((name, i) => ({ key: i + 1, label: name }));

    return {
      barChart,
      pieChart,
      lineChart,
      colors: [...colors, 'gray'],
      labels: [...labels, { key: 'NA', label: 'Not answered' }],
    };
  };

  const prepareREGULATOR = (assignedData) => {
    const { min, max, stepSize } = assignedData.question;

    const values = [];
    let runner = min;
    while (runner <= max) {
      values.push(runner);
      runner += stepSize;
    }

    const lineChart = {
      xLabels: Array.from(Array(24).keys()),
      label: 'Average rating at hour (if voted)',
      elementName: 'Hours of a day',
      colorScale: d3.scaleOrdinal().range(colorArray2),
      statistics: [],
    };

    const groupedByHour = groupHoursByDate(assignedData);

    let averageRatingLineStatistics = {
      key: 'Average Rating',
      statisticsPerHour: [],
      detailedHeading: 'Average Rating',
      class: '',
    };

    groupedByHour.forEach((element) => {
      const { hour, dayGroups } = element;

      const ratingData = [];

      values.forEach((rating) => {
        const ratingCountOfHour = dayGroups.reduce((sum, day) =>
          sum + day.group.filter(gEl => gEl.answer.rating === rating).length, 0);

        ratingData.push({ rating, ratingCountOfHour, amountOfDays: dayGroups.length });
      });

      const valueSum = ratingData
        .reduce((sum, r) => sum + (r.rating * r.ratingCountOfHour), 0);

      const overallAmountOfVotes = ratingData
        .reduce((sum, r) => sum + r.ratingCountOfHour, 0);

      const average = (overallAmountOfVotes > 0)
        ? Math.round((valueSum / overallAmountOfVotes) * 100) / 100 : 0;

      const averageForHour = {
        hour,
        value: average,
        detailedValue: 'Amount of Votes: ',
        detailedBonus: overallAmountOfVotes,
      };

      averageRatingLineStatistics.statisticsPerHour.push(averageForHour);
    });

    averageRatingLineStatistics = setOverallValue(averageRatingLineStatistics, 'Overall average: ');

    lineChart.statistics.push(averageRatingLineStatistics);
    lineChart.yMax = max;

    const barChart = {
      elementName: 'Possible Ratings',
      colorScale: d3.scaleOrdinal().range(colorArray2),
      statistics: [],
    };

    const notNull = assignedData.answers.filter(answerData => answerData.answer.rating !== null);
    const averageValue = // lineChart.statistics[0].statisticsPerHour[0].averageValue;
      notNull.reduce((acc, element) => acc + element.answer.rating, 0) / notNull.length;
    const closestValue = values.reduce((prev, curr) =>
      (Math.abs(curr - averageValue) < Math.abs(prev - averageValue) ? curr : prev));

    const amounts = { label: 'Amount of Votes', data: [] };
    values.forEach((value) => {
      const count = assignedData.answers
        .filter(answerData => answerData.answer.rating === value).length;

      let classString = '';
      if (assignedData.question.default === value) classString += 'default ';
      if (closestValue === value) classString += 'average';

      amounts.data.push({
        key: value,
        value: count,
        detailedValue: Math.round((count / assignedData.answers.length) * 1000) / 10,
        detailedBonus: '%',
        detailedHeading: `Rating ${value}`,
        class: classString,
      });
    });

    const neutralCount =
      assignedData.answers.filter(answerData => answerData.answer.rating === null).length;
    amounts.data.push({
      key: 'NA',
      value: neutralCount,
      detailedValue: Math.round((neutralCount / assignedData.answers.length) * 1000) / 10,
      detailedBonus: '%',
      detailedHeading: 'Not answered',
      class: 'neutral',
    });

    barChart.statistics.push(amounts);

    barChart.statistics[0].yMax = d3.max(barChart.statistics[0].data, d => d.value);

    const pieChart = { ...barChart };
    pieChart.statistics = JSON.parse(JSON.stringify(barChart.statistics));
    pieChart.statistics = pieChart.statistics.map(statistic => reverseStatisticValues(statistic));
    pieChart.statistics = pieChart.statistics.map((statistic) => {
      const boundFilteredStatistic = statistic;
      boundFilteredStatistic.data = groupLowerBoundValues(statistic.data, assignedData.answers.length, 'Ratings');
      return boundFilteredStatistic;
    });

    const names = values.map(value => `Rating ${value}`);
    const colorScale = d3.scaleOrdinal().range(colorArray2);
    const colors = names.map(name => colorScale(name));

    const labels = names.map((name, i) => ({ key: values[i], label: name }));

    return {
      barChart,
      pieChart,
      lineChart,
      colors: [...colors, 'gray'],
      labels: [...labels, { key: 'NA', label: 'Not answered' }],
    };
  };

  const allPointsPerAnswer = (sum, number) => {
    if (number > 0) return allPointsPerAnswer(sum + number, number - 1);
    return sum;
  };

  const prepareRANKING = (assignedData) => {
    const { items } = assignedData.question;
    const maxPointsPerAnswer = items.length;
    const notNull = assignedData.answers.filter(answerData => answerData.answer !== null);
    const groupedByHour = groupHoursByDate(assignedData);

    const lineChart = {
      xLabels: Array.from(Array(24).keys()),
      label: 'Average score at hour (if voted)',
      elementName: 'Hours of a day',
      colorScale: d3.scaleOrdinal().range(colorArray2),
      statistics: [],
    };

    items.forEach((item, i) => {
      let itemLineStatistics = {
        key: i + 1,
        statisticsPerHour: [],
        detailedHeading: (item.label) ? item.label : `Item ${i}`,
        class: '',
      };

      groupedByHour.forEach((element) => {
        const { hour, dayGroups } = element;
        const itemValueOfHour = dayGroups.reduce((sum, day) => {
          const itemValueOfDay = day.group.reduce((daySum, answerData) => {
            if (answerData.answer === null) return daySum;
            const index = answerData.answer.indexOf(item.id);
            return (index > -1)
              ? { value: daySum.value + (maxPointsPerAnswer - index), amount: daySum.amount + 1 }
              : daySum;
          }, { value: 0, amount: 0 });

          return (itemValueOfDay.amount > 0)
            ? {
              value: sum.value + itemValueOfDay.value,
              amount: sum.amount + itemValueOfDay.amount,
            }
            : sum;
        }, { value: 0, amount: 0 });

        const averageForHour = (itemValueOfHour.amount > 0)
          ? itemValueOfHour.value / itemValueOfHour.amount : 0;
        const iAverage = Math.round((((averageForHour) / items.length) * 10) * 100) / 100;

        const itemForHour = {
          hour,
          value: iAverage,
          image: (item.image) ? item.image.url : null,
          detailedValue: 'Amount of Votes: ',
          detailedBonus: itemValueOfHour.amount,
        };

        itemLineStatistics.statisticsPerHour.push(itemForHour);
      });

      itemLineStatistics = setOverallValue(itemLineStatistics, 'Overall average: ');

      lineChart.statistics.push(itemLineStatistics);
    });

    lineChart.yMax = 10;

    const barChart = {
      elementName: 'Items',
      colorScale: d3.scaleOrdinal().range(colorArray2),
      statistics: [],
    };


    const maxPossiblePoints = items.length * notNull.length;
    const itemRatings = { label: 'Item rating Score', data: [], yMax: 10 };
    items.forEach((item, i) => {
      const itemValue = notNull.reduce((sum, answerData) => {
        const index = answerData.answer.indexOf(item.id);
        return (index > -1) ? sum + (maxPointsPerAnswer - index) : sum;
      }, 0);
      itemRatings.data.push({
        key: i + 1,
        value: // lineChart.statistics[i].statisticsPerHour[0].averageValue,
          Math.round((itemValue / maxPossiblePoints) * 100) / 10,
        detailedHeading: (item.label) ? item.label : `Item ${i}`,
        image: (item.image) ? item.image.url : null,
      });
    });

    /* const notAnsweredScore =
      answerList.filter(answerData => answerData.answer === null).length * maxPointsPerAnswer

    itemRatings.data.push({
      key: 'neutral',
      value: (Math.round((notAnsweredScore / maxPossiblePoints) * 100) / 10),
      class: 'neutral',
    }) */

    // itemRatings.data = itemRatings.data.sort((a, b) => b.value - a.value);

    barChart.statistics.push(itemRatings);

    for (let placement = 0; placement < items.length; placement += 1) {
      const placementData = [];
      items.forEach((item, i) => {
        const amountForPlacement = notNull.reduce((sum, answerData) => {
          const index = answerData.answer.indexOf(item.id);
          return (index > -1 && index === placement) ? sum + 1 : sum;
        }, 0);

        placementData.push({
          key: i + 1,
          value: Math.round((amountForPlacement / notNull.length) * 1000) / 10,
          valueBonus: '%',
          detailedValue: amountForPlacement,
          detailedHeading: (item.label) ? item.label : `Item ${i}`,
          image: (item.image) ? item.image.url : null,
        });
      });

      barChart.statistics.push({
        label: `Amount for place: ${placement + 1}`,
        data: placementData,
        yMax: d3.max(placementData, d => d.value),
      });
    }

    const pieChart = { ...barChart };
    pieChart.statistics = JSON.parse(JSON.stringify(barChart.statistics));
    pieChart.statistics = pieChart.statistics.map((stat, index) => {
      if (index === 0) return stat;
      const newStat = stat;
      newStat.data = groupLowerBoundValues(stat.data, notNull.length, 'Items');
      return newStat;
    });

    barChart.statistics = pieChart.statistics.reduce((acc, statistic, index) => {
      if (index > 0) {
        let reversed = JSON.parse(JSON.stringify(statistic));
        reversed.data = reversed.data.reduce((innerAcc, data) =>
          ((data.key === 'Items below 5%') ? innerAcc : [...innerAcc, data]), []);

        reversed = reverseStatisticValues(reversed);
        const allValues = reversed.data.map(d => d.value);
        reversed.yMax = d3.max(allValues);
        return [...acc, reversed];
      }
      return [...acc, statistic];
    }, []);
    // pieChart.statistics.shift();

    /* pieChart.statistics = pieChart.statistics.map((statistic) => {
      const sortedData = statistic.data.sort((a, b) => b.value - a.value)
      const sortedStatistic = statistic
      sortedStatistic.data = sortedData
      return sortedStatistic
    }) */

    const names = items.map((item, i) => ((item.label) ? item.label : `Item ${i}`));
    const colorScale = d3.scaleOrdinal().range(colorArray2);
    const colors = names.map(name => colorScale(name));

    const labels = names.map((name, i) => ({ key: i + 1, label: name }));

    return {
      barChart,
      pieChart,
      lineChart,
      colors,
      labels: [...labels],
    };
  };

  const prepareData = (assignedQuestionsData) => {
    const preparedData = [];

    assignedQuestionsData.assignedQuestions.forEach((assignedData) => {
      switch (assignedData.question.type) {
        case 'LIKE': {
          preparedData.push(
            prepareLIKE(assignedData),
          );
          break;
        }
        case 'LIKEDISLIKE': {
          preparedData.push(
            prepareLIKEDISLIKE(assignedData),
          );
          break;
        }
        case 'CHOICE': {
          preparedData.push(
            prepareCHOICE(assignedData),
          );
          break;
        }
        case 'REGULATOR': {
          preparedData.push(
            prepareREGULATOR(assignedData),
          );
          break;
        }
        case 'FAVORITE': {
          preparedData.push(
            prepareFAVORITE(assignedData),
          );
          break;
        }
        case 'RANKING': {
          preparedData.push(
            prepareRANKING(assignedData),
          );
          break;
        }
        default:
          break;
      }
    });

    return preparedData;
  };

  /*
    options {context, device, from, until}
   */
  const filterData = (assignedData, options) => {
    const newAssigned = JSON.parse(JSON.stringify(assignedData));

    newAssigned.assignedQuestions = newAssigned.assignedQuestions.map((question) => {
      const newAs = question;
      newAs.answers = newAs.answers.map((answer) => {
        const newAnswer = answer;
        newAnswer.date = new Date(newAnswer.date);
        return newAnswer;
      });
      return newAs;
    });

    newAssigned.assignedQuestions = newAssigned.assignedQuestions.map((data) => {
      const filteredData = JSON.parse(JSON.stringify(data));
      filteredData.answers = data.answers.filter((answer) => {
        let matches = true;
        if (options.context && answer.context !== options.context) matches = false;
        if (options.device && answer.device !== options.device) matches = false;
        if (options.from && answer.date < options.from) matches = false;
        if (options.until && answer.date > options.until) matches = false;

        return matches;
      });

      return filteredData;
    });

    return prepareData(newAssigned);
  };

  return Object.freeze({
    assignAnswersToQuestion,
    prepareData,
    filterData,
  });
};

export default {
  createDataModifier,
};

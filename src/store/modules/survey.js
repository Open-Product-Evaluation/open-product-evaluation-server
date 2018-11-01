import Surveys from '@/api/survey';
import Router from '@/router';
import Questions from '@/api/question';

const state = {
  surveys: [],
  currentSurvey: {
    questions: [],
    votes: [],
  },
};

const getters = {
  getSurveys: _state => _state.surveys,
  getSurvey: _state => _state.currentSurvey,
  getQuestions: _state => _state.currentSurvey.questions || [],
  getQuestion: _state => questionID => _state.currentSurvey
    .questions
    .find(question => question.id === questionID),
  getImages: (_state) => {
    if (_state.currentSurvey.images) {
      return [..._state.currentSurvey.images];
    }
    return [];
  },
  getVotes: _state => _state.currentSurvey.votes || [],
  getImage: _state => imageID => _state.currentSurvey.images.find(item => item.id === imageID),
};

const mutations = {
  currentSurvey(_state, payload) {
    // eslint-disable-next-line
    _state.currentSurvey = payload;
  },
  setSurveys(_state, surveys) {
    // eslint-disable-next-line
    _state.surveys = surveys;
  },
  createSurvey(_state, survey) {
    // eslint-disable-next-line
    _state.surveys = [ survey, ..._state.surveys];
  },
  updateSurvey(_state, payload) {
    const survey = { ...payload };

    survey.title = payload.title;
    survey.description = payload.description;

    // WTF
    if (payload.isPublic === 'true') {
      survey.isPublic = true;
    } else if (payload.isPublic === 'false') {
      survey.isPublic = false;
    } else {
      survey.isPublic = payload.isPublic;
    }

    // eslint-disable-next-line
    _state.currentSurvey = survey;
  },
  deleteSurvey(_state, payload) {
    // eslint-disable-next-line
    _state.surveys = _state.surveys.filter(s => s.id !== payload.id);
  },
  createLabel(_state, payload) {
    const survey = { ..._state.currentSurvey };

    const questions = [...survey.questions];

    const questionIndex = questions.findIndex(item => item.id === payload.id);

    const question = { ...questions[questionIndex] };

    let labels = [];

    if (question.labels) {
      labels = [...question.labels];
    }

    labels.push(payload.label);

    question.labels = labels;
    questions[questionIndex] = question;

    survey.questions = questions;

    // eslint-disable-next-line
    _state.currentSurvey = survey;
  },
  updateLabel(_state, payload) {
    const survey = { ..._state.currentSurvey };

    const questions = [...survey.questions];
    const questionIndex = questions.findIndex(item => item.id === payload.question.id);

    const question = { ...questions[questionIndex] };

    const labels = [...question.labels];

    const labelIndex = labels.findIndex(item => item.id === payload.label.id);

    labels[labelIndex] = payload.label;

    question.labels = labels;

    questions[questionIndex] = question;

    survey.questions = questions;

    // eslint-disable-next-line
    _state.currentSurvey = survey;
  },
  deleteLabel(_state, payload) {
    const survey = { ..._state.currentSurvey };
    const questions = [...survey.questions];
    const questionIndex = questions.findIndex(item => item.id === payload.question.id);
    const question = { ...questions[questionIndex] };
    const labels = [...question.labels].filter(c => c.id !== payload.label.id);

    question.labels = labels;
    questions[questionIndex] = question;

    survey.questions = questions;

    // eslint-disable-next-line
    _state.currentSurvey = survey;
  },
  createChoice(_state, payload) {
    const survey = { ..._state.currentSurvey };

    const questions = [...survey.questions];

    const questionIndex = questions.findIndex(item => item.id === payload.id);

    const question = { ...questions[questionIndex] };

    let choices = [];

    if (question.choices) {
      choices = [...question.choices];
    }

    choices.push(payload.choice);

    question.choices = choices;
    questions[questionIndex] = question;

    survey.questions = questions;

    // eslint-disable-next-line
    _state.currentSurvey = survey;
  },
  updateChoice(_state, payload) {
    const survey = { ..._state.currentSurvey };
    const questions = [...survey.questions];
    const questionIndex = questions.findIndex(item => item.id === payload.question.id);
    const question = { ...questions[questionIndex] };
    const choices = [...question.choices];
    const choiceIndex = choices.findIndex(c => c.id === payload.choice.id);

    choices[choiceIndex] = payload.choice;

    question.choices = choices;
    questions[questionIndex] = question;

    survey.questions = questions;

    // eslint-disable-next-line
    _state.currentSurvey = survey;
  },
  deleteChoice(_state, payload) {
    const survey = { ..._state.currentSurvey };
    const questions = [...survey.questions];
    const questionIndex = questions.findIndex(item => item.id === payload.question.id);
    const question = { ...questions[questionIndex] };
    const choices = [...question.choices].filter(c => c.id !== payload.choice.id);

    question.choices = choices;
    questions[questionIndex] = question;

    survey.questions = questions;

    // eslint-disable-next-line
    _state.currentSurvey = survey;
  },
  createItem(_state, payload) {
    const survey = { ..._state.currentSurvey };

    const questions = [...survey.questions];
    const questionIndex = questions.findIndex(item => item.id === payload.id);

    const question = { ...questions[questionIndex] };

    let items = [];

    if (question.items) {
      items = [...question.items];
    }

    items.push(payload.item);

    question.items = items;

    questions[questionIndex] = question;

    survey.questions = questions;

    // eslint-disable-next-line
    _state.currentSurvey = survey;
  },
  updateItem(_state, payload) {
    const survey = { ..._state.currentSurvey };

    const questions = [...survey.questions];
    const questionIndex = questions.findIndex(item => item.id === payload.question.id);

    const question = { ...questions[questionIndex] };

    const items = [...question.items];

    const itemIndex = items.findIndex(item => item.id === payload.item.id);

    items[itemIndex] = payload.item;

    question.items = items;

    questions[questionIndex] = question;

    survey.questions = questions;

    // eslint-disable-next-line
    _state.currentSurvey = survey;
  },
  deleteItem(_state, payload) {
    const survey = { ..._state.currentSurvey };

    const questions = [...survey.questions];
    const questionIndex = questions.findIndex(item => item.id === payload.question.id);

    const question = { ...questions[questionIndex] };

    const items = [...question.items].filter(item => item.id !== payload.item.id);

    question.items = items;

    questions[questionIndex] = question;

    survey.questions = questions;

    // eslint-disable-next-line
    _state.currentSurvey = survey;
  },
  createQuestion(_state, payload) {
    const survey = { ..._state.currentSurvey };

    let questions = [];

    if (survey.questions && survey.questions.length > 0) {
      questions = [...survey.questions, payload];
    } else {
      questions.push(payload);
    }

    survey.questions = questions;

    // eslint-disable-next-line
    _state.currentSurvey = survey;
  },
  updateQuestion(_state, payload) {
    const survey = { ..._state.currentSurvey };

    const questions = [...survey.questions];

    const questionIndex = questions.findIndex(q => q.id === payload.id);

    const question = { ...questions[questionIndex] };

    question.value = payload.value;
    question.description = payload.description;
    question.type = payload.type;

    questions[questionIndex] = question;

    survey.questions = questions;

    // eslint-disable-next-line
    _state.currentSurvey = survey;
  },
  updateRegulatorQuestion(_state, payload) {
    const survey = { ..._state.currentSurvey };

    const questions = [...survey.questions];

    const questionIndex = questions.findIndex(q => q.id === payload.id);

    const question = { ...questions[questionIndex] };

    question.min = payload.min;
    question.max = payload.max;
    question.default = payload.default;
    question.stepSize = payload.stepSize;

    questions[questionIndex] = question;

    survey.questions = questions;

    // eslint-disable-next-line
    _state.currentSurvey = survey;
  },
  deleteQuestion(_state, payload) {
    const survey = { ..._state.currentSurvey };

    const questions = [...survey.questions].filter(item => item.id !== payload.questionID);

    survey.questions = questions;

    // eslint-disable-next-line
    _state.currentSurvey = survey;
  },
  changeQuestionType(_state, payload) {
    const surveyID = parseInt(payload.surveyID, 10);
    const questionID = parseInt(payload.questionID, 10);

    const surveyIndex = _state.surveys.findIndex(s => s.id === surveyID);

    const questionIndex = _state.surveys[surveyIndex]
      .questions
      .findIndex(q => q.id === questionID);

    const newQuestion = {
      id: payload.question.id,
      value: payload.question.value,
      description: payload.question.description,
      type: payload.type,
      items: [],
    };

    if (payload.type === 'CHOICE') {
      newQuestion.choices = [];
    }

    if (payload.type === 'REGULATOR') {
      newQuestion.labels = [];
    }

    // eslint-disable-next-line
    _state.surveys[surveyIndex].questions[questionIndex] = newQuestion;
  },
  createImage(_state, payload) {
    const survey = { ..._state.currentSurvey };
    const images = [payload.image, ...survey.images];

    survey.images = images;

    // eslint-disable-next-line
    _state.currentSurvey = survey;
  },
  deleteImage(_state, payload) {
    const survey = { ..._state.currentSurvey };

    const images = [...survey.images].filter(item => item.id !== payload);

    survey.images = images;

    // eslint-disable-next-line
    _state.currentSurvey = survey;
  },
  uploadChoiceImage(_state, payload) {
    const survey = { ..._state.currentSurvey };
    const questions = [...survey.questions];
    const questionIndex = questions.findIndex(item => item.id === payload.questionID);
    const question = { ...questions[questionIndex] };
    const choices = [...question.choices];
    const choiceIndex = choices.findIndex(c => c.id === payload.choice.id);

    choices[choiceIndex] = payload.choice;

    question.choices = choices;
    questions[questionIndex] = question;

    survey.questions = questions;

    // eslint-disable-next-line
    _state.currentSurvey = survey;
  },
  uploadItemImage(_state, payload) {
    const survey = { ..._state.currentSurvey };
    const questions = [...survey.questions];
    const questionIndex = questions.findIndex(item => item.id === payload.questionID);
    const question = { ...questions[questionIndex] };
    const items = [...question.items];
    const itemIndex = items.findIndex(i => i.id === payload.item.id);

    items[itemIndex] = payload.item;

    question.items = items;
    questions[questionIndex] = question;

    survey.questions = questions;

    // eslint-disable-next-line
    _state.currentSurvey = survey;
  },
  uploadLabelImage(_state, payload) {
    const survey = { ..._state.currentSurvey };
    const questions = [...survey.questions];
    const questionIndex = questions.findIndex(item => item.id === payload.questionID);
    const question = { ...questions[questionIndex] };
    const labels = [...question.labels];
    const labelIndex = labels.findIndex(l => l.id === payload.label.id);

    labels[labelIndex] = payload.label;

    question.labels = labels;
    questions[questionIndex] = question;

    survey.questions = questions;

    // eslint-disable-next-line
    _state.currentSurvey = survey;
  },
};

const actions = {
  getSurveys(context) {
    Surveys.getSurveys()
      .then((data) => {
        context.commit('setSurveys', data.data.surveys);
      });
  },
  getSurvey({ commit }, payload) {
    Surveys.getSurvey(payload.surveyID)
      .then((data) => {
        commit('currentSurvey', data.data.survey);
      });
  },
  createSurvey({ commit }, payload) {
    Surveys.createSurvey(payload.title, payload.description)
      .then((data) => {
        commit('createSurvey', data.data.createSurvey.survey);
        Router.push('/survey');
      });
  },
  updateSurvey({ commit }, payload) {
    Surveys.updateSurvey(
      payload.id,
      payload.title,
      payload.description,
      payload.isPublic,
    ).then((data) => {
      commit('updateSurvey', data.data.updateSurvey.survey);
    });
  },
  deleteSurvey({ commit }, payload) {
    Surveys.deleteSurvey(payload.id)
      .then(() => {
        commit('deleteSurvey', payload);
      });
  },
  createLabel({ commit }, payload) {
    Questions.createLabel(payload.question.id)
      .then(data => commit('createLabel', {
        id: payload.question.id,
        label: data.data.createLabel.label,
      }));
  },
  updateLabel({ commit }, payload) {
    Questions.updateLabel(
      payload.question.id,
      payload.label.id,
      payload.label.label,
      payload.label.value,
    ).then(() => commit('updateLabel', payload));
  },
  deleteLabel({ commit }, payload) {
    Questions.deleteLabel(payload.question.id, payload.label.id)
      .then(() => commit('deleteLabel', payload));
  },
  createChoice({ commit }, payload) {
    Questions.createChoice(payload.question.id)
      .then(data => commit('createChoice', {
        id: payload.question.id,
        choice: data.data.createChoice.choice,
      }));
  },
  updateChoice({ commit }, payload) {
    Questions.updateChoice(payload.question.id, payload.choice.id, payload.choice.label)
      .then(() => commit('updateChoice', payload));
  },
  deleteChoice({ commit }, payload) {
    Questions.deleteChoice(payload.question.id, payload.choice.id)
      .then(() => commit('deleteChoice', payload));
  },
  updateItem({ commit }, payload) {
    Questions.updateItem(payload.question.id, payload.item.id, payload.item.label)
      .then(() => commit('updateItem', payload));
  },
  deleteItem({ commit }, payload) {
    Questions.deleteItem(payload.question.id, payload.item.id)
      .then(() => commit('deleteItem', payload));
  },
  createQuestion({ commit }, payload) {
    Questions.createQuestion(payload.surveyID)
      .then(data => commit('createQuestion', data.data.createQuestion.question));
  },
  updateQuestion({ commit }, payload) {
    Questions.updateQuestion(
      payload.question.id,
      payload.question.value,
      payload.question.description,
      payload.question.type,
    ).then(data => commit('updateQuestion', data.data.updateQuestion.question));
  },
  updateRegulatorQuestion({ commit }, payload) {
    Questions.updateRegulatorQuestion(
      payload.question.id,
      payload.question.min,
      payload.question.max,
      payload.question.stepSize,
      payload.question.default,
    ).then(data => commit('updateRegulatorQuestion', data.data.updateQuestion.question));
  },
  changeQuestionType({ commit }, payload) {
    Questions.updateQuestion(
      payload.question.id,
      payload.question.value,
      payload.question.description,
      payload.question.type,
    ).then(data => commit('updateQuestion', data.data.updateQuestion.question));
  },
  // changeQuestionType: ({ commit }, payload) => commit('changeQuestionType', payload),
  deleteQuestion({ commit }, payload) {
    Questions.deleteQuestion(payload.questionID)
      .then(() => commit('deleteQuestion', payload));
  },
  createItem({ commit }, payload) {
    Questions.createItem(payload.question.id)
      .then(data => commit('createItem', {
        id: payload.question.id,
        item: data.data.createItem.item,
      }));
  },
  createImage({ commit }, payload) {
    Surveys.uploadImage(payload.id, payload.file, payload.tags)
      .then((data) => {
        commit('createImage', {
          surveyID: payload.id,
          image: data.data.createBonusImage.image,
        });
        Router.push(`/survey/${payload.id}`);
      });
  },
  deleteImage({ commit }, payload) {
    Surveys.deleteImage(payload.id)
      .then(() => commit('deleteImage', payload.id));
  },
  uploadChoiceImage({ commit }, payload) {
    Questions.uploadChoiceImage(
      payload.questionID,
      payload.choiceID,
      payload.file,
    ).then(data => commit('uploadChoiceImage', {
      questionID: payload.questionID,
      choice: data.data.updateChoice.choice,
    }),
    );
  },
  uploadItemImage({ commit }, payload) {
    Questions.uploadItemImage(
      payload.questionID,
      payload.itemID,
      payload.file,
    ).then(data => commit('uploadItemImage', {
      questionID: payload.questionID,
      item: data.data.updateItem.item,
    }),
    );
  },
  uploadLabelImage({ commit }, payload) {
    Questions.uploadLabelImage(
      payload.questionID,
      payload.labelID,
      payload.file,
    ).then(data => commit('uploadLabelImage', {
      questionID: payload.questionID,
      label: data.data.updateLabel.label,
    }),
    );
  },
};

export default {
  state,
  getters,
  mutations,
  actions,
};

/**
 * Created by Dennis Dubbert on 27.06.18.
 */
const getObjectID = require('../../helper.js')

const question = [
  {
    _id: getObjectID('question1'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    type: 'CHOICE',
    items: null,
    value: 'Bitte treffen Sie eine Auswahl:',
    description: null,
    choices: [
      {
        label: 'Auswahl A',
        image: getObjectID('image3'),
        code: 'A',
      },
      {
        label: 'Auswahl B',
        image: getObjectID('image4'),
        code: 'B',
      },
    ],
  },
  {
    _id: getObjectID('question4'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    type: 'LIKE',
    items: null,
    value: 'Gefällt Ihnen dieses Objekt?',
    description: 'Bitte zeigen Sie mit einem "Like", ob Ihnen dieses Objekt gefällt.',
    likeIcon: getObjectID('image1'),
  },
  {
    _id: getObjectID('question5'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    type: 'LIKE',
    items: null,
    value: 'Gefällt Ihnen dieses Model?',
    description: 'Bitte zeigen Sie mit einem "Like", ob Ihnen dieses Model gefällt.',
    likeIcon: getObjectID('image1'),
  },
  {
    _id: getObjectID('question10'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    type: 'REGULATOR',
    items: null,
    value: 'Wie sehr sind Sie mit dieser Frage zufrieden?',
    description: null,
    labels: [
      {
        label: 'Unzufrieden',
        image: null,
        value: 0.0,
      },
      {
        label: 'Zufrieden',
        image: null,
        value: 10.0,
      },
    ],
    stepSize: 1.0,
    min: 0.0,
    max: 10.0,
    default: 5.0,
  },
  {
    _id: getObjectID('question2'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    type: 'FAVORITE',
    value: 'Bitte favorisieren Sie ein Element aus dieser Liste',
    description: null,
    items: [
      {
        label: 'Objekt 1',
        image: getObjectID('image6'),
      },
      {
        label: 'Objekt 2',
        image: getObjectID('image5'),
      },
    ],
  },
  {
    _id: getObjectID('question3'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    type: 'LIKE',
    items: null,
    value: 'Gefällt Ihnen dieses Bild?',
    description: 'Bitte zeigen Sie mit einem "Like", ob Ihnen dieses Bild gefällt.',
    likeIcon: getObjectID('image1'),
  },
  {
    _id: getObjectID('question6'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    type: 'LIKEDISLIKE',
    items: null,
    value: 'Gefällt Ihnen dieses Bild?',
    description: 'Bitte zeigen Sie mit einem "Like" oder "Dislike", ob Ihnen dieses Bild gefällt oder nicht.',
    likeIcon: getObjectID('image1'),
    dislikeIcon: getObjectID('image2'),
  },
  {
    _id: getObjectID('question7'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    type: 'LIKEDISLIKE',
    items: null,
    value: 'Gefällt Ihnen dieses Objekt?',
    description: 'Bitte zeigen Sie mit einem "Like" oder "Dislike", ob Ihnen dieses Objekt gefällt oder nicht.',
    likeIcon: getObjectID('image1'),
    dislikeIcon: getObjectID('image2'),
  },
  {
    _id: getObjectID('question8'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    type: 'LIKEDISLIKE',
    items: null,
    value: 'Gefällt Ihnen dieses Model?',
    description: 'Bitte zeigen Sie mit einem "Like" oder "Dislike", ob Ihnen dieses Model gefällt oder nicht.',
    likeIcon: getObjectID('image1'),
    dislikeIcon: getObjectID('image2'),
  },
  {
    _id: getObjectID('question9'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    type: 'RANKING',
    value: 'Ordnen Sie diese Elemente nach ihrem persönlichen Wert.',
    description: null,
    items: [
      {
        label: 'Objekt 1',
        image: getObjectID('image5'),
      },
      {
        label: 'Objekt 2',
        image: getObjectID('image6'),
      },
    ],
  },
]

module.exports = question

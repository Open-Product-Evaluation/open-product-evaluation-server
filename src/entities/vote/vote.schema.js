const mongoose = require('mongoose')

const { Schema } = mongoose

const Answer = new Schema({
  question: {
    type: Schema.Types.ObjectId,
    get: id => ((id) ? id.toString() : null),
    required: true,
  },
  type: { type: String, enum: ['CHOICE', 'FAVORITE', 'LIKE', 'LIKEDISLIKE', 'RANKING', 'REGULATOR'], required: true },
  liked: Boolean,
  choiceCode: String,
  rating: Number,
  normalized: Number,
  rankedImages: [Schema.Types.ObjectId],
  favoriteImage: Schema.Types.ObjectId,
}, { _id: false })

const Vote = new Schema({
  survey: {
    type: Schema.Types.ObjectId,
    get: id => ((id) ? id.toString() : null),
    required: true,
  },
  context: {
    type: Schema.Types.ObjectId,
    get: id => ((id) ? id.toString() : null),
    required: true,
  },
  device: {
    type: Schema.Types.ObjectId,
    get: id => ((id) ? id.toString() : null),
    required: true,
  },
  answers: { type: [Answer], required: true },
}, { timestamps: { createdAt: 'creationDate' } })

module.exports = Vote

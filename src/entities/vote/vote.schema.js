const mongoose = require('mongoose')

const { Schema } = mongoose

const Answer = new Schema({
  question: { type: Schema.Types.ObjectId, required: true },
  liked: Boolean,
  choiceCode: String,
  rating: Number,
  normalized: Number,
  rankedImages: [Schema.Types.ObjectId],
  favoriteImage: Schema.Types.ObjectId,
}, { _id: false })

const Vote = new Schema({
  context: { type: Schema.Types.ObjectId, required: true },
  answers: { type: [Answer], required: true },
}, { timestamps: { createdAt: 'creationDate' } })

Vote.virtual('id').get(function addId() {
  return this._id
})

module.exports = Vote

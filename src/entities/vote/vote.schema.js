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

const toClient = function toClient(vote) {
  const obj = vote
  obj.id = obj._id
  delete obj._id

  return obj
}

Vote.post('save', function saveToClient() {
  toClient(this)
})

Vote.post('find', function findToClient() {
  toClient(this)
})

module.exports = Vote

const mongoose = require('mongoose')

const { Schema } = mongoose

const Item = new Schema({
  image: { type: Schema.Types.ObjectId, required: true },
  label: { type: String, required: true },
}, { _id: false })

const ChoiceDescription = new Schema({
  image: Schema.Types.ObjectId,
  label: { type: String, required: true },
  code: { type: String, required: true },
}, { _id: false })

const Label = new Schema({
  image: Schema.Types.ObjectId,
  label: { type: String, required: true },
  value: { type: Number, required: true },
}, { _id: false })

const Question = new Schema({
  creator: { type: Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['CHOICE', 'FAVORITE', 'LIKE', 'LIKEDISLIKE', 'RANKING', 'REGULATOR'], required: true },
  items: [Item],
  value: { type: String, required: true },
  description: { type: String, default: '' },
  likeIcon: Schema.Types.ObjectId,
  dislikeIcon: Schema.Types.ObjectId,
  choices: [ChoiceDescription],
  default: Schema.Types.Mixed,
  labels: [Label],
  stepSize: Number,
  min: Number,
  max: Number,
}, { timestamps: { createdAt: 'creationDate', updatedAt: 'lastUpdate' } })

Question.virtual('id').get(function addId() {
  return this._id
})

module.exports = Question

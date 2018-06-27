const mongoose = require('mongoose')

const { Schema } = mongoose
const _ = require('underscore')

const Survey = new Schema({
  creator: { type: Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  isPublic: { type: Boolean, default: false },
  types: [{ type: String, enum: ['CHOICE', 'FAVORITE', 'LIKE', 'LIKEDISLIKE', 'RANKING', 'REGULATOR'] }],
  questions: [Schema.Types.ObjectId],
  votes: [Schema.Types.ObjectId],
  contexts: [Schema.Types.ObjectId],
  images: [Schema.Types.ObjectId],
}, { timestamps: { createdAt: 'creationDate', updatedAt: 'lastUpdate' } })

const toClient = function toClient(survey) {
  const obj = survey
  obj.id = obj._id
  delete obj._id

  return obj
}

Survey.pre('save', function removeDuplicateTypes() {
  _.uniq(this.types)
})

Survey.post('save', function saveToClient() {
  toClient(this)
})

Survey.post('find', function findToClient() {
  toClient(this)
})

module.exports = Survey

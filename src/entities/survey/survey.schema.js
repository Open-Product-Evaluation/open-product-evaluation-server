const mongoose = require('mongoose')

const { Schema } = mongoose

const Survey = new Schema({
  creator: { type: Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  isPublic: { type: Boolean, default: false },
  questions: [Schema.Types.ObjectId],
  images: [Schema.Types.ObjectId],
}, { timestamps: { createdAt: 'creationDate', updatedAt: 'lastUpdate' } })

Survey.virtual('id').get(function addId() {
  return this._id
})

module.exports = Survey

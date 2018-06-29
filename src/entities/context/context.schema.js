const mongoose = require('mongoose')

const { Schema } = mongoose

const State = new Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
}, { _id: false })

const Context = new Schema({
  name: { type: String, required: true },
  activeQuestion: Schema.Types.ObjectId,
  activeSurvey: Schema.Types.ObjectId,
  owners: [Schema.Types.ObjectId],
  devices: [Schema.Types.ObjectId],
  states: [State],
}, { timestamps: { createdAt: 'creationDate', updatedAt: 'lastUpdate' } })

Context.virtual('id').get(function addId() {
  return this._id
})

module.exports = Context

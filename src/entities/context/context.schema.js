const mongoose = require('mongoose')

const { Schema } = mongoose

const State = new Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
}, { _id: false })

const Context = new Schema({
  name: { type: String, required: true },
  activeQuestion: { type: Schema.Types.ObjectId, get: id => ((id) ? id.toString() : null) },
  activeSurvey: { type: Schema.Types.ObjectId, get: id => ((id) ? id.toString() : null) },
  owners: { type: [Schema.Types.ObjectId], get: arr => arr.map(id => id.toString()) },
  states: [State],
}, { timestamps: { createdAt: 'creationDate', updatedAt: 'lastUpdate' } })

module.exports = Context

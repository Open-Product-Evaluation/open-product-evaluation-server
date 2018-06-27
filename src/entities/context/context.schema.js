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

const toClient = function toClient(context) {
  const obj = context
  obj.id = obj._id
  delete obj._id

  return obj
}

Context.post('save', function saveToClient() {
  toClient(this)
})

Context.post('find', function findToClient() {
  toClient(this)
})

module.exports = Context

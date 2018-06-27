const mongoose = require('mongoose')

const { Schema } = mongoose

const Device = new Schema({
  name: { type: String, required: true },
  context: Schema.Types.ObjectId,
  owners: [Schema.Types.ObjectId],
}, { timestamps: { createdAt: 'creationDate', updatedAt: 'lastUpdate' } })

const toClient = function toClient(device) {
  const obj = device
  obj.id = obj._id
  delete obj._id

  return obj
}

Device.post('save', function saveToClient() {
  toClient(this)
})

Device.post('find', function findToClient() {
  toClient(this)
})

module.exports = Device


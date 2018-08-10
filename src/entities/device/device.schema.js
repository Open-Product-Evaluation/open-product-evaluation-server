const mongoose = require('mongoose')

const { Schema } = mongoose

const Device = new Schema({
  name: { type: String, required: true },
  context: Schema.Types.ObjectId,
  owners: { type: [Schema.Types.ObjectId], get: arr => arr.map(id => id.toString()) },
}, { timestamps: { createdAt: 'creationDate', updatedAt: 'lastUpdate' } })

Device.virtual('id').get(function addId() {
  return this._id.toString()
})

module.exports = Device


const mongoose = require('mongoose')

const { Schema } = mongoose

const Device = new Schema({
  name: { type: String, required: true },
  context: Schema.Types.ObjectId,
  owners: [Schema.Types.ObjectId],
}, { timestamps: { createdAt: 'creationDate', updatedAt: 'lastUpdate' } })

Device.virtual('id').get(function addId() {
  return this._id
})

module.exports = Device


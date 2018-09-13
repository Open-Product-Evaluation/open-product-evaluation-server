const mongoose = require('mongoose')

const { Schema } = mongoose

const Device = new Schema({
  name: { type: String, required: true },
  context: { type: Schema.Types.ObjectId, get: id => ((id) ? id.toString() : null) },
  owners: { type: [Schema.Types.ObjectId], get: arr => arr.map(id => id.toString()) },
}, { timestamps: { createdAt: 'creationDate', updatedAt: 'lastUpdate' } })

module.exports = Device


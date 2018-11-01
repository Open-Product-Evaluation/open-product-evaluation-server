const mongoose = require('mongoose')

const { Schema } = mongoose

const Device = new Schema({
  name: { type: String, required: true },
  context: { type: Schema.Types.ObjectId, get: id => ((id) ? id.toString() : null) },
  owners: {
    type: [Schema.Types.ObjectId],
    get: (arr) => {
      if (arr) return arr.map(id => id.toString())
      return []
    },
  },
}, { timestamps: { createdAt: 'creationDate', updatedAt: 'lastUpdate' } })

module.exports = Device


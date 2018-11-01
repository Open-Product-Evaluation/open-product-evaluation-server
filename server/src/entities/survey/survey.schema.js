const mongoose = require('mongoose')

const { Schema } = mongoose

const Survey = new Schema({
  creator: { type: Schema.Types.ObjectId, required: true, get: c => c.toString() },
  title: { type: String, required: true },
  description: { type: String, required: true },
  types: [{ type: String, enum: ['LIKE', 'LIKEDISLIKE', 'CHOICE', 'REGULATOR', 'RANKING', 'FAVORITE'] }],
  isPublic: { type: Boolean, default: false },
  questions: {
    type: [Schema.Types.ObjectId],
    get: (arr) => {
      if (arr) return arr.map(id => id.toString())
      return []
    },
  },
}, { timestamps: { createdAt: 'creationDate', updatedAt: 'lastUpdate' } })

module.exports = Survey

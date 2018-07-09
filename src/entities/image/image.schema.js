const mongoose = require('mongoose')

const { Schema } = mongoose

const ImageData = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  hash: { type: String, required: true },
  tags: [String],
  url: { type: String, required: true },
}, { timestamps: { createdAt: 'creationDate' } })

ImageData.virtual('id').get(function addId() {
  return this._id
})

module.exports = ImageData

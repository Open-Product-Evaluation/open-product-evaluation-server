const mongoose = require('mongoose')

const { Schema } = mongoose

const ImageData = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  hash: { type: String, required: true },
  tags: [String],
  url: { type: String, required: true },
}, { timestamps: { createdAt: 'creationDate' } })

const toClient = function toClient(image) {
  const obj = image
  obj.id = obj._id
  delete obj._id

  return obj
}

ImageData.post('save', function saveToClient() {
  toClient(this)
})

ImageData.post('find', function findToClient() {
  toClient(this)
})

module.exports = ImageData

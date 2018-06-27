

const mongoose = require('mongoose')

const { Schema } = mongoose

const User = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'creationDate', updatedAt: 'lastUpdate' } })

const toClient = function toClient(user) {
  const obj = user
  obj.id = obj._id
  delete obj._id

  return obj
}

User.post('save', function saveToClient() {
  toClient(this)
})

User.post('find', function findToClient() {
  toClient(this)
})

module.exports = User

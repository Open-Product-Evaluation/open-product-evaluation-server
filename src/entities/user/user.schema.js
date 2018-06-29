const mongoose = require('mongoose')

const { Schema } = mongoose

const User = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'creationDate', updatedAt: 'lastUpdate' } })

User.virtual('id').get(function addId() {
  return this._id
})

module.exports = User

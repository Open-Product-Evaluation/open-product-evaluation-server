const mongoose = require('mongoose')

const { Schema } = mongoose

const Password = new Schema({
  passwordHash: { type: String, required: true },
  salt: { type: String, required: true },
})

const User = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  passwordData: { type: Password, required: true },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'creationDate', updatedAt: 'lastUpdate' } })

module.exports = User

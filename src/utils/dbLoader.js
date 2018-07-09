/**
 * Created by Dennis Dubbert on 22.06.18.
 */

const mongoose = require('mongoose')

mongoose.Promise = Promise
const config = require('../../config')

let db

module.exports = {
  getDB: () => db,
  connectDB: async () => {
    db = await mongoose.connect(`mongodb://localhost/${config.db.name}`)
    console.log('connecting db')
  },
}

/**
 * Created by Dennis Dubbert on 23.06.18.
 */


const jwt = require('jsonwebtoken')
const config = require('../../config')

const encodeUser = (id, isAdmin) => jwt.sign({
  id,
  isAdmin,
  type: 'user',
}, config.app.jwtSecret)

const encodeDevice = id => jwt.sign({
  id,
  type: 'device',
}, config.app.jwtSecret)

const decode = (auth) => {
  const token = auth.replace('Bearer ', '')
  return jwt.verify(token, config.app.jwtSecret)
}

const isUser = authObject => (authObject && Object.prototype.hasOwnProperty.call(authObject, 'user'))

const isDevice = authObject => (authObject && Object.prototype.hasOwnProperty.call(authObject, 'device'))

const isAdmin = authObject => (isUser(authObject) && authObject.user.isAdmin)

const userIdIsMatching = (authObject, wishedId) =>
  (isAdmin(authObject) || (isUser(authObject) && authObject.user.id === wishedId))

const deviceIdIsMatching = (authObject, wishedId) =>
  (isDevice(authObject) && authObject.device.id === wishedId)

module.exports = {
  encodeUser,
  encodeDevice,
  decode,
  isUser,
  isDevice,
  isAdmin,
  userIdIsMatching,
  deviceIdIsMatching,
}

/**
 * Created by Dennis Dubbert on 19.09.18.
 */

/** Code taken and adjusted from: https://ciphertrick.com/2016/01/18/salt-hash-passwords-using-nodejs-crypto/ */

const { randomBytes, createHmac } = require('crypto')

const genRandomString = length =>
  randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)

const sha512 = (password, salt) => {
  const hash = createHmac('sha512', salt)
  hash.update(password)
  const passwordHash = hash.digest('hex')
  return {
    salt,
    passwordHash,
  }
}

const saltHashPassword = (userpassword) => {
  const salt = genRandomString(16)
  return sha512(userpassword, salt)
}

const comparePasswords = (password, salt, saltedPassword) => {
  const passwordHash = sha512(password, salt)
  return saltedPassword === passwordHash.passwordHash
}

module.exports = Object.freeze({
  saltHashPassword,
  comparePasswords,
})

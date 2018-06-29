/**
 * Created by Dennis Dubbert on 27.06.18.
 */
const crypto = require('crypto')

const secret = crypto.randomBytes(32)
const iv = crypto.randomBytes(16)

const getMatchingId = (hash) => {
  const encryptedId = Buffer.from(hash, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secret), iv)
  let decrypted = decipher.update(encryptedId)

  decrypted = Buffer.concat([decrypted, decipher.final()])

  return decrypted.toString()
}

const createHashFromId = (id) => {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secret), iv)
  let crypted = cipher.update(id)
  crypted = Buffer.concat([crypted, cipher.final()])

  return crypted.toString('hex')
}

module.exports = {
  getMatchingId,
  createHashFromId,
}

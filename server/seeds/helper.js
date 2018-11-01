const { ObjectId } = require('mongodb')
const { createHash } = require('crypto')

const getObjectID = (name) => {
  const hash = createHash('sha1')
    .update(name, 'utf8')
    .digest('hex')

  return new ObjectId(hash.substring(0, 24))
}

module.exports = getObjectID

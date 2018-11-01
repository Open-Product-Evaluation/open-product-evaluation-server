const { getMatchingId } = require('./idStore')
const { decode } = require('./authUtils')
const { ADMIN, USER, DEVICE } = require('./roles')

module.exports = models => async (req, res, next) => {
  try {
    const auth = req.get('Authorization')
    if (auth) {
      const authObject = decode(auth)
      const matchingId = getMatchingId(authObject.id)
      let role
      let entity
      switch (authObject.type) {
        case 'user': {
          [entity] = await models.user.get({ _id: matchingId })
          role = USER
          if (entity.isAdmin) role = ADMIN
          break
        }
        case 'device': {
          [entity] = await models.device.get({ _id: matchingId })
          role = DEVICE
          break
        }
        default: throw new Error('Unknown entity.')
      }

      req.auth = { [authObject.type]: entity }
      req.auth.id = entity.id
      req.auth.role = role
    }

    next()
  } catch (e) {
    console.log(e)
    res.send({
      data: null,
      errors: [
        { message: 'Authorization failed' },
      ],
    })
  }
}



const authUtils = require('./authUtils')

module.exports = (req, res, next) => {
  try {
    const auth = req.get('Authorization')
    if (auth) {
      const authObject = authUtils.decode(auth)
      req.auth = { [authObject.type]: authObject }
    }
    next()
  } catch (e) {
    res.send({
      data: null,
      errors: [
        { message: e.message },
      ],
    })
  }
}

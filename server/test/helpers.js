const { createHashFromId } = require('../src/utils/idStore')
const { encodeDevice } = require('../src/utils/authUtils')

module.exports = {
  getSeedID: o => createHashFromId(o._id.toHexString()),
  getDeviceToken: o => encodeDevice(createHashFromId(o._id.toHexString())),
}

const deviceSchema = require('./device.schema')
const dbLoader = require('../../utils/dbLoader')

module.exports = () => {
  const Device = dbLoader.getDB().model('device', deviceSchema, 'device')

  return Object.freeze({
    get: async (find, limit, offset, sort) => {
      try {
        const devices = await Device.find(find).limit(limit).skip(offset).sort(sort)
        if (devices.length === 0) throw new Error('No devices found')
        return devices
      } catch (e) {
        throw e
      }
    },
    insert: async (object) => {
      try {
        return (await new Device(object).save())
      } catch (e) {
        throw e
      }
    },
    update: async (id, data) => {
      try {
        const updatedDevice = await Device.findByIdAndUpdate(id, data, { new: true })
        return updatedDevice
      } catch (e) {
        throw e
      }
    },
    delete: async (id) => {
      try {
        const deletedDevice = await Device.findByIdAndDelete(id)
        if (!deletedDevice) throw new Error('User not found.')
        return deletedDevice
      } catch (e) {
        throw e
      }
    },
  })
}

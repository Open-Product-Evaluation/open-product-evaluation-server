const deviceSchema = require('./device.schema')
const _ = require('underscore')

module.exports = (db, eventEmitter) => {
  const deviceModel = {}

  const Device = db.model('device', deviceSchema, 'device')

  deviceModel.get = async (find, limit, offset, sort) => {
    try {
      const devices = await Device.find(find)
        .limit(limit)
        .skip(offset)
        .sort(sort)
      if (devices.length === 0) throw new Error('No devices found')
      return devices
    } catch (e) {
      throw e
    }
  }

  deviceModel.insert = async (object) => {
    try {
      const device = await new Device(object).save()

      eventEmitter.emit('Device/Insert', device)

      return device
    } catch (e) {
      throw e
    }
  }

  deviceModel.update = async (where, data) => {
    try {
      const currentDevices = await Device.find(where)
      const result = await Device.updateMany(where, data)
      if (result.nMatched === 0) throw new Error('Device not found.')
      if (result.nModified === 0) throw new Error('Device update failed.')

      const currentIds = currentDevices.map(device => device.id)
      const updatedDevices = await Device.find({ _id: { $in: currentIds } })

      const sortObj =
        updatedDevices.reduce((acc, device, index) => ({ ...acc, [device.id]: index }), {})
      const currentDevicesSorted = _.sortBy(currentDevices, device => sortObj[device.id])

      eventEmitter.emit('Device/Update', updatedDevices, currentDevicesSorted)

      return updatedDevices
    } catch (e) {
      throw e
    }
  }

  deviceModel.delete = async (where) => {
    try {
      const devices = await Device.find(where)
      const result = await Device.deleteMany(where)
      if (result.n === 0) throw new Error('Device deletion failed.')

      const notDeletedDevices = await Device.find(where)
      const deletedDevices = devices.filter(device => !notDeletedDevices.includes(device))

      if (deletedDevices.length > 0) eventEmitter.emit('Device/Delete', deletedDevices)

      return result
    } catch (e) {
      throw e
    }
  }

  /** EventEmitter reactions * */

  /** Update Devices referencing deleted Contexts * */
  eventEmitter.on('Context/Delete', async (deletedContexts) => {
    try {
      const deletedIds = deletedContexts.map(context => context.id)
      await deviceModel.update({ context: { $in: deletedIds } }, { $unset: { context: '' } })
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }
  })

  return Object.freeze(deviceModel)
}

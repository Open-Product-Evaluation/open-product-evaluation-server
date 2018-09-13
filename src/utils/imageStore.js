/**
 * Created by Dennis Dubbert on 07.07.18.
 */
const {
  createWriteStream, ensureDir, remove, pathExists, readdir,
} = require('fs-extra')
const config = require('../../config')
const shortId = require('shortid')
const { createHashFromId } = require('./idStore')

const mimeList = ['jpeg', 'png', 'gif', 'bmp', 'webp']

module.exports = (eventEmitter) => {
  const isImage = (mimetype) => {
    const types = mimetype.split('/')
    return types[0] === 'image' && mimeList.indexOf(types[1].toLowerCase()) !== -1
  }

  const saveImage = async (file, user) => {
    const { stream, filename, mimetype } = file
    if (!isImage(mimetype)) throw new Error('File is not an Image.')

    return new Promise((resolve, reject) => {
      const userFolder = `${config.app.imageFolder}/${createHashFromId(user)}`
      const mime = mimetype.split('/')[1]
      const hash = shortId.generate()
      ensureDir(userFolder)
        .then(() => {
          stream
            .pipe(createWriteStream(`${userFolder}/${hash}.${mime}`))
            .on('finish', () => resolve({
              name: filename,
              type: mime,
              hash,
              url: `${userFolder}/${hash}.${mime}`,
            }))
            .on('error', () => reject(new Error('Image upload failed.')))
        })
    })
  }

  const removeImage = async (image, user) => {
    const userFolder = `${config.app.imageFolder}/${createHashFromId(user)}`
    const filePath = `${userFolder}/${image.hash}.${image.type}`
    if (await pathExists(userFolder)) {
      if (await pathExists(filePath)) await remove(filePath)

      if ((await readdir(userFolder)).length === 0) await remove(userFolder)
    }
  }

  eventEmitter.on('Image/Delete', async (deletedImages) => {
    const deletePromises =
      deletedImages.map(image => removeImage(image, image.user))
    await Promise.all(deletePromises)
  })

  return Object.freeze({
    saveImage,
    removeImage,
  })
}

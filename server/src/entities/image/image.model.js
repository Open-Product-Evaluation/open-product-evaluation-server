const imageSchema = require('./image.schema')
const _ = require('underscore')

module.exports = (db, eventEmitter) => {
  const imageModel = {}

  const Image = db.model('image', imageSchema, 'image')

  imageModel.get = async (find, limit, offset, sort) => {
    try {
      const images = await Image.find(find)
        .limit(limit)
        .skip(offset)
        .sort(sort)
      if (images.length === 0) throw new Error('No Image found.')
      return images
    } catch (e) {
      throw e
    }
  }

  imageModel.insert = async (object) => {
    try {
      const image = await new Image(object).save()

      eventEmitter.emit('Image/Insert', image)

      return image
    } catch (e) {
      throw e
    }
  }

  imageModel.update = async (where, data) => {
    try {
      const oldImages = await Image.find(where)
      const result = await Image.updateMany(where, data)
      if (result.nMatched === 0) throw new Error('No Image found.')
      if (result.nModified === 0) throw new Error('Image update failed.')

      const oldIds = oldImages.map(image => image.id)
      const updatedImages = await Image.find({ _id: { $in: oldIds } })

      const sortObj =
        updatedImages.reduce((acc, image, index) => ({ ...acc, [image.id]: index }), {})
      const oldImagesSorted = _.sortBy(oldImages, image => sortObj[image.id])

      eventEmitter.emit('Image/Update', updatedImages, oldImagesSorted)

      return updatedImages
    } catch (e) {
      throw e
    }
  }

  imageModel.delete = async (where) => {
    try {
      const images = await Image.find(where)
      const deletableImages = images.reduce((acc, image) => {
        const pathParts = image.url.split('/')
        return (pathParts.indexOf('default') === -1) ? [...acc, image] : acc
      }, [])
      const deletableImageIds = deletableImages.map(image => `${image.id}`)

      const result = await Image.deleteMany({ _id: { $in: deletableImageIds } })
      if (result.n === 0) throw new Error('Image deletion failed.')

      const notDeletedImages = await Image.find({ _id: { $in: deletableImageIds } })
      const deletedImages = deletableImages.filter(image => !notDeletedImages.includes(image))

      eventEmitter.emit('Image/Delete', deletedImages)

      return result
    } catch (e) {
      throw e
    }
  }

  /** EventEmitter reactions * */

  /** Delete Images of deleted Surveys * */
  eventEmitter.on('Survey/Delete', async (deletedSurveys) => {
    try {
      const deletedIds = deletedSurveys.map(survey => survey.id)
      await imageModel.delete({ survey: { $in: deletedIds } })
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }
  })

  /** Delete Image of updated Item if overwritten * */
  eventEmitter.on('Item/Update', async (item, oldItem) => {
    try {
      if (oldItem.image && oldItem.image !== item.image) {
        await imageModel.delete({ _id: oldItem.image })
      }
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }
  })

  /** Delete Image of deleted Item * */
  eventEmitter.on('Item/Delete', async (item) => {
    try {
      if (item.image) {
        await imageModel.delete({ _id: item.image })
      }
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }
  })

  /** Delete Image of updated Label if overwritten * */
  eventEmitter.on('Label/Update', async (label, oldLabel) => {
    try {
      if (oldLabel.image && oldLabel.image !== label.image) {
        await imageModel.delete({ _id: oldLabel.image })
      }
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }
  })

  /** Delete Image of deleted Label * */
  eventEmitter.on('Label/Delete', async (label) => {
    try {
      if (label.image) {
        await imageModel.delete({ _id: label.image })
      }
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }
  })

  /** Delete Image of updated Choice if overwritten * */
  eventEmitter.on('Choice/Update', async (choice, oldChoice) => {
    try {
      if (oldChoice.image && oldChoice.image !== choice.image) {
        await imageModel.delete({ _id: oldChoice.image })
      }
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }
  })

  /** Delete Image of deleted Choice * */
  eventEmitter.on('Choice/Delete', async (choice) => {
    try {
      if (choice.image) {
        await imageModel.delete({ _id: choice.image })
      }
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }
  })

  const getAllImagesOfQuestionForKey = (question, key) =>
    question[key].map(object => object.image)

  const getAllImagesOfQuestion = (question) => {
    const itemImages = getAllImagesOfQuestionForKey(question, 'items')
    const labelImages = getAllImagesOfQuestionForKey(question, 'labels')
    const choiceImages = getAllImagesOfQuestionForKey(question, 'choices')

    let allImages = [...itemImages, ...labelImages, ...choiceImages]

    if (question.likeIcon) allImages = [...allImages, question.likeIcon]
    if (question.dislikeIcon) allImages = [...allImages, question.dislikeIcon]

    return allImages
  }

  /** Delete Images of deleted Question * */
  eventEmitter.on('Question/Delete', async (deletedQuestions) => {
    try {
      const allImages = deletedQuestions.reduce((acc, question) =>
        [...acc, ...getAllImagesOfQuestion(question)], [])

      await imageModel.delete({ _id: { $in: allImages } })
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }
  })

  /** Delete Images overwritten by Question update * */
  eventEmitter.on('Question/Update', async (questions, oldQuestions) => {
    try {
      const imagesToDelete = []

      questions.forEach((question, index) => {
        const oldLikeIcon = oldQuestions[index].likeIcon
        const newLikeIcon = question.likeIcon

        if (oldLikeIcon && newLikeIcon && oldLikeIcon !== newLikeIcon) {
          imagesToDelete.push(oldLikeIcon)
        }

        const oldDislikeIcon = oldQuestions[index].dislikeIcon
        const newDislikeIcon = question.dislikeIcon

        if (oldDislikeIcon && newDislikeIcon && oldDislikeIcon !== newDislikeIcon) {
          imagesToDelete.push(oldDislikeIcon)
        }
      })

      if (imagesToDelete.length > 0) await imageModel.delete({ _id: { $in: imagesToDelete } })
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }
  })

  return Object.freeze(imageModel)
}

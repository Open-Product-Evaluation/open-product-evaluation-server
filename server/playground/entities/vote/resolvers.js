/**
 * Created by Dennis Dubbert on 13.06.18.
 */


module.exports = {
  Answer: {
    __resolveType(obj, context, info) {
      if (obj.liked) {
        if (obj.question.type === 'LikeAnswer') return 'LikeAnswer'
        return 'LikeDislikeAnswer'
      } else if (obj.choiceCode) return 'ChoiceAnswer'
      else if (obj.rating) return 'RegulatorAnswer'
      else if (obj.rankedCodes) return 'RankingAnswer'
      else if (obj.favoriteCode) return 'FavoriteAnswer'
      throw new Error('Unknown Answer')
    },
  },
}

const {
  rule, shield, or, allow,
} = require('graphql-shield')

const { ADMIN, USER } = require('./roles')

const isAuthenticated = rule()(async (parent, args, { request }, info) => request.auth !== null)

const isAdmin = rule()(async (parent, args, { request }, info) => request.auth.role === ADMIN)

const isUser = rule()(async (parent, args, { request }, info) => request.auth.role === USER)

// const isDevice = rule()(async (parent, args, ctx, info) => ctx.auth.role === DEVICE)


const permissions = shield({
  Query: {
    contexts: isAuthenticated,
    context: isAuthenticated,
    state: isAuthenticated,
    devices: isAuthenticated,
    device: isAuthenticated,
    surveys: or(isAdmin, isUser),
    survey: or(isAdmin, isUser),
    users: or(isAdmin, isUser),
    user: or(isAdmin, isUser),
    votes: isAuthenticated,
  },
  Mutation: {
    createContext: or(isAdmin, isUser),
    updateContext: isAuthenticated,
    deleteContext: or(isAdmin, isUser),
    createState: isAuthenticated,
    updateState: isAuthenticated,
    deleteState: isAuthenticated,
    createDevice: allow,
    updateDevice: isAuthenticated,
    deleteDevice: isAuthenticated,
    createBonusImage: or(isAdmin, isUser),
    updateBonusImage: or(isAdmin, isUser),
    deleteBonusImage: or(isAdmin, isUser),
    createQuestion: or(isAdmin, isUser),
    updateQuestion: or(isAdmin, isUser),
    deleteQuestion: or(isAdmin, isUser),
    createItem: or(isAdmin, isUser),
    updateItem: or(isAdmin, isUser),
    deleteItem: or(isAdmin, isUser),
    createLabel: or(isAdmin, isUser),
    updateLabel: or(isAdmin, isUser),
    deleteLabel: or(isAdmin, isUser),
    createChoice: or(isAdmin, isUser),
    updateChoice: or(isAdmin, isUser),
    deleteChoice: or(isAdmin, isUser),
    createSurvey: or(isAdmin, isUser),
    updateSurvey: or(isAdmin, isUser),
    deleteSurvey: or(isAdmin, isUser),
    createUser: allow,
    updateUser: or(isAdmin, isUser),
    deleteUser: or(isAdmin, isUser),
    login: allow,
    createAnswer: isAuthenticated,
  },
  Context: {
    owners: or(isAdmin, isUser),
  },
  Device: {
    owners: or(isAdmin, isUser),
  },
})

module.exports = permissions

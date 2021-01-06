const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { UserInputError } = require('apollo-server')

const User = require('./../../models/User')
const { secret_key } = require('./../../config')
const {validateRegisterInput, validateLoginInput} = require('./../../util/validators')

const generateToken = (user) => {
  return jwt.sign({
    id: user.id,
    email: user.email,
    username: user.username
  }, secret_key, { expiresIn: '1h' })
}

module.exports = {
  Mutation: {
    async login (_, {username, password}) {
      const { errors, valid } = validateLoginInput(username, password)
      if(!valid) {
        throw new UserInputError('Error', {errors})
      }

      const user = await User.findOne({username})
      if(!user) {
        errors.general = 'User not find'
        throw new UserInputError('Error', {errors})
      }

      const match = await bcryptjs.compare(password, user.password)
      if(!match) {
        errors.general = 'Wrong crendetials'
        throw new UserInputError('Wrong crendetials', {errors})
      }

      const token = generateToken(user)

      return {
        ...user._doc,
        id: user._id,
        token
      }

    },
    async register(
      _,
      { registerInput: { username, password, confirmPassword, email } },
    ) {
      const { errors, valid } = validateRegisterInput(username, password, confirmPassword, email)
      if(!valid) {
        throw new UserInputError('Error', {errors})
      }
      const user = await User.findOne({ username })
      if (user) {
        throw new UserInputError('Username is token', {
          errors: {
            username: 'This username is token'
          }
        })
      }

      password = await bcryptjs.hash(password, 12)

      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
      })

      const res = await newUser.save()
      const token = generateToken(res)

      return {
        ...res._doc,
        id: res._id,
        token
      }
    }
  }
}
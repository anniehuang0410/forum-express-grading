const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
// set up Passport strategy
passport.use(new LocalStrategy(
  // customize user field
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  // authenticate user
  (req, email, password, cb) => {
    User.findOne({ where: { email } })
      .then(user => {
        // user not existed
        if (!user) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))
        // user existed
        bcrypt.compare(password, user.password).then(res => {
          // 輸入的密碼與資料庫儲存密碼不一致
          if (!res) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))
          // 密碼一致 -> 成功登入
          return cb(null, user)
        })
      })
  }
))
// serialize and deserialize user
// serialize: 只存 user id
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
// deserialize: 透過 user id，把整個 user 物件實例拿出來
passport.deserializeUser((id, cb) => {
  User.findByPk(id).then(user => {
    user = user.toJSON()
    return cb(null, user)
  })
})
module.exports = passport

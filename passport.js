const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

// for autentication users
function initialize (passport, getUserByEmail, getUserById) {
    const autenticateUsers = async (email, password, done) => {
        const user = getUserByEmail(email)
        if (user == null) {
            return done(null, false, { message: 'No user found with that email' })
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false, { message: 'Password is not correct' })
            }
        } catch (e) {
            console.log(e)
            return done(e)
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email' }, autenticateUsers))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })
}

module.exports = initialize

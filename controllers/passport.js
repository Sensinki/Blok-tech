const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

// for autentication users
function initialize (passport, getUserByEmail, getUserById) {
    const autenticateUsers = async (email, password, done) => {
        const user = await getUserByEmail(email)

        if (user == null) {
            console.log(user)
            return done(null, false, { message: 'No user found with that email' })
        }
        try {
            if (bcrypt.compare(password, user.password)) {
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
    passport.serializeUser((user, done) => {
        done(null, user.id)
        console.log('User is logged out')
    })

    passport.deserializeUser((id, done) => {
        console.log('User is logged in')
        return done(null, getUserById(id))
    })
}

module.exports = initialize

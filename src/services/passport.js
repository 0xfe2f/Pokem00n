const keys = require("../../config/keys");
const bcrypt = require("bcrypt");
const moment = require("moment");

const passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy,
    mongodb = require('mongodb').MongoClient;

// esse arquivo ja ta preparado pra entender o login mas para username, vou adaptar para email

passport.use(
    new LocalStrategy({
            usernameField: "email",
            passwordField: "password",
            passReqToCallback: true
        },
        async(req, email, password, done) => {
            var client = await mongodb.connect(keys.MONGODB_URL, { useUnifiedTopology: true });
            var db = client.db(keys.DB_NAME);
            try {
                const user = await db.collection("users").findOne({ email: email });
                if (user === null) {
                    return done(null, false, { message: "Usuário inválido" });
                } else {
                    const isValidPassword = await bcrypt.compare(password, user.password);
                    if (!isValidPassword) {
                        return done(null, false, { message: "Senha incorreta" });
                    }
                    return done(null, user);
                }
            } catch (err) {
                done(err);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user)
});
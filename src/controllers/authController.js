const passport = require(`passport`);
const express = require(`express`);
const bcrypt = require(`bcrypt`);
const moment = require(`moment`);

const authController = express.Router();

function createHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

module.exports = function(csrfProtection) {

    authController.get("/logout", async(req, res) => {
        if (req.user) {
            req.logOut();
            res.redirect("/auth/login");
        }
    });

    authController.use(async(req, res, next) => {
        // Impede de acessar rotas /auth caso esteja autenticado
        if (req.user)
            return res.redirect(req.user.role == `common` ? '/game' : `/admin`);
        next();
    });

    authController.get('/login', csrfProtection, async(req, res) => {
        res.render(`auth/login`, {
            layout: null,
            csrfToken: req.csrfToken(),
            error: req.flash('error')[0]
        })
    });

    authController.post('/login', csrfProtection, async(req, res, next) => {
        passport.authenticate(`local`, {
            successRedirect: `/game`,
            failureRedirect: `/auth/login`,
            failureFlash: true
        })(req, res, next);
    });

    authController.get('/signup', csrfProtection, async(req, res) => {
        res.render(`auth/signup`, {
            layout: null,
            csrfToken: req.csrfToken()
        })
    });

    authController.post('/signup', csrfProtection, async(req, res) => {
        if (req.body.password != req.body.cpassword)
            return res.send({ success: false, message: `As senhas não batem.` });

        var user = await req.db.collection('users').findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.email }
            ]
        });

        if (user)
            return res.send({ success: false, message: `Email ou username já cadastrados na base de dados.` });
        else {
            var usuario = {
                username: req.body.username,
                email: req.body.email,
                password: createHash(req.body.password),
                registerDate: moment().format(`DD/MM/YYYY`),
                role: `common` // pode ser administrador
            }

            await req.db.collection(`users`).insertOne(usuario);
            return res.send({ success: true });
        }



    });

    authController.get('/recover', csrfProtection, async(req, res) => {
        res.render(`auth/recover`, {
            layout: null,
            csrfToken: req.csrfToken(),
            error: req.flash('error')[0]
        })
    });

    authController.post('/recover', csrfProtection, async(req, res) => {
        var user = await req.db.collection('users').findOne({
            $or: [
                { username: req.body.data },
                { email: req.body.data }
            ]
        });

        if (!user)
            return res.send({ success: false, message: `Não existe um usuário que corresponda aos dados inseridos no banco de dados.` });
        else {

            // gera uma nova senha
            var newPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            // atualiza senha no banco de dados
            await req.db.collection(`users`).updateOne({
                $or: [
                    { username: req.body.data },
                    { email: req.body.data }
                ]
            }, {
                $set: {
                    password: createHash(newPassword)
                }
            })

            // TODO ENVIA SENHA PRO E-MAIL do cliente
            return res.send({ success: true, email: user.email });
        }

    });

    return authController;
}
const express = require(`express`);
const axios = require(`axios`);

const gameController = express.Router();

gameController.use(async(req, res, next) => {
    // Impede de acessar rotas caso não esteja autenticado
    if (!req.user) return res.redirect('/auth/login');
    if (req.user.role == 'admin') return res.redirect('/admin');
    res.locals.user = req.user;
    next();
});

gameController.get('/', async(req, res) => {
    res.render(`main/game/game`, {
        layout: `main/game-template`
            // nada ainda
    });
});


module.exports = gameController;
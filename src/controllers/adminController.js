const express = require(`express`);
const axios = require(`axios`);

const adminController = express.Router();

adminController.use(async(req, res, next) => {
    // Impede de acessar rotas caso não esteja autenticado
    if (!req.user) return res.redirect('/auth/login');
    if (req.user.role != 'admin') return res.redirect('/game');
    res.locals.user = req.user;
    next();
});

adminController.use("/users", require("./admin/userController.js"));

adminController.get('/', async(req, res) => {
    res.redirect(`/admin/users`);
});

module.exports = adminController;
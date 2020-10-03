const express = require("express");
const moment = require("moment");
var mongodb = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const bcrypt = require("bcrypt");

const userController = express.Router();

// Gera hash usando bCrypt
var createHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

userController.route("/").get(async(req, res) => {
    var users = await req.db.collection("users").find({}).toArray();
    res.render("admin/users/all_users", {
        trail: "Users",
        title: "Usuários",
        data: users
    });
});

userController.route("/delete/:id").get(async(req, res) => {
    await req.db.collection("users").deleteOne({ _id: new ObjectId(req.params.id) });
    return res.send({ success: true });
});

userController.route("/:id")
    .get(async(req, res) => {
        var user = await req.db.collection(`users`).findOne({ _id: new ObjectId(req.params.id) });
        res.render("admin/users/edituser", {
            title: "Editar Usuário",
            trail: "Users / Edit User /",
            data: user
        });
    }).post(async(req, res) => {
        if (req.body.password != '')
            req.body.password = createHash(req.body.password);
        else
            delete req.body.password;

        await req.db.collection(`users`).updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });
        res.send({ success: true });
    });

module.exports = userController;
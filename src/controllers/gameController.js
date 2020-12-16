const express = require(`express`);
const axios = require(`axios`);
const moment = require("moment");
const { ObjectId } = require("mongodb");

const gameController = express.Router();

gameController.use(async(req, res, next) => {
    // Impede de acessar rotas caso não esteja autenticado
    if (!req.user) return res.redirect('/auth/login');
    if (req.user.role == 'admin') return res.redirect('/admin');
    res.locals.user = req.user;
    next();
});

gameController.get('/', async(req, res) => {

    var saves = await req.db.collection('saves').find({ userId: (req.user._id) }).toArray();
    for (let i = 0; i < saves.length; i++) {
        var tempTime = moment.duration(saves[i].time);
        saves[i].time = (tempTime.hours() != 0 ? tempTime.hours() + ` hours, ` : ``) + (tempTime.minutes() != 0 ? tempTime.minutes() + ` minutes, ` : ``) +
            tempTime.seconds() + ` seconds`;
    }

    res.render(`main/game/game`, {
        layout: `main/game-template`,
        userId: req.user._id,
        saves: saves
            // nada ainda
    });
});

gameController.post('/new-game', async(req, res) => {

    var obj = {
        userId: req.user._id,
        character: req.body.character,
        creation_date: moment().format('DD/MM/YYYY [às] HH:mm'),
        creation_dateISO: moment().toISOString(),
        lastTime: moment().valueOf(),
        time: "0"
    }

    await req.db.collection('saves').insertOne(obj);
    res.send({ success: true, save: obj._id.toString() });
});

gameController.post('/save-game', async(req, res) => {

    var save = await req.db.collection('saves').findOne({ _id: new ObjectId(req.body.save) });
    var lastTime = parseInt(moment().valueOf() + "") - parseInt(save.lastTime + "");
    // console.log(lastTime);
    var time = parseInt(save.time + "") + lastTime;

    await req.db.collection('saves').updateOne({
        _id: new ObjectId(req.body.save)
    }, {
        $set: {
            time: time,
            x: req.body.x,
            y: req.body.y
        }
    });

    res.send({ success: true });
});

gameController.post('/continue', async(req, res) => {

    // console.log(req.body.save);

    await req.db.collection('saves').updateOne({
        _id: new ObjectId(req.body.save)
    }, {
        $set: {
            lastTime: moment().valueOf()
        }
    })


    res.send({ success: true });
});

module.exports = gameController;
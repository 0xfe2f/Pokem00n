const express = require(`express`);
const axios = require(`axios`);

const kendyController = express.Router();

kendyController.get(`/`, async(req, res) => {
    res.send(`Em construção.`);
});

kendyController.route('/teste')
    .get(async(req, res) => {
        res.send(`teste`);
    })
    .post(async(req, res) => {
        res.send({ success: false });
    });


kendyController.route('/lala/:umNumero')
    .get(async(req, res) => {
        res.send(`o numero digitado foi ` + req.params.umNumero);
        /*
        var jokeUrl = "https://icanhazdadjoke.com/";
        //fetch('./data.json')
        axios.get(jokeUrl)
            .then((response) => {
                console.log(response);
            }).catch((err) => {
                // Do something for an error here
            })
        
        const axios = require('axios');
        axios({
                method: 'get',
                url: 'https://cdn.animenewsnetwork.com/encyclopedia/api.xml?anime=4658',
                responseType: 'stream'
            })
            .then(function(response) {
                res.send(response);
            })
            */
    });


module.exports = kendyController;
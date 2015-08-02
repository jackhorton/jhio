'use strict';

const home = require('../../models/home');
const page = require('./page.marko');

module.exports = function controller(req, res) {
    home.fetchParts(function (err, data) {
        if (err) {
            return res.sendStatus(500).end();
        }

        res.type('html');
        page.render(data, res);
    });
};

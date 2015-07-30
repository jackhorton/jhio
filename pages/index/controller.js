'use strict';

const path = require('path');
const _ = require('lodash');
const home = require('../../models/home');
const page = require('./page.marko');

module.exports = function controller(req, res) {
    home.fetchParts(function (err, data) {
        res.type('html');
        page.render(data, res);
    });
};

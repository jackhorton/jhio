'use strict';

const jade = require('jade');
const path = require('path');
const _ = require('lodash');
const home = require('../../models/home');

module.exports = function controller(req, res) {
    const page = jade.compileFile(path.resolve(__dirname, './page.jade'), {filename: __dirname + '/page.jade', cache: true});

    home.fetchParts(function (err, data) {
        res.type('html');
        _.forEach(data.parts, function (part) {
            part.template = jade.renderFile(part.template, part.data);
        });
        res.send(page(data));
    });
};

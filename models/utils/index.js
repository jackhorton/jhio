'use strict';

const path = require('path');

exports.db = require('./db');
exports.formatTitle = formatTitle;
exports.getComponentPath = getComponentPath;

function formatTitle(pageTitle) {
    return pageTitle + ' | jackhorton.io';
}

function getComponentPath(component) {
    return path.resolve(__dirname, '../../components', component);
}

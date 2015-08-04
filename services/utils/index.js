'use strict';

const path = require('path');

exports.db = require('./db');
exports.formatTitle = formatTitle;
exports.getComponentPath = getComponentPath;

function formatTitle(pageTitle) {
    return pageTitle + ' | jackhorton.io';
}

function getComponentPath(component) {
    const slashIndex = component.lastIndexOf('/');
    const componentName = component.substring(slashIndex > 0 ? slashIndex + 1 : 0);

    return path.resolve(__dirname, '../../components', component, `${componentName}.marko`);
}

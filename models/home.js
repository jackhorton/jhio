'use strict';

const path = require('path');
const utils = require('./utils');

exports.fetchParts = function fetchParts(callback) {
    const response = {
        pageId: 'home',
        pageTitle: utils.formatTitle('Home'),
        parts: [{
            type: 'post',
            template: utils.getComponentPath('home-parts/post/post.marko'),
            data: {
                title: 'Awesome Post Title',
                url: 'https://www.jackhorton.io/posts/awesome-post-title',
                preview: 'Herp merp derp, lerp kerp herminermerp.'
            }
        },
        {
            type: 'activity',
            template: utils.getComponentPath('home-parts/activity/activity.marko'),
            data: {
                service: 'github',
                action: 'star',
                title: 'Starred visionmedia/jade'
            }
        }]
    };

    process.nextTick(function () {
        callback(null, response);
    });
};

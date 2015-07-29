'use strict';

const path = require('path');

const homePartTemplates = {
    post: path.resolve(__dirname, '../components/home-parts/post/post.jade'),
    activity: path.resolve(__dirname, '../components/home-parts/activity/activity.jade')
};

exports.fetchParts = function fetchParts(callback) {
    const response = {
        pageId: 'home',
        parts: [{
            type: 'post',
            template: homePartTemplates.post,
            data: {
                title: 'Awesome Post Title',
                url: 'https://www.jackhorton.io/posts/awesome-post-title',
                preview: 'Herp merp derp, lerp kerp herminermerp.'
            }
        },
        {
            type: 'activity',
            template: homePartTemplates.activity,
            data: {
                service: 'github',
                action: 'star',
                title: 'Starred visionmedia/jade'
            }
        }]
    };

    return callback(null, response);
};

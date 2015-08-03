'use strict';

const async = require('async');
const request = require('request');
const utils = require('./utils');
const config = require('../config');

// only fetch new data every 60 seconds
const TIMEOUT = 1000 * 60 * 10;

const cache = {
    github: {}
};

exports.fetchParts = function fetchParts(callback) {
    async.parallel({
        github: getGithubEvents
    }, function (err, data) {
        callback(err, {
            pageId: 'home',
            pageTitle: utils.formatTitle('Home'),
            header: 'jackhorton.io',
            parts: data
        });
    });
};

/**
 * gets the most recent 30 Events that I created
 * will only fetch events once every 10 minutes
 * @param {Function} callback - a function(err, data) that gets called by async.parallel
 */
function getGithubEvents(callback) {
    if (/* cache.github.lastRequest && Date.now() - cache.github.lastRequest > TIMEOUT */ true) {
        const options = {
            url: 'https://api.github.com/users/jackhorton/events',
            json: true,
            headers: {
                'User-Agent': 'jackhorton.io'
            }
        };

        console.log('Fetching new events from github');
        cache.github.lastRequest = Date.now();

        if (cache.github.ETag) {
            options.headers.ETag = cache.github.ETag;
        }

        request(options, function (err, response, body) {
            if (err) {
                return callback(err);
            }

            cache.github.ETag = response.headers.ETag;
            cache.github.response = body;
            callback(null, body);
        });
    } else {
        console.log('Using cached events from github');
        process.nextTick(function () {
            callback(null, cache.github.response);
        });
    }
}

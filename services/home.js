'use strict';

const async = require('async');
const request = require('request');
const utils = require('./utils');
const GithubEvent = require('./models/GithubEvent');

// only fetch new data every 10 minutes
const TIMEOUT = 1000 * 60 * 10;

const cache = {
    github: {
        lastRequest: 1
    }
};

exports.fetchParts = function fetchParts(callback) {
    async.parallel({
        github: getGithubEvents
    }, function (err, data) {
        callback(err, {
            pageId: 'home',
            pageTitle: utils.formatTitle('Home'),
            header: 'jackhorton.io',
            timeline: data.github
        });
    });
};

/**
 * gets the most recent 30 Events that I created
 * will only fetch events once every 10 minutes
 * @param {Function} callback - a function(err, data) that gets called by async.parallel
 */
function getGithubEvents(callback) {
    const now = Date.now();

    if (now - cache.github.lastRequest > TIMEOUT) {
        const options = {
            url: 'https://api.github.com/users/jackhorton/events',
            json: true,
            headers: {
                'User-Agent': 'jackhorton.io'
            }
        };

        console.log('Services: fetching new events from github');

        cache.github.lastRequest = now;

        if (cache.github.ETag) {
            options.headers.ETag = cache.github.ETag;
        }

        request(options, function (err, response, body) {
            if (err) {
                return callback(err);
            }

            cache.github.ETag = response.headers.ETag;
            cache.github.response = body;
            cache.github.timeline = buildGithubTimeline(body);

            return callback(null, cache.github.timeline);
        });
    } else {
        console.log('Services: using cached events from github');
        process.nextTick(function () {
            callback(null, cache.github.timeline);
        });
    }
}

/**
 * builds a clean timeline activities on github using the raw response from the Events API
 * @param {Array} events - the response from the github Events API
 * @return {Array}
 */
function buildGithubTimeline(events) {
    const timeline = [];

    for (let i = 0; i < events.length; i++) {
        const event = new GithubEvent(events[i]);
        let mergeIndex = -1;

        // only support certain github events
        if (!event.isSupported() || event.isOld()) {
            console.log(`Skipping event: ${event.type} ${event.event.repo.name}`);
            continue;
        }

        // the same event occurring multiple times on the same day
        for (let k = 0; k < timeline.length; k++) {
            const activity = timeline[k];

            if (activity.canMerge(event)) {
                mergeIndex = k;
                break;
            }
        }

        if (mergeIndex >= 0) {
            timeline[mergeIndex].merge(event);
        } else {
            timeline.push(event);
        }
    }

    return timeline.map(function (value) {
        return value.getTemplateData();
    });
}

'use strict';

const async = require('async');
const request = require('request');
const utils = require('./utils');
const config = require('../config');
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

/**
 * we only want to merge certain events that the merge() function knows how to work with
 * this function should return true when the target's and candidate's type both match an event supported by merge()
 * @param {Object} target - the activity to merge into
 * @param {Object} candidate - the activity to be merged
 * @return {boolean}
 */
function isMergable(target, candidate) {
    return target.type === 'PushEvent'
        && candidate.type === 'PushEvent';
}

/**
 * we only want to merge events that occur on the same day
 * this function should return true when date1 and date2 represent the same day
 * @param {Date} date1
 * @param {Date} date2
 * @return {boolean}
 */
function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear()
        && date1.getMonth() === date2.getMonth()
        && date1.getDate() === date2.getDate();
}

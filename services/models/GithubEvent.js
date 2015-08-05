'use strict';

const utils = require('../utils');

const supportedEvents = ['PushEvent', 'IssuesEvent', 'WatchEvent', 'CreateEvent'];

class GithubEvent {
    constructor(event) {
        this.event = event;
        this.date = new Date(event.created_at);
        this.type = event.type;
        this.mergeable = event.type === 'PushEvent';
    }

    isSupported() {
        for (let i = 0; i < supportedEvents.length; i++) {
            if (this.type === supportedEvents[i]) {
                return true;
            }
        }

        return false;
    }

    isOld() {
        const today = new Date();

        if (this.date.getFullYear() < today.getFullYear()) {
            return true;
        }

        return false;
    }

    canMerge(other) {
        return this.mergeable
            && other.type === this.type
            && other.event.repo.name === this.event.repo.name
            && other.date.getFullYear() === this.date.getFullYear()
            && other.date.getMonth() === this.date.getMonth()
            && other.date.getDate() === this.date.getDate();
    }

    merge(other) {
        if (!this.canMerge(other)) {
            throw new Error(`Can not merge ${other.type} into ${this.type}`);
        }

        // increase the size counter
        this.event.payload.size += other.event.payload.size;

        for (let i = 0; i < other.event.payload.commits.length; i++) {
            let otherCommit = other.event.payload.commits[i];

            this.event.payload.commits.push(otherCommit);
        }
    }

    getTemplateData() {
        let text;
        let url;
        const name = this.event.repo.name;

        if (this.type === 'PushEvent') {
            text = `Pushed ${this.event.payload.size} commit${this.event.payload.size > 1 ? 's' : ''} to ${name}`;
            url = `https://www.github.com/${name}`;
        } else if (this.type === 'CreateEvent') {
            text = `Created a new ${this.event.payload.ref_type} at ${name}`;
            url = `https://www.github.com/${name}`;
        } else if (this.type === 'IssuesEvent') {
            text = `Opened an issue with ${name}`;
            url = `https://www.github.com/${name}/issues/${this.event.payload.issue.number}`;
        } else if (this.type === 'WatchEvent') {
            text = `Starred ${name}`;
            url = `https://www.github.com/${name}`;
        }

        return {
            type: 'Github',
            template: utils.getComponentPath('home/activity'),
            'class': 'home-card-activity',
            text,
            url,
            date: this.date.toLocaleString('en-US', {year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Los_Angeles'})
        };
    }
}

module.exports = GithubEvent;

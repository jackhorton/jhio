'use strict';

import {getComponentPath} from '../utils';

export default class GithubEvent {
    constructor(event) {
        this.event = event;
        this.date = new Date(event.created_at);
        this.type = event.type;
    }

    // check if we support this event
    isSupported() {
        const supportedEvents = ['PushEvent', 'IssuesEvent', 'WatchEvent', 'CreateEvent', 'ForkEvent'];

        for (let i = 0; i < supportedEvents.length; i++) {
            if (this.type === supportedEvents[i]) {
                return true;
            }
        }

        return false;
    }

    // check if the event happened in the last 50 days
    isOld() {
        const now = Date.now();
        const old = 1000 * 60 * 60 * 24 * 50;

        if (now - this.date.getTime() > old) {
            return true;
        }

        return false;
    }

    // check if the event can be merged
    canMerge(other) {
        let mergeable = false;

        if (this.type === 'PushEvent' && other.type === 'PushEvent') {
            mergeable = true;
        } else if (
            this.type === 'CreateEvent'
            && other.type === 'CreateEvent'
            && this.event.payload.ref === 'master'
            && other.event.payload.ref === null
        ) {
            // only merge CreateEvent when `this` is the master branch create and `other` is the repository create
            // CreateEvents will always come in this order
            mergeable = true;
        }

        return mergeable
            && other.event.repo.name === this.event.repo.name
            && other.date.getFullYear() === this.date.getFullYear()
            && other.date.getMonth() === this.date.getMonth()
            && other.date.getDate() === this.date.getDate();
    }

    // merge two events to make them cleaner
    merge(other) {
        if (!this.canMerge(other)) {
            throw new Error(`Can not merge ${other.type} into ${this.type}`);
        }

        if (this.type === 'PushEvent') {
            // increase the size counter
            this.event.payload.size += other.event.payload.size;

            for (let i = 0; i < other.event.payload.commits.length; i++) {
                let otherCommit = other.event.payload.commits[i];

                this.event.payload.commits.push(otherCommit);
            }
        } else if (this.type === 'CreateEvent') {
            this.event.payload.ref_type = 'repository';
        }

    }

    getUrl() {
        const name = this.event.repo.name;

        if (this.event.type === 'IssuesEvent') {
            return `https://www.github.com/${name}/issues/${this.event.payload.issue.number}`;
        } else if (this.event.type === 'PullRequestEvent') {
            return `https://www.github.com/${name}/pull/${this.event.payload.pull_request.number}`;
        } else {
            return `https://www.github.com/${name}`;
        }
    }

    getDescription() {
        const name = this.event.repo.name;

        if (this.type === 'PushEvent') {
            return `Pushed ${this.event.payload.size} commit${this.event.payload.size > 1 ? 's' : ''} to ${name}`;
        } else if (this.type === 'CreateEvent') {
            return `Created a new ${this.event.payload.ref_type} at ${name}`;
        } else if (this.type === 'IssuesEvent') {
            return `Opened an issue with ${name}`;
        } else if (this.type === 'WatchEvent') {
            return `Starred ${name}`;
        } else if (this.type === 'ForkEvent') {
            return `Forked ${name}`;
        } else if (this.type === 'PullRequest') {
            return `Opened pull request ${name}#${this.event.payload.pull_request.number}`;
        }
    }

    // make it easy for templates to consume this data
    getTemplateData() {
        let iconClass = 'mega-octicon octicon-';
        let elementClass = 'home-card__activity';
        const name = this.event.repo.name;

        // sort out icon classes
        if (this.type === 'PushEvent') {
            iconClass += 'repo-push';
        } else if (this.type === 'CreateEvent') {
            iconClass += 'file-code';
        } else if (this.type === 'IssuesEvent') {
            iconClass += 'issue-opened';
        } else if (this.type === 'WatchEvent') {
            iconClass += 'star';
        } else if (this.type === 'ForkEvent') {
            iconClass += 'repo-forked';
        } else if (this.type === 'PullRequest') {
            iconClass += 'git-pull-request';
        }

        // sort out element classes
        if (this.type === 'CreateEvent') {
            elementClass += '--github-create';
        }

        return {
            service: 'Github',
            icons: {
                service: 'icon-github',
                event: iconClass
            },
            template: getComponentPath('home/activity'),
            'class': elementClass,
            text: this.getDescription(),
            url: this.getUrl(),
            date: `${this.date.getMonth() + 1}/${this.date.getDate()}/${this.date.getFullYear()}`
        };
    }
}

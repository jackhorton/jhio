'use strict';

export default class GithubMeta {
    constructor() {
        this.commits = {
            amount: 0,
            repositories: new Set()
        };
        this.stars = 0;
        this.forks = 0;
    }

    update(event) {
        if (event.type === 'PushEvent') {
            this.commits.amount += event.payload.size;
            this.commits.repositories.add(event.repo.name);
        } else if (event.type === 'WatchEvent') {
            this.stars += 1;
        } else if (event.type === 'IssuesEvent') {
            this.forks += 1;
        }
    }
}

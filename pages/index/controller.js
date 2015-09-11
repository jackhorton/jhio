'use strict';

import fetchParts from '../../services/home';
import {load} from 'marko';

const page = load(require.resolve('./page.marko'));

export default function controller(req, res) {
    fetchParts((err, data) => {
        if (err) {
            return res.sendStatus(500).end();
        }

        res.type('html');
        page.render(data, res);
    });
}

'use strict';

import fetchParts from '../../services/home';
import * as marko from 'marko';

const page = marko.load(require.resolve('./page.marko'));

export default function controller(req, res) {
    fetchParts(function (err, data) {
        if (err) {
            return res.sendStatus(500).end();
        }

        res.type('html');
        page.render(data, res);
    });
}

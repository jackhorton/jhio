'use strict';

import {load} from 'marko';

const page = load(require.resolve('./page.marko'));

export default function controller(req, res) {
    page.render({}, res);
}

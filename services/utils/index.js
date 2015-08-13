'use strict';

import { resolve } from 'path';

export function formatTitle(pageTitle) {
    return `${pageTitle} | jackhorton.io`;
}

export function getComponentPath(component) {
    const slashIndex = component.lastIndexOf('/');
    const componentName = component.substring(slashIndex > 0 ? slashIndex + 1 : 0);

    return resolve(__dirname, '../../components', component, `${componentName}.marko`);
}

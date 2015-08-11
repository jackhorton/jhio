'use strict';

const $ = require('jquery');

$('main').masonry({
    itemSelector: '.home-activity',
    columnWidth: '.home-activity__sizer',
    percentPosition: 'true'
});

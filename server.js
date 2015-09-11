'use strict';

// allow us to use more ES6 (modules, really) elsewhere
require('babel/register');

const express = require('express');
const compression = require('compression');
const morgan = require('morgan');

var app = express();
var port = process.env.PORT || 8000;

app.use(compression());
app.use(morgan('dev', {
    skip: (req, res) => {
        return req.originalUrl.indexOf('/js') >= 0 || req.originalUrl.indexOf('/css') >= 0;
    }
}));

app.use('/js/vendor', express.static('vendor/js'));
app.use('/js', express.static('static/js'));
app.use('/css/vendor', express.static('vendor/css'));
app.use('/css', express.static('static/css'));

// app.use('/admin', require('./admin'));

app.get('/', require('./pages/index/controller'));

// app.get('/projects', require('./pages/projects/controller'));
// app.get('/posts', require('./pages/posts/controller'));

app.get('/resume', require('./pages/resume/controller'));

app.listen(port, () => {
    console.log('Server started on port ' + port);
});

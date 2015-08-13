'use strict';

// allow us to require('file.marko')
require('marko/node-require').install();

// allow us to use ES6 elsewhere
require('babel/register');

var express = require('express');
var compression = require('compression');
var morgan = require('morgan');

var app = express();

app.use(compression());
app.use(morgan('dev', {
    skip: function (req, res) {
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
// app.get('/resume', require('./pages/resume/controller'));

app.listen(8000, function () {
    console.log('Server started on port 8000');
});

'use strict';

// allow us to require('file.marko')
require('marko/node-require').install();

const express = require('express');
const compression = require('compression');

const app = express();

app.use(compression());

app.use('/js', express.static('static/js'));
app.use('/css', express.static('static/css'));

// app.use('/admin', require('./admin'));

app.get('/', require('./pages/index/controller'));
// app.get('/projects', require('./pages/projects/controller'));
// app.get('/posts', require('./pages/posts/controller'));
// app.get('/resume', require('./pages/resume/controller'));

app.listen(8000);

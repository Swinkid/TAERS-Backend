var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');

var api = require('./routes/api');
var frontend = require('./routes/frontend');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', api);
app.use('/frontend', frontend);


app.use(function(req, res, next) {
  var error = {};

  error.error = "404";

  res.send(JSON.stringify(error));
});

module.exports = app;

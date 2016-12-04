var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var https = require('https');
var http = require('http');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var morgan = require('morgan')('dev');
var flash = require('connect-flash');

var logger = require('morgan');
// var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var add_show = require('./routes/add-show');
var shows = require('./routes/shows');

var app = express();
app.use(morgan);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'galeforce',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


// handle login and registration
app.use('/', index);

// ensure user is logged in
app.use(function(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/login');
    }
});

// show detail page
app.use('/shows', shows);
// handle adding a new show to galeforce
app.use('/add-show', add_show);
app.use('/users', users);

// passport configuration
// with help from here: mherman.org/blog/2015/01/31/local-authentication-with-passport-and-express-4/
var User = require('./models/user');
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// connect to mongoose
// is the environment variable, NODE_ENV, set to PRODUCTION? 
if (process.env.NODE_ENV == 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 var fs = require('fs');
 var path = require('path');
 var fn = path.join(__dirname, 'config.json');
 var data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 var conf = JSON.parse(data);
 var dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/galeforce';
}
//mongoose.connect('mongodb://localhost/galeforce');
mongoose.connect(dbconf);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

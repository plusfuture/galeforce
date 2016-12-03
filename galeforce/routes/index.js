var express = require('express');
var passport = require('passport');
var validator = require('validator');
var request = require('request');
var User = require('../models/user');
var Show = require('../models/show');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    var context = {};
    context.title = 'galeforce';
    context.user = req.user;
    res.render('index', context);
});

router.get('/shows/:show', function(req, res, next) {
    var show = req.params.show;
    Show.findOne({
        slug: show
    }, function(err, foundShow, count) {
        var usrShowRating = req.user.ratings.filter(function(usrShow){
            if (usrShow.showID.toString() === foundShow.showID.toString()) {
                return true;
            }
        })[0];
        console.log(usrShowRating);
        foundShow.usrRating = usrShowRating.rating;
        if (foundShow.avgRating === -1) {
            delete foundShow.avgRating;
        }
        console.log(foundShow);
        res.render('show', foundShow);
    });
});

router.get('/profile', function(req, res, next) {

});

// login and register code courtesy of http://mherman.org/blog/2015/01/31/local-authentication-with-passport-and-express-4
router.get('/register', function(req, res, next) {
    res.render('register', {});
});

router.post('/register', function(req, res, next) {
    User.register(new User({
        username: req.body.username
    }), req.body.password, function(err, user) {
        if (err) {
            return res.render('register', {
                error: err.message
            });
        }

        passport.authenticate('local')(req, res, function() {
            req.session.save(function(err) {
                if (err) {
                    return next(err);
                }
            });
            res.redirect('/');
        });
    });
});

router.get('/login', function(req, res) {
    var errors = req.flash('error');
    console.log(errors);
    res.render('login', {
        user: req.user,
        error: errors
    });
});

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
}), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});


module.exports = router;

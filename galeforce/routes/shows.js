var express = require('express');
var passport = require('passport');
var validator = require('validator');
var request = require('request');
var User = require('../models/user');
var Show = require('../models/show');
var router = express.Router();

router.get('/:show', function(req, res, next) {
    var show = req.params.show;
    Show.findOne({
        slug: show
    }, function(err, foundShow, count) {
        if (err) {
            return next();
        }
        var usrShowRating = req.user.ratings.filter(function(usrShow){
            if (usrShow.showID.toString() === foundShow.showID.toString()) {
                return true;
            }
        })[0];
        if (usrShowRating !== undefined) {
          foundShow.usrRating = usrShowRating.rating;
        }
        if (foundShow.avgRating == -1) {
            console.log('equal');
            foundShow.showAvgRating = 'Not enough ratings yet..';
        } else {
            foundShow.showAvgRating = foundShow.avgRating;
        }
        console.log(foundShow);
        res.render('show', foundShow);
    });
});

router.post('/:show/rate', function(req, res, next) {
    var show = req.params.show;
    console.log('RATING: ' + req.body.usrRating);
    console.log('USER: ' + req.user);
    var usrRating = parseInt(req.body.usrRating, 10);
    var ret = {};
    var showExists = false;
    var newShowAvg;
    var foundShowID;
    Show.findOne({
        slug: show
    }, function(err, foundShow, count) {
        foundShowID = foundShow.showID;
        console.log('Found show: ' + foundShow);
        console.log('Found show rating length: ' + foundShow.ratings.length);
        if ((foundShow.ratings).length === 0) {
            foundShow.ratings.push(
                {
                    userID: req.user._id, 
                    rating: usrRating
                });
            foundShow.avgRating = usrRating;
        } else {
            var numRatings = (foundShow.ratings).length;
            var oldRating = -1;
            for (var i = 0; i < numRatings; i++) {
                // let JS do type coercion between numbers
                if (foundShow.ratings[i].userID == req.user.userID) {
                    oldRating = foundShow.ratings[i];
                    foundShow.ratings[i].rating = usrRating;
                    newShowAvg = ((foundShow.avgRating*numRatings)-oldRating+usrRating) / numRatings;
                    showExists = true;
                    break;
                }
            }
            if (!showExists) {
                foundShow.ratings.push(
                    {
                        userID: req.user.userID,
                        rating: usrRating
                    });
                newShowAvg = ((foundShow.avgRating*numRatings)+usrRating) / (numRatings + 1);
            }
        }
        foundShow.save(function(err, show, count) {
            ret.avgRating = foundShow.avgRating;
        });
    });

    User.findOne({
        _id: req.user._id
    }, function(err, user, count) {
        console.log('Found user: ' + user);
        if (!showExists) {
            user.ratings.push(
                {
                    showID: foundShowID,
                    rating: usrRating
                });
        } else {
            var numShows = (user.ratings).length;
            for (var i = 0; i < numShows; i++) {
                if (user.ratings[i].showID == foundShowID) {
                    user.ratings[i].rating = usrRating;
                    break;
                }
            } 
        }
        user.save();
    });
    res.json({newAvg: newShowAvg});
});

module.exports = router;

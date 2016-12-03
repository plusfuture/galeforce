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

module.exports = router;

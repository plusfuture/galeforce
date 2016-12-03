var express = require('express');
var passport = require('passport');
var validator = require('validator');
var request = require('request');
var xml2js = require('xml2js');
// var striptags = require('striptags');
var he = require('he');
// var User = require('../models/user');
var Show = require('../models/show');
var parseString = xml2js.parseString;
var router = express.Router();


router.get('/', function(req, res, next) {
    console.log('hi');
    res.render('addShow', {});
});

router.post('/', function(req, res, next) {
    console.log(req.body.showURL);
    var url = validator.trim(req.body.showURL + '');
    var re = /https\:\/\/myanimelist.net\/anime\/[0-9]+\/.+/;
    var validatorOpts = {
        protocols: ['https'],
        require_protocol: true,
        allow_underscores: true,
    };
    if (validator.isURL(url, validatorOpts)) {
        if (url.search(re) != -1) {
            var reShowID = /https\:\/\/myanimelist.net\/anime\/([0-9]+)\//;
            // var showIDMatches = url.match(reShowID);
            var showID = (url.match(reShowID))[1];
            Show.findOne({
                showID: this.showID
            }, function(alreadyExistingShowErr, alreadyExistingShow, showNum) {
                if (showNum > 0) {
                    req.flash('error', 'show already exists');
                    res.redirect('/add-show');
                    return;
                }
                // console.log(showID);
                var showName = url.substring(url.lastIndexOf('/') + 1);
                var paramBeginIdx = showName.search(/\?/);
                if (paramBeginIdx !== -1) {
                    showName = showName.substring(0, paramBeginIdx);
                }
                console.log(showName);
                request.get("https://myanimelist.net/api/anime/search.xml?q=" + showName, {
                    auth: {
                        'user': 'galeforce_arecs',
                        'pass': 'galeforce_add_shows',
                        'sendImmediately': false,
                    }
                }, function(error, response, body) {
                    if (error) {
                        req.flash('error', error.toString());
                        res.redirect('/add-show');
                        return;
                    } else {
                        parseString(body, function(err, result) {
                            if (err) {
                                req.flash('error', error.toString());
                                res.redirect('/add-show');
                                return;
                            } else {
                                if (result.hasOwnProperty('anime')) {
                                    if (result.anime.hasOwnProperty('entry')) {
                                        var showToAdd = result.anime.entry.filter(function(show) {
                                            if (show.id.toString() === showID.toString())
                                                return true;
                                        });
                                        showToAdd = showToAdd[0];
                                        Object.keys(showToAdd).forEach(function(key) {
                                            if (Array.isArray(showToAdd[key])) {
                                                showToAdd[key] = showToAdd[key][0];
                                            }
                                        });
                                        if (showToAdd.hasOwnProperty('synopsis')) {
                                            var s = showToAdd.synopsis;
                                            s = he.decode(s);
                                            showToAdd.synopsis = s;
                                        }
                                        showToAdd.id = parseInt(showToAdd.id, 10);
                                        var imgData;
                                        request.get({
                                            uri: showToAdd.image,
                                            encoding: null
                                        }, function(imgErr, imgResp, imgBody) {
                                            if (!error && response.statusCode == 200) {
                                                imgData = new Buffer(body).toString('base64');
                                            } else {
                                                imgData = 'placeholder.jpg';
                                            }
                                            imgData = showToAdd.image;
                                            (new Show({
                                                showID: showToAdd.id,
                                                nameEnglish: showToAdd.english,
                                                nameRomanized: showToAdd.title,
                                                ratings: [{}],
                                                avgRating: -1,
                                                synopsis: showToAdd.synopsis,
                                                dateStart: showToAdd.start_date,
                                                dateEnd: showToAdd.end_date,
                                                image: imgData
                                            })).save(function(err, show, count) {
                                                if (err) {
                                                    req.flash('error', error.toString());
                                                    res.redirect('/add-show');
                                                    return;
                                                } else {
                                                    Show.findOne({
                                                        showID: showToAdd.id
                                                    }, function(newShowErr, foundShow, count) {
                                                        console.log(foundShow);
                                                        var redirURL = '/shows/' + foundShow.slug;
                                                        res.redirect(redirURL);
                                                    });
                                                }
                                            });

                                        });
                                    }
                                }

                                /*var addErr = addShowToDB(result, showID);
                                if (addErr) {
                                    req.flash('error', error.toString());
                                    res.render('/add-show');
                                } else {
                                    var redirURL = '/shows/' + showName;
                                    res.redirect(redirURL);
                                    console.log('yay');
                                }*/
                            }
                        });
                    }
                });
            });
        } else {
            req.flash('error', 'URL was invalid');
            return res.redirect('/add-show');
        }
    } else {
        req.flash('error', 'URL was invalid');
        return res.redirect('/add-show');
    }
});


function addShowToDB(result, showID) {
    if (result.hasOwnProperty('anime')) {
        if (result.anime.hasOwnProperty('entry')) {
            var showToAdd = result.anime.entry.filter(function(show) {
                if (show.id.toString() === showID.toString())
                    return true;
            });
            showToAdd = showToAdd[0];
            Object.keys(showToAdd).forEach(function(key) {
                if (Array.isArray(showToAdd[key])) {
                    showToAdd[key] = showToAdd[key][0];
                }
            });
            if (showToAdd.hasOwnProperty('synopsis')) {
                var s = showToAdd.synopsis;
                s = he.decode(s);
                showToAdd.synopsis = s;
            }
            showToAdd.id = parseInt(showToAdd.id, 10);
            (new Show({
                showID: showToAdd.id,
                nameEnglish: showToAdd.english,
                nameRomanized: showToAdd.title,
                ratings: [{}],
                avgRating: -1,
                synopsis: showToAdd.synopsis,
                dateStart: showToAdd.start_date,
                dateEnd: showToAdd.end_date
            })).save(function(err, show, count) {
                if (err) {
                    return err.toString();
                } else {
                    return undefined;
                }
            });
        }
    }
}



module.exports = router;
